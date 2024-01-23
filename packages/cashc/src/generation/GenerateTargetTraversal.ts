import { hexToBin } from '@bitauth/libauth';
import {
  asmToScript,
  encodeBool,
  encodeInt,
  encodeString,
  Op,
  OpOrData,
  PrimitiveType,
  resultingType,
  Script,
  scriptToAsm,
  generateSourceMap,
  FullLocationData,
  LogEntry,
  RequireMessage,
  PositionHint,
  SingleLocationData,
} from '@cashscript/utils';
import {
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  AssignNode,
  IdentifierNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  BlockNode,
  TimeOpNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  SourceFileNode,
  Node,
  InstantiationNode,
  TupleAssignmentNode,
  NullaryOpNode,
  ConsoleParameterNode,
  ConsoleStatementNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { GlobalFunction, Class } from '../ast/Globals.js';
import { BinaryOperator } from '../ast/Operator.js';
import {
  compileBinaryOp,
  compileCast,
  compileGlobalFunction,
  compileNullaryOp,
  compileTimeOp,
  compileUnaryOp,
} from './utils.js';

export default class GenerateTargetTraversalWithLocation extends AstTraversal {
  private locationData: FullLocationData = []; // detailed location data needed for sourcemap creation
  sourceMap: string;
  output: Script = [];
  stack: string[] = [];
  consoleLogs: LogEntry[] = [];
  requireMessages: RequireMessage[] = [];

  private scopeDepth = 0;
  private currentFunction: FunctionDefinitionNode;
  private constructorParameterCount: number;

  private emit(op: OpOrData | OpOrData[], locationData: SingleLocationData): void {
    if (Array.isArray(op)) {
      op.forEach((element) => this.output.push(element as Op));
      op.forEach(() => this.locationData.push(locationData));
    } else {
      this.output.push(op);
      this.locationData.push(locationData);
    }
  }

  private pushToStack(value: string, pushToBottom?: boolean): void {
    if (pushToBottom) {
      this.stack.push(value);
    } else {
      this.stack.unshift(value);
    }
  }

  private popFromStack(count: number = 1): void {
    for (let i = 0; i < count; i += 1) {
      this.stack.shift();
    }
  }

  private removeFromStack(i: number): void {
    this.stack.splice(i, 1);
  }

  private nipFromStack(): void {
    this.stack.splice(1, 1);
  }

  private getStackIndex(value: string): number {
    const index = this.stack.indexOf(value);
    if (index === -1) throw new Error(); // Should not happen
    return index;
  }

  private getCurrentInstructionPointer(): number {
    // instruction pointer is the count of emitted opcodes + number of constructor data pushes
    return this.output.length + this.constructorParameterCount;
  }

  visitSourceFile(node: SourceFileNode): Node {
    node.contract = this.visit(node.contract) as ContractNode;

    // Minimally encode output by going Script -> ASM -> Script
    this.output = asmToScript(scriptToAsm(this.output));

    this.sourceMap = generateSourceMap(this.locationData);

    return node;
  }

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    this.constructorParameterCount = node.parameters.length;
    if (node.functions.length === 1) {
      node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    } else {
      this.pushToStack('$$', true);
      node.functions = node.functions.map((f, i) => {
        const locationData = { location: f.location };

        const stackCopy = [...this.stack];
        const selectorIndex = this.getStackIndex('$$');

        this.emit(encodeInt(BigInt(selectorIndex)), locationData);
        if (i === node.functions.length - 1) {
          this.emit(Op.OP_ROLL, locationData);
          this.removeFromStack(selectorIndex);
        } else {
          this.emit(Op.OP_PICK, locationData);
        }

        // All functions are if-else statements, except the final one which is
        // enforced with NUMEQUALVERIFY
        this.emit(encodeInt(BigInt(i)), locationData);
        this.emit(Op.OP_NUMEQUAL, locationData);
        if (i < node.functions.length - 1) {
          this.emit(Op.OP_IF, locationData);
        } else {
          this.emit(Op.OP_VERIFY, locationData);
        }

        f = this.visit(f) as FunctionDefinitionNode;

        if (i < node.functions.length - 1) {
          this.emit(Op.OP_ELSE, { ...locationData, positionHint: PositionHint.END });
        }

        this.stack = [...stackCopy];
        return f;
      });
      for (let i = 0; i < node.functions.length - 1; i += 1) {
        this.emit(Op.OP_ENDIF, { location: node.location, positionHint: PositionHint.END });
      }
    }

    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.currentFunction = node;

    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body) as BlockNode;

    this.removeFinalVerify(node.body);
    this.cleanStack(node.body);

    return node;
  }

  removeFinalVerify(functionBodyNode: Node): void {
    // After EnsureFinalRequireTraversal, we know that the final opcodes are either
    // "OP_VERIFY", "OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP" or "OP_ENDIF"

    const finalOp = this.output.pop() as Op;
    const { location } = this.locationData.pop()!;

    // If the final op is OP_VERIFY and the stack size is less than 4 we remove it from the script
    // - We have the stack size check because it is more efficient to use 2DROP rather than NIP
    //   if >= 4 elements are left (5 including final value) (e.g. 2DROP 2DROP 1 < NIP NIP NIP NIP)
    if (finalOp === Op.OP_VERIFY && this.stack.length < 4) {
      // Since the final value is no longer popped from the stack by OP_VERIFY,
      // we add it back to the stack
      this.pushToStack('(value)');
    } else {
      this.emit(finalOp, { location, positionHint: PositionHint.END });

      // At this point there is no verification value left on the stack:
      //  - scoped stack is cleared inside branch ended by OP_ENDIF
      //  - OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP does not leave a verification value
      // so we add OP_1 to the script (indicating success)
      this.emit(Op.OP_1, { location: functionBodyNode.location, positionHint: PositionHint.END });
      this.pushToStack('(value)');
    }
  }

  cleanStack(functionBodyNode: Node): void {
    // Keep final verification value, OP_NIP the other stack values
    const stackSize = this.stack.length;
    for (let i = 0; i < stackSize - 1; i += 1) {
      this.emit(Op.OP_NIP, { location: functionBodyNode.location, positionHint: PositionHint.END });
      this.nipFromStack();
    }
  }

  visitParameter(node: ParameterNode): Node {
    this.pushToStack(node.name, true);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);
    this.popFromStack();
    this.pushToStack(node.name);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    node.tuple = this.visit(node.tuple);
    this.popFromStack(2);
    this.pushToStack(node.var1.name);
    this.pushToStack(node.var2.name);
    return node;
  }

  visitAssign(node: AssignNode): Node {
    node.expression = this.visit(node.expression);
    if (this.scopeDepth > 0) {
      this.emitReplace(this.getStackIndex(node.identifier.name), node);
      this.popFromStack();
    } else {
      this.popFromStack();
      this.pushToStack(node.identifier.name);
    }
    return node;
  }

  // This algorithm can be optimised for hardcoded depths
  // See thesis for explanation
  emitReplace(index: number, node: Node): void {
    const locationData = { location: node.location };

    this.emit(encodeInt(BigInt(index)), locationData);
    this.emit(Op.OP_ROLL, locationData);
    this.emit(Op.OP_DROP, locationData);
    for (let i = 0; i < index - 1; i += 1) {
      this.emit(Op.OP_SWAP, locationData);
      if (i < index - 2) {
        this.emit(Op.OP_TOALTSTACK, locationData);
      }
    }
    for (let i = 0; i < index - 2; i += 1) {
      this.emit(Op.OP_FROMALTSTACK, locationData);
    }
  }

  visitTimeOp(node: TimeOpNode): Node {
    // const countBefore = this.output.length;
    node.expression = this.visit(node.expression);
    this.emit(compileTimeOp(node.timeOp), { location: node.location, positionHint: PositionHint.END });

    // add debug require message
    if (node.message) {
      this.requireMessages.push({
        ip: this.getCurrentInstructionPointer() - 1, // TODO: Why is there a minus 1 here?
        line: node.location.start.line,
        message: node.message,
      });
    }

    this.popFromStack();
    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);

    this.emit(Op.OP_VERIFY, { location: node.location, positionHint: PositionHint.END });

    // add debug require message
    if (node.message) {
      this.requireMessages.push({
        ip: this.getCurrentInstructionPointer() - 1, // TODO: Why is there a minus 1 here?
        line: node.location.start.line,
        message: node.message,
      });
    }

    this.popFromStack();
    return node;
  }

  visitConsoleStatement(node: ConsoleStatementNode): Node {
    const ip = this.getCurrentInstructionPointer();
    const { line } = node.location.start;

    // TODO: refactor to use a map instead of array (also in the artifact and other places where console logs and
    // require statements are used)
    // check if log entry exists for the instruction pointer, create if not
    // TODO: Do we really want to merge different console logs at the same instruction pointer?
    let index = this.consoleLogs.findIndex((entry: LogEntry) => entry.ip === ip);
    if (index === -1) {
      index = this.consoleLogs.push({ ip, line, data: [] }) - 1;
    }

    node.parameters.forEach((parameter: ConsoleParameterNode) => {
      if (parameter instanceof IdentifierNode) {
        const symbol = parameter.definition!;
        const stackIndex = this.getStackIndex(parameter.name);
        const type = typeof symbol.type === 'string' ? symbol.type : symbol.toString();
        this.consoleLogs[index].data.push({ stackIndex, type });
      } else {
        this.consoleLogs[index].data.push(parameter.toString());
      }
    });

    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(Op.OP_IF, { location: node.ifBlock.location });

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth, node);

    if (node.elseBlock) {
      // TODO: Why would the *start* of the else block be PositionHint.END? Is it because it is also the end of
      // the if block?
      this.emit(Op.OP_ELSE, { location: node.elseBlock.location, positionHint: PositionHint.END });
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth, node);
    }

    const endLocationData = {
      location: node.elseBlock ? node.elseBlock.location : node.ifBlock.location,
      positionHint: PositionHint.END,
    };

    this.emit(Op.OP_ENDIF, endLocationData);
    this.scopeDepth -= 1;

    return node;
  }

  removeScopedVariables(depthBeforeScope: number, node: Node): void {
    const dropCount = this.stack.length - depthBeforeScope;
    for (let i = 0; i < dropCount; i += 1) {
      this.emit(Op.OP_DROP, { location: node.location });
      this.popFromStack();
    }
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);

    // Special case for sized bytes cast, since it has another node to traverse
    if (node.size) {
      node.size = this.visit(node.size);
      this.emit(Op.OP_NUM2BIN, { location: node.location });
      this.popFromStack();
    }

    this.emit(
      compileCast(node.expression.type as PrimitiveType, node.type),
      { location: node.location, positionHint: PositionHint.END },
    );
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      return this.visitMultiSig(node);
    }

    node.parameters = this.visitList(node.parameters);

    this.emit(
      compileGlobalFunction(node.identifier.name as GlobalFunction),
      { location: node.location, positionHint: PositionHint.END },
    );
    this.popFromStack(node.parameters.length);
    this.pushToStack('(value)');

    return node;
  }

  visitMultiSig(node: FunctionCallNode): Node {
    this.emit(encodeBool(false), { location: node.location });
    this.pushToStack('(value)');
    node.parameters = this.visitList(node.parameters);
    this.emit(Op.OP_CHECKMULTISIG, { location: node.location, positionHint: PositionHint.END });
    const sigs = node.parameters[0] as ArrayNode;
    const pks = node.parameters[1] as ArrayNode;
    this.popFromStack(sigs.elements.length + pks.elements.length + 3);
    this.pushToStack('(value)');

    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    const nodeLocationData = { location: node.location };

    if (node.identifier.name === Class.LOCKING_BYTECODE_P2PKH) {
      // OP_DUP OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('76a914'), nodeLocationData);
      this.pushToStack('(value)');
      // <pkh>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, nodeLocationData);
      // OP_EQUAL OP_CHECKSIG
      this.emit(hexToBin('88ac'), nodeLocationData);
      this.emit(Op.OP_CAT, nodeLocationData);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH20) {
      // OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('a914'), nodeLocationData);
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, nodeLocationData);
      // OP_EQUAL
      this.emit(hexToBin('87'), nodeLocationData);
      this.emit(Op.OP_CAT, nodeLocationData);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH32) {
      // OP_HASH256 OP_PUSH<32>
      this.emit(hexToBin('aa20'), nodeLocationData);
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, nodeLocationData);
      // OP_EQUAL
      this.emit(hexToBin('87'), nodeLocationData);
      this.emit(Op.OP_CAT, nodeLocationData);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_NULLDATA) {
      // Total script = OP_RETURN (<VarInt> <chunk>)+
      // OP_RETURN
      this.emit(hexToBin('6a'), nodeLocationData);
      this.pushToStack('(value)');
      const { elements } = node.parameters[0] as ArrayNode;
      // <VarInt data chunk size (dynamic)>
      elements.forEach((element) => {
        const elementLocationData = { location: element.location };
        this.visit(element);
        // Push the element's size (and calculate VarInt)
        this.emit(Op.OP_SIZE, elementLocationData);
        if (element instanceof HexLiteralNode) {
          // If the argument is a literal, we know its size
          if (element.value.byteLength > 75) {
            this.emit(hexToBin('4c'), elementLocationData);
            this.emit(Op.OP_SWAP, elementLocationData);
            this.emit(Op.OP_CAT, elementLocationData);
          }
        } else {
          // If the argument is not a literal, the script needs to check size
          this.emit(Op.OP_DUP, elementLocationData);
          this.emit(encodeInt(75n), elementLocationData);
          this.emit(Op.OP_GREATERTHAN, elementLocationData);
          this.emit(Op.OP_IF, elementLocationData);
          this.emit(hexToBin('4c'), elementLocationData);
          this.emit(Op.OP_SWAP, elementLocationData);
          this.emit(Op.OP_CAT, elementLocationData);
          this.emit(Op.OP_ENDIF, elementLocationData);
        }
        // Concat size and arguments
        this.emit(Op.OP_SWAP, elementLocationData);
        this.emit(Op.OP_CAT, elementLocationData);
        this.emit(Op.OP_CAT, elementLocationData);
        this.popFromStack();
      });
      this.popFromStack();
    } else {
      throw new Error(); // Should not happen
    }

    this.pushToStack('(value)');

    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);

    const locationData = { location: node.location, positionHint: PositionHint.END };

    if (node.index === 0) {
      this.emit(Op.OP_DROP, locationData);
      this.popFromStack();
    } else if (node.index === 1) {
      this.emit(Op.OP_NIP, locationData);
      this.nipFromStack();
    }

    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    const isNumeric = resultingType(node.left.type, node.right.type) === PrimitiveType.INT;
    this.emit(compileBinaryOp(node.operator, isNumeric), { location: node.location, positionHint: PositionHint.END });
    this.popFromStack(2);
    this.pushToStack('(value)');
    if (node.operator === BinaryOperator.SPLIT) this.pushToStack('(value)');
    return node;
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);
    this.emit(compileUnaryOp(node.operator), { location: node.location });
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    this.emit(compileNullaryOp(node.operator), { location: node.location });
    this.pushToStack('(value)');
    return node;
  }

  visitArray(node: ArrayNode): Node {
    node.elements = this.visitList(node.elements);
    this.emit(encodeInt(BigInt(node.elements.length)), { location: node.location, positionHint: PositionHint.END });
    this.pushToStack('(value)');
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const stackIndex = this.getStackIndex(node.name);
    this.emit(encodeInt(BigInt(stackIndex)), { location: node.location });

    // If the final use is inside an if-statement, we still OP_PICK it
    // We do this so that there's no difference in stack depths between execution paths
    if (this.isOpRoll(node)) {
      this.emit(Op.OP_ROLL, { location: node.location });
      this.removeFromStack(stackIndex);
    } else {
      this.emit(Op.OP_PICK, { location: node.location });
    }

    this.pushToStack('(value)');
    return node;
  }

  isOpRoll(node: IdentifierNode): boolean {
    return this.currentFunction.opRolls.get(node.name) === node && this.scopeDepth === 0;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    this.emit(encodeBool(node.value), { location: node.location });
    this.pushToStack('(value)');
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.emit(encodeInt(node.value), { location: node.location });
    this.pushToStack('(value)');
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    this.emit(encodeString(node.value), { location: node.location });
    this.pushToStack('(value)');
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.emit(node.value, { location: node.location });
    this.pushToStack('(value)');
    return node;
  }
}
