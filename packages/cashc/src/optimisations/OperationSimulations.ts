import { Script as BScript } from 'bitbox-sdk';
import {
  AuthenticationVirtualMachine,
  AuthenticationProgramStateBCH,
  AuthenticationProgramBCH,
  instantiateVirtualMachineBCH,
  createAuthenticationProgramStateCommonEmpty,
  parseBytecode,
} from 'bitcoin-ts';
import { UnaryOperator, BinaryOperator } from '../ast/Operator';
import {
  LiteralNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  FunctionCallNode,
  Node,
} from '../ast/AST';
import { GlobalFunction } from '../ast/Globals';
import { Data } from '../util';
import {
  Script,
  toOps,
  returnType,
  Op,
} from '../generation/Script';
import { ExecutionError } from '../Errors';
import { PrimitiveType, Type } from '../ast/Type';

type BCH_VM = AuthenticationVirtualMachine<AuthenticationProgramBCH, AuthenticationProgramStateBCH>;
let vm: BCH_VM;
instantiateVirtualMachineBCH().then((res: BCH_VM) => {
  vm = res;
});

export function executeScriptOnVM(script: Script): Uint8Array[] {
  const state = createAuthenticationProgramStateCommonEmpty(
    parseBytecode(Uint8Array.from(new BScript().encode(script))),
  ) as AuthenticationProgramStateBCH;
  const res = vm.stateEvaluate(state);
  if (res.error) {
    throw new ExecutionError(res.error);
  }
  // console.log(res.stack);
  return res.stack;
}

export function encodeLiteralNode(node: LiteralNode): Buffer {
  if (node instanceof BoolLiteralNode) {
    return Data.encodeBool(node.value);
  } else if (node instanceof IntLiteralNode) {
    return Data.encodeInt(node.value);
  } else if (node instanceof StringLiteralNode) {
    return Data.encodeString(node.value);
  } else if (node instanceof HexLiteralNode) {
    return node.value;
  } else {
    throw new Error(); // Can't happen
  }
}

export function decodeLiteralNode(value: Buffer, type: Type): LiteralNode {
  if (type === PrimitiveType.BOOL) {
    return new BoolLiteralNode(Data.decodeBool(value));
  } else if (type === PrimitiveType.INT) {
    return new IntLiteralNode(Data.decodeInt(value, 5));
  } else if (type === PrimitiveType.STRING) {
    return new StringLiteralNode(Data.decodeString(value), '"');
  } else {
    return new HexLiteralNode(value);
  }
}

// TODO: RequireNode
// TODO: BranchNode
// TODO: CastNode

export function applyGlobalFunction(node: FunctionCallNode): Node {
  const { parameters } = node;
  const fn = node.identifier.name as GlobalFunction;

  // TODO: Apply checkMultiSig (requires code generation refactor)
  // This is not very important, since checkMultiSig likely requires external args
  if (fn === GlobalFunction.CHECKMULTISIG) {
    return node;
  }

  const script: Script = (parameters.map(encodeLiteralNode) as Script)
    .concat(toOps.fromFunction(node.identifier.name as GlobalFunction));
  const res = executeScriptOnVM(script)[0];
  return decodeLiteralNode(Buffer.from(res), returnType(fn));
}

// TODO: InstantiationNode
// TODO: TupleIndexOpNode + SplitOpNode

export function applySizeOp(node: StringLiteralNode | HexLiteralNode): LiteralNode {
  const script: Script = [encodeLiteralNode(node), Op.OP_SIZE, Op.OP_NIP];
  const res = executeScriptOnVM(script)[0];
  return decodeLiteralNode(Buffer.from(res), PrimitiveType.INT);
}

export function applyBinaryOperator(
  left: LiteralNode,
  op: BinaryOperator,
  right: LiteralNode,
): LiteralNode {
  let operandType;
  if (left instanceof IntLiteralNode) operandType = PrimitiveType.INT;
  if (left instanceof StringLiteralNode) operandType = PrimitiveType.STRING;

  const script: Script = ([left, right].map(encodeLiteralNode) as Script)
    .concat(toOps.fromBinaryOp(op, operandType === PrimitiveType.INT));
  const res = executeScriptOnVM(script)[0];
  return decodeLiteralNode(Buffer.from(res), returnType(op, operandType));
}

export function applyUnaryOperator(
  op: UnaryOperator,
  expr: LiteralNode,
): LiteralNode {
  const script: Script = ([encodeLiteralNode(expr)] as Script).concat(toOps.fromUnaryOp(op));
  const res = executeScriptOnVM(script)[0];
  return decodeLiteralNode(Buffer.from(res), returnType(op));
}

