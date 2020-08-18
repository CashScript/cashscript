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
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import { GlobalFunction, PreimageField, Class } from '../ast/Globals';
import { resultingType, PrimitiveType } from '../ast/Type';
import {
  Op,
  OpOrData,
  Script,
  toOps,
} from './Script';
import { Data } from '../util';
import { PreimageParts } from './preimage';
import { BinaryOperator } from '../ast/Operator';

export default class GenerateTargetTraversal extends AstTraversal {
  output: Script = [];
  stack: string[] = [];

  private scopeDepth = 0;
  private currentFunction: FunctionDefinitionNode;
  private isCheckSigVerify = false;
  private covenantNeedsToBeVerified = false;

  private emit(op: OpOrData | OpOrData[]): void {
    if (Array.isArray(op)) {
      this.output.push(...op);
    } else {
      this.output.push(op);
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
    this.output = Data.asmToScript(Data.scriptToAsm(this.output));

    return node;
  }

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    if (node.functions.length === 1) {
      node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    } else {
      this.pushToStack('$$', true);
      node.functions = node.functions.map((f, i) => {
        const stackCopy = [...this.stack];
        const selectorIndex = this.getStackIndex('$$');
        this.emit(Data.encodeInt(selectorIndex));
        if (i === node.functions.length - 1) {
          this.emit(Op.OP_ROLL);
          this.removeFromStack(selectorIndex);
        } else {
          this.emit(Op.OP_PICK);
        }

        // All functions are if-else statements, except the final one which is
        // enforced with NUMEQUALVERIFY
        this.emit(Data.encodeInt(i));
        this.emit(Op.OP_NUMEQUAL);
        if (i < node.functions.length - 1) {
          this.emit(Op.OP_IF);
        } else {
          this.emit(Op.OP_VERIFY);
        }

        f = this.visit(f) as FunctionDefinitionNode;

        if (i < node.functions.length - 1) {
          this.emit(Op.OP_ELSE);
        }

        this.stack = [...stackCopy];
        return f;
      });
      for (let i = 0; i < node.functions.length - 1; i += 1) {
        this.emit(Op.OP_ENDIF);
      }
    }

    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.currentFunction = node;

    if (node.preimageFields.length > 0) {
      this.covenantNeedsToBeVerified = true;
      this.decodePreimage(node.preimageFields);
    }

    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body) as BlockNode;

    // Remove final OP_VERIFY
    // If the final opcodes are OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP
    // Or if the final opcode is OP_ENDIF
    // Or if the remaining stack size >=5 (2DROP 2DROP 1 < NIP NIP NIP NIP)
    //   then push it back to the script, and push OP_TRUE (OP_1) to the stack
    const finalOp = this.output.pop();
    this.pushToStack('(value)');
    if (finalOp === Op.OP_DROP || finalOp === Op.OP_ENDIF || (finalOp && this.stack.length >= 5)) {
      this.emit(finalOp);
      this.emit(Op.OP_1);
    }
    this.cleanStack();
    return node;
  }

  decodePreimage(fields: PreimageField[]): void {
    // Preimage is first arg after selector
    this.pushToStack('$preimage', true);
    this.emit(Data.encodeInt(this.getStackIndex('$preimage')));
    this.emit(Op.OP_PICK);

    const cuts = {
      fromStart: 0,
      fromEnd: 0,
    };

    // Fields before bytecode needs to be cut from the front
    const beforeBytecode = [
      PreimageField.VERSION, PreimageField.HASHPREVOUTS,
      PreimageField.HASHSEQUENCE, PreimageField.OUTPOINT,
    ].filter(field => fields.includes(field));

    beforeBytecode.forEach((field) => {
      const part = PreimageParts[field];
      const start = part.fromStart - cuts.fromStart;
      if (start !== 0) {
        this.emit(Data.encodeInt(start));
        this.emit(Op.OP_SPLIT);
        this.emit(Op.OP_NIP);
      }

      this.emit(Data.encodeInt(part.size));
      this.emit(Op.OP_SPLIT);

      this.pushToStack(field);
      cuts.fromStart = part.fromStart + part.size;
    });

    // Bytecode potentially needs a cut from the front and from the back
    if (fields.includes(PreimageField.BYTECODE)) {
      const part = PreimageParts[PreimageField.BYTECODE];
      const start = part.fromStart - cuts.fromStart;

      // Always add this split, since the VarInt needs to be cut off any way
      // See ReplaceBytecodeNop.ts
      this.emit(Op.OP_NOP);
      this.emit(Data.encodeInt(start));
      this.emit(Op.OP_SPLIT);
      this.emit(Op.OP_NIP);

      this.emit(Op.OP_SIZE);
      this.emit(Data.encodeInt(part.size));
      this.emit(Op.OP_SUB);
      this.emit(Op.OP_SPLIT);

      this.pushToStack(PreimageField.BYTECODE);
      cuts.fromStart = 0;
      cuts.fromEnd = part.size;
    }

    // Fields after bytecode potentially need a cut from the back,
    // after which they go back to cutting from the front
    const afterBytecode = [
      PreimageField.VALUE, PreimageField.SEQUENCE, PreimageField.HASHOUTPUTS,
      PreimageField.LOCKTIME, PreimageField.HASHTYPE,
    ].filter(field => fields.includes(field));

    afterBytecode.forEach((field) => {
      const part = PreimageParts[field];
      const start = part.fromStart - cuts.fromStart;
      const end = part.fromEnd - cuts.fromEnd;

      if (end > 0) {
        this.emit(Op.OP_SIZE);
        this.emit(Data.encodeInt(end));
        this.emit(Op.OP_SUB);
        this.emit(Op.OP_SPLIT);
        this.emit(Op.OP_NIP);
      } else if (start !== 0) {
        this.emit(Data.encodeInt(start));
        this.emit(Op.OP_SPLIT);
        this.emit(Op.OP_NIP);
      }

      this.pushToStack(field);
      if (field === PreimageField.HASHTYPE) return;

      this.emit(Data.encodeInt(part.size));
      this.emit(Op.OP_SPLIT);

      cuts.fromStart = part.fromStart + part.size;
      cuts.fromEnd = part.fromEnd - part.size;
    });

    // Drop remainder
    if (!fields.includes(PreimageField.HASHTYPE)) {
      this.emit(Op.OP_DROP);
    }
  }

  cleanStack(): void {
    // Keep final verification value, OP_NIP the other stack values
    const stackSize = this.stack.length;
    for (let i = 0; i < stackSize - 1; i += 1) {
      this.emit(Op.OP_NIP);
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

  visitAssign(node: AssignNode): Node {
    node.expression = this.visit(node.expression);
    if (this.scopeDepth > 0) {
      this.emitReplace(this.getStackIndex(node.identifier.name));
      this.popFromStack();
    } else {
      this.popFromStack();
      this.pushToStack(node.identifier.name);
    }
    return node;
  }

  // This algorithm can be optimised for hardcoded depths
  // See thesis for explanation
  emitReplace(index: number): void {
    this.emit(Data.encodeInt(index));
    this.emit(Op.OP_ROLL);
    this.emit(Op.OP_DROP);
    for (let i = 0; i < index - 1; i += 1) {
      this.emit(Op.OP_SWAP);
      if (i < index - 2) {
        this.emit(Op.OP_TOALTSTACK);
      }
    }
    for (let i = 0; i < index - 2; i += 1) {
      this.emit(Op.OP_FROMALTSTACK);
    }
  }

  visitTimeOp(node: TimeOpNode): Node {
    node.expression = this.visit(node.expression);
    this.emit(toOps.fromTimeOp(node.timeOp));
    this.popFromStack();
    return node;
  }

  visitRequire(node: RequireNode): Node {
    if (this.containsCheckSig(node)) this.isCheckSigVerify = true;
    node.expression = this.visit(node.expression);
    this.isCheckSigVerify = false;

    this.emit(Op.OP_VERIFY);
    this.popFromStack();
    return node;
  }

  containsCheckSig(node: RequireNode): boolean {
    if (!(node.expression instanceof FunctionCallNode)) return false;
    if (node.expression.identifier.name !== GlobalFunction.CHECKSIG) return false;
    return true;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(Op.OP_IF);

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth);

    if (node.elseBlock) {
      this.emit(Op.OP_ELSE);
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth);
    }

    this.emit(Op.OP_ENDIF);
    this.scopeDepth -= 1;

    return node;
  }

  removeScopedVariables(depthBeforeScope: number): void {
    const dropCount = this.stack.length - depthBeforeScope;
    for (let i = 0; i < dropCount; i += 1) {
      this.emit(Op.OP_DROP);
      this.popFromStack();
    }
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);

    // Special case for sized bytes cast, since it has another node to traverse
    if (node.size) {
      node.size = this.visit(node.size);
      this.emit(Op.OP_NUM2BIN);
      this.popFromStack();
    }

    this.emit(toOps.fromCast(node.expression.type as PrimitiveType, node.type));
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      return this.visitMultiSig(node);
    }

    node.parameters = this.visitList(node.parameters);

    if (this.needsToVerifyCovenant(node)) this.verifyCovenant();

    this.emit(toOps.fromFunction(node.identifier.name as GlobalFunction));
    this.popFromStack(node.parameters.length);
    this.pushToStack('(value)');

    return node;
  }

  visitMultiSig(node: FunctionCallNode): Node {
    this.emit(Data.encodeBool(false));
    node.parameters = this.visitList(node.parameters);
    this.emit(Op.OP_CHECKMULTISIG);
    const sigs = node.parameters[0] as ArrayNode;
    const pks = node.parameters[1] as ArrayNode;
    this.popFromStack(sigs.elements.length + pks.elements.length + 2);
    this.pushToStack('(value)');

    return node;
  }

  needsToVerifyCovenant(node: FunctionCallNode): boolean {
    if (node.identifier.name !== GlobalFunction.CHECKSIG) return false;
    if (!this.isCheckSigVerify) return false;
    if (!this.covenantNeedsToBeVerified) return false;
    if (this.scopeDepth > 0) return false;
    return true;
  }

  verifyCovenant(): void {
    // Duplicate [s, pk] that are on stack
    this.emit(Op.OP_2DUP);
    this.pushToStack('(value)');
    this.pushToStack('(value)');

    // Turn sig into datasig
    this.emit([Op.OP_SWAP, Op.OP_SIZE, Op.OP_1SUB, Op.OP_SPLIT, Op.OP_DROP]);

    // Retrieve preimage from stack and hash it
    const preimageIndex = this.getStackIndex('$preimage');
    this.removeFromStack(preimageIndex);
    this.emit(Data.encodeInt(preimageIndex));
    this.emit(Op.OP_ROLL);
    this.emit(Op.OP_SHA256);
    this.pushToStack('(value)');

    // Order arguments and perform OP_CHECKDATASIGVERIFY
    this.emit(Op.OP_ROT);
    this.emit(Op.OP_CHECKDATASIGVERIFY);
    this.popFromStack(3);

    this.covenantNeedsToBeVerified = false;
  }

  visitInstantiation(node: InstantiationNode): Node {
    if (node.identifier.name === Class.OUTPUT_P2PKH) {
      // <output amount>
      this.visit(node.parameters[0]);
      // <VarInt 25 bytes> OP_DUP OP_HASH160 OP_PUSH<20>
      this.emit(Buffer.from('1976a914', 'hex'));
      this.emit(Op.OP_CAT);
      // <pkh>
      this.visit(node.parameters[1]);
      this.emit(Op.OP_CAT);
      // OP_EQUAL OP_CHECKSIG
      this.emit(Buffer.from('88ac', 'hex'));
      this.emit(Op.OP_CAT);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.OUTPUT_P2SH) {
      // <output amount>
      this.visit(node.parameters[0]);
      // <VarInt 23 bytes> OP_HASH160 OP_PUSH<20>
      this.emit(Buffer.from('17a914', 'hex'));
      this.emit(Op.OP_CAT);
      // <script hash>
      this.visit(node.parameters[1]);
      this.emit(Op.OP_CAT);
      // OP_EQUAL
      this.emit(Buffer.from('87', 'hex'));
      this.emit(Op.OP_CAT);
      this.popFromStack(2);
    } else if (node.identifier.name === Class.OUTPUT_NULLDATA) {
      // Total script = bytes8(0) <VarInt> OP_RETURN (<VarInt> <chunk>)+
      // <output amount (0)>
      this.emit(Buffer.from('0000000000000000', 'hex'));
      this.pushToStack('(value)');
      // OP_RETURN
      this.emit(Buffer.from('6a', 'hex'));
      this.pushToStack('(value)');
      const { elements } = node.parameters[0] as ArrayNode;
      // <VarInt data chunk size (dynamic)>
      elements.forEach((el) => {
        this.visit(el);
        // Push the element's size (and calculate VarInt)
        this.emit(Op.OP_SIZE);
        if (el instanceof HexLiteralNode) {
          // If the argument is a literal, we know its size
          if (el.value.byteLength > 75) {
            this.emit(Buffer.from('4c', 'hex'));
            this.emit(Op.OP_SWAP);
            this.emit(Op.OP_CAT);
          }
        } else {
          // If the argument is not a literal, the script needs to check size
          this.emit(Op.OP_DUP);
          this.emit(Data.encodeInt(75));
          this.emit(Op.OP_GREATERTHAN);
          this.emit(Op.OP_IF);
          this.emit(Buffer.from('4c', 'hex'));
          this.emit(Op.OP_SWAP);
          this.emit(Op.OP_CAT);
          this.emit(Op.OP_ENDIF);
        }
        // Concat size and arguments
        this.emit(Op.OP_SWAP);
        this.emit(Op.OP_CAT);
        this.emit(Op.OP_CAT);
        this.popFromStack();
      });
      // <VarInt total script size>
      this.emit(Op.OP_SIZE);
      this.emit(Op.OP_SWAP);
      this.emit(Op.OP_CAT);
      this.emit(Op.OP_CAT);
      this.popFromStack(2);
    } else {
      throw new Error(); // Should not happen
    }
    this.pushToStack('(value)');

    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);

    if (node.index === 0) {
      this.emit(Op.OP_DROP);
      this.popFromStack();
    } else if (node.index === 1) {
      this.emit(Op.OP_NIP);
      this.nipFromStack();
    }

    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    this.emit(toOps.fromBinaryOp(
      node.operator,
      resultingType(node.left.type, node.right.type) === PrimitiveType.INT,
    ));
    this.popFromStack(2);
    this.pushToStack('(value)');
    if (node.operator === BinaryOperator.SPLIT) this.pushToStack('(value');
    return node;
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);
    this.emit(toOps.fromUnaryOp(node.operator));
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitArray(node: ArrayNode): Node {
    node.elements = this.visitList(node.elements);
    this.emit(Data.encodeInt(node.elements.length));
    this.pushToStack('(value)');
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const stackIndex = this.getStackIndex(node.name);
    this.emit(Data.encodeInt(stackIndex));

    // If the final use is inside an if-statement, we still OP_PICK it
    // We do this so that there's no difference in stack depths between execution paths
    if (this.isOpRoll(node)) {
      this.emit(Op.OP_ROLL);
      this.removeFromStack(stackIndex);
    } else {
      this.emit(Op.OP_PICK);
    }

    this.pushToStack('(value)');
    return node;
  }

  isOpRoll(node: IdentifierNode): boolean {
    return this.currentFunction.opRolls.get(node.name) === node && this.scopeDepth === 0;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    this.emit(Data.encodeBool(node.value));
    this.pushToStack('(value)');
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.emit(Data.encodeInt(node.value));
    this.pushToStack('(value)');
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    this.emit(Data.encodeString(node.value));
    this.pushToStack('(value)');
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.emit(node.value);
    this.pushToStack('(value)');
    return node;
  }
}
