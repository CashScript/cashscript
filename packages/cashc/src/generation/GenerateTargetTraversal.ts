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
  RequireStatement,
  PositionHint,
  SingleLocationData,
  StackItem,
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
  requires: RequireStatement[] = [];
  finalStackUsage: Record<string, StackItem> = {};

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

  private getStackIndex(value: string, canBeUndefined?: boolean): number {
    const index = this.stack.indexOf(value);

    if (index === -1 && !canBeUndefined) {
      throw new Error(`Expected variable '${value}' does not exist on the stack`);
    }

    return index;
  }

  private getMostRecentInstructionPointer(): number {
    // instruction pointer is the count of emitted opcodes + number of constructor data pushes (minus 1 for 0-indexing)
    return this.output.length + this.constructorParameterCount - 1;
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

    // Keep track of constructor parameter count for instructor pointer calculation
    this.constructorParameterCount = node.parameters.length;

    if (node.functions.length === 1) {
      node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    } else {
      this.pushToStack('$$', true);
      node.functions = node.functions.map((f, i) => {
        const locationData = { location: f.location, positionHint: PositionHint.START };

        const stackCopy = [...this.stack];
        const selectorIndex = this.getStackIndex('$$');

        this.emit(encodeInt(BigInt(selectorIndex)), locationData);
        if (i === node.functions.length - 1) {
          this.emit(Op.OP_ROLL, locationData);
          this.removeFromStack(selectorIndex);
        } else {
          this.emit(Op.OP_PICK, locationData);
        }

        // All functions are if-else statements, except the final one which is enforced with NUMEQUALVERIFY
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

    this.removeFinalVerifyFromFunction(node.body);
    this.cleanStack(node.body);

    return node;
  }

  removeFinalVerifyFromFunction(functionBodyNode: Node): void {
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
      //  - OP_VERIFY does not leave a verification value
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
    const locationData = { location: node.location, positionHint: PositionHint.END };

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

    this.requires.push({
      // We're removing 1 from the IP because the error message needs to match the OP_XXX_VERIFY, not the OP_DROP that
      // is emitted directly after
      ip: this.getMostRecentInstructionPointer() - 1,
      line: node.location.start.line,
      message: node.message,
    });

    this.popFromStack();
    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);

    this.emit(Op.OP_VERIFY, { location: node.location, positionHint: PositionHint.END });

    this.requires.push({
      ip: this.getMostRecentInstructionPointer(),
      line: node.location.start.line,
      message: node.message,
    });

    this.popFromStack();
    return node;
  }

  visitConsoleStatement(node: ConsoleStatementNode): Node {
    // We add a plus 1 to the most recent instruction pointer, because we want to log the state
    // of the stack *after* the most recent instruction has been executed
    const ip = this.getMostRecentInstructionPointer() + 1;
    const { line } = node.location.start;

    const data = node.parameters.map((parameter: ConsoleParameterNode) => {
      if (parameter instanceof IdentifierNode) {
        const symbol = parameter.definition!;

        // If the variable is not on the stack, then we add the final stack usage to the console log
        const stackIndex = this.getStackIndex(parameter.name, true);
        if (stackIndex === -1) {
          if (!this.finalStackUsage[parameter.name]) {
            throw new Error(`Expected variable '${parameter.name}' does not exist on the stack or in final stack usage`);
          }
          return this.finalStackUsage[parameter.name];
        }

        // If the variable is on the stack, we add the stack index and type to the console log
        const type = typeof symbol.type === 'string' ? symbol.type : symbol.toString();
        return { stackIndex, type, ip };
      }

      return parameter.toString();
    });

    this.consoleLogs.push({ ip, line, data });

    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(Op.OP_IF, { location: node.ifBlock.location, positionHint: PositionHint.START });

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth, node.ifBlock);

    if (node.elseBlock) {
      this.emit(Op.OP_ELSE, { location: node.elseBlock.location, positionHint: PositionHint.START });
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth, node.elseBlock);
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
      this.emit(Op.OP_DROP, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack();
    }
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);

    // Special case for sized bytes cast, since it has another node to traverse
    if (node.size) {
      node.size = this.visit(node.size);
      this.emit(Op.OP_NUM2BIN, { location: node.location, positionHint: PositionHint.END });
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
    this.emit(encodeBool(false), { location: node.location, positionHint: PositionHint.START });
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

    if (node.identifier.name === Class.LOCKING_BYTECODE_P2PKH) {
      // OP_DUP OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('76a914'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      // <pkh>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      // OP_EQUAL OP_CHECKSIG
      this.emit(hexToBin('88ac'), { location: node.location, positionHint: PositionHint.END });
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH20) {
      // OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('a914'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      // OP_EQUAL
      this.emit(hexToBin('87'), { location: node.location, positionHint: PositionHint.END });
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH32) {
      // OP_HASH256 OP_PUSH<32>
      this.emit(hexToBin('aa20'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      // OP_EQUAL
      this.emit(hexToBin('87'), { location: node.location, positionHint: PositionHint.END });
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_NULLDATA) {
      // Total script = OP_RETURN (<VarInt> <chunk>)+
      // OP_RETURN
      this.emit(hexToBin('6a'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      const { elements } = node.parameters[0] as ArrayNode;
      // <VarInt data chunk size (dynamic)>
      elements.forEach((element) => {
        this.visit(element);

        // The element comes first, then all other opcodes have PositionHint.END because they come after the element
        const elementLocationData = { location: element.location, positionHint: PositionHint.END };

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
    this.emit(compileUnaryOp(node.operator), { location: node.location, positionHint: PositionHint.END });
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    this.emit(compileNullaryOp(node.operator), { location: node.location, positionHint: PositionHint.START });
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
    this.emit(encodeInt(BigInt(stackIndex)), { location: node.location, positionHint: PositionHint.START });

    // If the final use is inside an if-statement, we still OP_PICK it
    // We do this so that there's no difference in stack depths between execution paths
    if (this.isOpRoll(node)) {
      const symbol = node.definition!;
      this.finalStackUsage[node.name] = {
        type:  typeof symbol.type === 'string' ? symbol.type : symbol.toString(),
        stackIndex,
        ip: this.getMostRecentInstructionPointer(),
      };

      this.emit(Op.OP_ROLL, { location: node.location, positionHint: PositionHint.START });
      this.removeFromStack(stackIndex);
    } else {
      this.emit(Op.OP_PICK, { location: node.location, positionHint: PositionHint.START });
    }

    this.pushToStack('(value)');
    return node;
  }

  isOpRoll(node: IdentifierNode): boolean {
    return this.currentFunction.opRolls.get(node.name) === node && this.scopeDepth === 0;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    this.emit(encodeBool(node.value), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.emit(encodeInt(node.value), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    this.emit(encodeString(node.value), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.emit(node.value, { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }
}
