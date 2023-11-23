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
  LocationI,
  LocationData,
  LogEntry,
  RequireMessage
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
import { Location } from '../ast/Location.js';
import { ParseError } from '../Errors.js';
import { Symbol } from '../ast/SymbolTable.js';

export default class GenerateTargetTraversalWithLocation extends AstTraversal {
  private locationData: LocationData = []; // detailed location data needed for sourcemap creation
  souceMap: string;
  output: Script = [];
  stack: string[] = [];
  consoleLogs: LogEntry[] = [];
  requireMessages: RequireMessage[] = [];

  private scopeDepth = 0;
  private currentFunction: FunctionDefinitionNode;
  private constructorParameterCount: number;

  constructor(private logSymbols: Symbol[]) {
    super();
  }

  private emit(op: OpOrData | OpOrData[], location: LocationI, positionHint?: number): void {
    if (Array.isArray(op)) {
      op.forEach(val => this.output.push(val as Op));
      op.forEach(_ => this.locationData.push([location, positionHint]));
    } else {
      this.output.push(op);
      this.locationData.push([location, positionHint]);
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

  visitSourceFile(node: SourceFileNode): Node {
    node.contract = this.visit(node.contract) as ContractNode;

    // Minimally encode output by going Script -> ASM -> Script
    this.output = asmToScript(scriptToAsm(this.output));

    this.souceMap = generateSourceMap(this.locationData);

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
        const stackCopy = [...this.stack];
        const selectorIndex = this.getStackIndex('$$');
        this.emit(encodeInt(BigInt(selectorIndex)), f.location!);
        if (i === node.functions.length - 1) {
          this.emit(Op.OP_ROLL, f.location!);
          this.removeFromStack(selectorIndex);
        } else {
          this.emit(Op.OP_PICK, f.location!);
        }

        // All functions are if-else statements, except the final one which is
        // enforced with NUMEQUALVERIFY
        this.emit(encodeInt(BigInt(i)), f.location!);
        this.emit(Op.OP_NUMEQUAL, f.location!);
        if (i < node.functions.length - 1) {
          this.emit(Op.OP_IF, f.location!);
        } else {
          this.emit(Op.OP_VERIFY, f.location!);
        }

        f = this.visit(f) as FunctionDefinitionNode;

        if (i < node.functions.length - 1) {
          this.emit(Op.OP_ELSE, f.location!, 1);
        }

        this.stack = [...stackCopy];
        return f;
      });
      for (let i = 0; i < node.functions.length - 1; i += 1) {
        this.emit(Op.OP_ENDIF, node.functions[i+1].location!, 1);
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

  removeFinalVerify(node: Node): void {
    // After EnsureFinalRequireTraversal, we know that the final opcodes are either
    // "OP_VERIFY", "OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP" or "OP_ENDIF"

    const finalOp = this.output.pop() as Op;
    const [location] = this.locationData.pop() as [Location, number?];

    // If the final op is OP_VERIFY and the stack size is less than 4 we remove it from the script
    // - We have the stack size check because it is more efficient to use 2DROP rather than NIP
    //   if >= 4 elements are left (5 including final value) (e.g. 2DROP 2DROP 1 < NIP NIP NIP NIP)
    if (finalOp === Op.OP_VERIFY && this.stack.length < 4) {
      // Since the final value is no longer popped from the stack by OP_VERIFY,
      // we add it back to the stack
      this.pushToStack('(value)');
    } else {
      this.emit(finalOp, location!);

      // At this point there is no verification value left on the stack:
      //  - scoped stack is cleared inside branch ended by OP_ENDIF
      //  - OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP does not leave a verification value
      // so we add OP_1 to the script (indicating success)
      this.emit(Op.OP_1, node.location!, 1);
      this.pushToStack('(value)');
    }
  }

  cleanStack(node: Node): void {
    // Keep final verification value, OP_NIP the other stack values
    const stackSize = this.stack.length;
    for (let i = 0; i < stackSize - 1; i += 1) {
      this.emit(Op.OP_NIP, node.location!, 1);
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
    this.emit(encodeInt(BigInt(index)), node.location!);
    this.emit(Op.OP_ROLL, node.location!);
    this.emit(Op.OP_DROP, node.location!);
    for (let i = 0; i < index - 1; i += 1) {
      this.emit(Op.OP_SWAP, node.location!);
      if (i < index - 2) {
        this.emit(Op.OP_TOALTSTACK, node.location!);
      }
    }
    for (let i = 0; i < index - 2; i += 1) {
      this.emit(Op.OP_FROMALTSTACK, node.location!);
    }
  }

  visitTimeOp(node: TimeOpNode): Node {
    node.expression = this.visit(node.expression);
    this.emit(compileTimeOp(node.timeOp), node.location!);

    // add debug require message
    if (node.message) {
      this.requireMessages.push({
        ip: this.output.length + this.constructorParameterCount - 1,
        line: node.location!.start.line,
        message: node.message
      });
    }

    this.popFromStack();
    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);

    this.emit(Op.OP_VERIFY, node.location!);

    // add debug require message
    if (node.message) {
      this.requireMessages.push({
        ip: this.output.length + this.constructorParameterCount - 1,
        line: node.location!.start.line,
        message: node.message
      });
    }

    this.popFromStack();
    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(Op.OP_IF, node.ifBlock.location!);

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth, node);

    if (node.elseBlock) {
      this.emit(Op.OP_ELSE, node.elseBlock.location!, 1);
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth, node);
    }

    this.emit(Op.OP_ENDIF, node.elseBlock ? node.elseBlock.location! : node.ifBlock.location!, 1);
    this.scopeDepth -= 1;

    return node;
  }

  removeScopedVariables(depthBeforeScope: number, node: Node): void {
    const dropCount = this.stack.length - depthBeforeScope;
    for (let i = 0; i < dropCount; i += 1) {
      this.emit(Op.OP_DROP, node.location!);
      this.popFromStack();
    }
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);

    // Special case for sized bytes cast, since it has another node to traverse
    if (node.size) {
      node.size = this.visit(node.size);
      this.emit(Op.OP_NUM2BIN, node.location!);
      this.popFromStack();
    }

    this.emit(compileCast(node.expression.type as PrimitiveType, node.type), node.location!);
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      return this.visitMultiSig(node);
    }

    node.parameters = this.visitList(node.parameters);

    this.emit(compileGlobalFunction(node.identifier.name as GlobalFunction), node.location!);
    this.popFromStack(node.parameters.length);
    this.pushToStack('(value)');

    return node;
  }

  visitMultiSig(node: FunctionCallNode): Node {
    this.emit(encodeBool(false), node.location!);
    this.pushToStack('(value)');
    node.parameters = this.visitList(node.parameters);
    this.emit(Op.OP_CHECKMULTISIG, node.location!);
    const sigs = node.parameters[0] as ArrayNode;
    const pks = node.parameters[1] as ArrayNode;
    this.popFromStack(sigs.elements.length + pks.elements.length + 3);
    this.pushToStack('(value)');

    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    if (node.identifier.name === Class.LOCKING_BYTECODE_P2PKH) {
      // OP_DUP OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('76a914'), node.location!);
      this.pushToStack('(value)');
      // <pkh>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, node.location!);
      // OP_EQUAL OP_CHECKSIG
      this.emit(hexToBin('88ac'), node.location!);
      this.emit(Op.OP_CAT, node.location!);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH20) {
      // OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('a914'), node.location!);
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, node.location!);
      // OP_EQUAL
      this.emit(hexToBin('87'), node.location!);
      this.emit(Op.OP_CAT, node.location!);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH32) {
      // OP_HASH256 OP_PUSH<32>
      this.emit(hexToBin('aa20'), node.location!);
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, node.location!);
      // OP_EQUAL
      this.emit(hexToBin('87'), node.location!);
      this.emit(Op.OP_CAT, node.location!);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_NULLDATA) {
      // Total script = OP_RETURN (<VarInt> <chunk>)+
      // OP_RETURN
      this.emit(hexToBin('6a'), node.location!);
      this.pushToStack('(value)');
      const { elements } = node.parameters[0] as ArrayNode;
      // <VarInt data chunk size (dynamic)>
      elements.forEach((el) => {
        this.visit(el);
        // Push the element's size (and calculate VarInt)
        this.emit(Op.OP_SIZE, el.location!);
        if (el instanceof HexLiteralNode) {
          // If the argument is a literal, we know its size
          if (el.value.byteLength > 75) {
            this.emit(hexToBin('4c'), el.location!);
            this.emit(Op.OP_SWAP, el.location!);
            this.emit(Op.OP_CAT, el.location!);
          }
        } else {
          // If the argument is not a literal, the script needs to check size
          this.emit(Op.OP_DUP, el.location!);
          this.emit(encodeInt(75n), el.location!);
          this.emit(Op.OP_GREATERTHAN, el.location!);
          this.emit(Op.OP_IF, el.location!);
          this.emit(hexToBin('4c'), el.location!);
          this.emit(Op.OP_SWAP, el.location!);
          this.emit(Op.OP_CAT, el.location!);
          this.emit(Op.OP_ENDIF, el.location!);
        }
        // Concat size and arguments
        this.emit(Op.OP_SWAP, el.location!);
        this.emit(Op.OP_CAT, el.location!);
        this.emit(Op.OP_CAT, el.location!);
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

    if (node.index === 0) {
      this.emit(Op.OP_DROP, node.location!);
      this.popFromStack();
    } else if (node.index === 1) {
      this.emit(Op.OP_NIP, node.location!);
      this.nipFromStack();
    }

    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    const isNumeric = resultingType(node.left.type, node.right.type) === PrimitiveType.INT;
    this.emit(compileBinaryOp(node.operator, isNumeric), node.location!);
    this.popFromStack(2);
    this.pushToStack('(value)');
    if (node.operator === BinaryOperator.SPLIT) this.pushToStack('(value)');
    return node;
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);
    this.emit(compileUnaryOp(node.operator), node.location!);
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    this.emit(compileNullaryOp(node.operator), node.location!);
    this.pushToStack('(value)');
    return node;
  }

  visitArray(node: ArrayNode): Node {
    node.elements = this.visitList(node.elements);
    this.emit(encodeInt(BigInt(node.elements.length)), node.location!);
    this.pushToStack('(value)');
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const stackIndex = this.getStackIndex(node.name);
    this.emit(encodeInt(BigInt(stackIndex)), node.location!);

    // If the final use is inside an if-statement, we still OP_PICK it
    // We do this so that there's no difference in stack depths between execution paths
    if (this.isOpRoll(node)) {
      this.emit(Op.OP_ROLL, node.location!);
      this.removeFromStack(stackIndex);
    } else {
      this.emit(Op.OP_PICK, node.location!);
    }

    this.pushToStack('(value)');
    return node;
  }

  isOpRoll(node: IdentifierNode): boolean {
    return this.currentFunction.opRolls.get(node.name) === node && this.scopeDepth === 0;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    this.emit(encodeBool(node.value), node.location!);
    this.pushToStack('(value)');
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.emit(encodeInt(node.value), node.location!);
    this.pushToStack('(value)');
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    this.emit(encodeString(node.value), node.location!);
    this.pushToStack('(value)');
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.emit(node.value, node.location!);
    this.pushToStack('(value)');
    return node;
  }

  visitConsoleStatement(node: ConsoleStatementNode): Node {
    // instruction pointer is the count of emitted opcodes + number of constructor data pushes
    const ip = this.output.length + this.constructorParameterCount;

    const line = node.location!.start.line;

    // check if log entry exists for the instruction pointer, create if not
    let index = this.consoleLogs.findIndex((entry: LogEntry) => entry.ip === ip);
    if (index === -1) {
      index = this.consoleLogs.push({
        ip,
        line,
        data: []
      }) - 1;
    };

    node.parameters.forEach((parameter: ConsoleParameterNode) => {
      if (parameter.identifier) {
        // we look for all symbols with identifier name
        // then take the first which is declared in the nearest code block
        const symbol = this.logSymbols.
          filter(symbol => symbol.name === parameter.identifier).
          sort((a, b) => b.definition?.location?.start.line! - a.definition?.location?.start.line!)[0];

        if (!symbol) {
          throw new ParseError(`Undefined reference to symbol ${parameter.identifier} at ${parameter.location?.start}`);
        }

        const stackIndex = this.getStackIndex(parameter.identifier);
        this.consoleLogs[index].data.push({
          stackIndex,
          type: typeof symbol.type === "string" ? symbol.type : symbol.toString(),
        })
      } else if (parameter.message) {
        this.consoleLogs[index].data.push(parameter.message);
      }
    });

    return node;
  }
}
