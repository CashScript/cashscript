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
} from '../ast/AST';
import { Data } from '../util';
import { Script, toOps, returnsBool } from '../generation/Script';
import { ExecutionError } from '../Errors';

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

export function applyUnaryOperator(
  op: UnaryOperator,
  expr: LiteralNode,
): LiteralNode {
  if (expr instanceof BoolLiteralNode) {
    return applyUnaryOperatorToBool(op, expr);
  } else if (expr instanceof IntLiteralNode) {
    return applyUnaryOperatorToInt(op, expr);
  } else {
    throw new Error(); // Already checked in typecheck
  }
}

function applyUnaryOperatorToBool(
  op: UnaryOperator,
  expr: BoolLiteralNode,
): BoolLiteralNode {
  const script: Script = ([Data.encodeBool(expr.value)] as Script)
    .concat(toOps.fromUnaryOp(op));
  const res = executeScriptOnVM(script)[0];
  return new BoolLiteralNode(Data.decodeBool(Buffer.from(res)));
}

function applyUnaryOperatorToInt(
  op: UnaryOperator,
  expr: IntLiteralNode,
): IntLiteralNode {
  const script: Script = ([Data.encodeInt(expr.value)] as Script)
    .concat(toOps.fromUnaryOp(op));
  const res = executeScriptOnVM(script)[0];
  return new IntLiteralNode(Data.decodeInt(Buffer.from(res)));
}

export function applyBinaryOperator(
  left: LiteralNode,
  op: BinaryOperator,
  right: LiteralNode,
): LiteralNode {
  if (left instanceof BoolLiteralNode && right instanceof BoolLiteralNode) {
    return applyBinaryOperatorToBool(left, op, right);
  } else if (left instanceof IntLiteralNode && right instanceof IntLiteralNode) {
    return applyBinaryOperatorToInt(left, op, right);
  } else if (left instanceof StringLiteralNode && right instanceof StringLiteralNode) {
    return applyBinaryOperatorToString(left, op, right);
  } else if (left instanceof HexLiteralNode && right instanceof HexLiteralNode) {
    return applyBinaryOperatorToHex(left, op, right);
  } else {
    throw new Error(); // Already checked in typecheck
  }
}

function applyBinaryOperatorToBool(
  left: BoolLiteralNode,
  op: BinaryOperator,
  right: BoolLiteralNode,
): BoolLiteralNode {
  const script: Script = ([Data.encodeBool(left.value), Data.encodeBool(right.value)] as Script)
    .concat(toOps.fromBinaryOp(op, true));
  const res = executeScriptOnVM(script)[0];
  return new BoolLiteralNode(Data.decodeBool(Buffer.from(res)));
}

function applyBinaryOperatorToInt(
  left: IntLiteralNode,
  op: BinaryOperator,
  right: IntLiteralNode,
): LiteralNode {
  const script: Script = ([Data.encodeInt(left.value), Data.encodeInt(right.value)] as Script)
    .concat(toOps.fromBinaryOp(op, true));
  const res = executeScriptOnVM(script)[0];
  return returnsBool(op)
    ? new BoolLiteralNode(Data.decodeBool(Buffer.from(res)))
    : new IntLiteralNode(Data.decodeInt(Buffer.from(res), 5));
}

function applyBinaryOperatorToString(
  left: StringLiteralNode,
  op: BinaryOperator,
  right: StringLiteralNode,
): LiteralNode {
  const script: Script = ([Data.encodeString(left.value), Data.encodeString(right.value)] as Script)
    .concat(toOps.fromBinaryOp(op));
  const res = executeScriptOnVM(script)[0];
  return returnsBool(op)
    ? new BoolLiteralNode(Data.decodeBool(Buffer.from(res)))
    : new StringLiteralNode(Data.decodeString(Buffer.from(res)), left.quote);
}

function applyBinaryOperatorToHex(
  left: HexLiteralNode,
  op: BinaryOperator,
  right: HexLiteralNode,
): LiteralNode {
  const script: Script = ([left.value, right.value] as Script)
    .concat(toOps.fromBinaryOp(op));
  const res = executeScriptOnVM(script)[0];
  return returnsBool(op)
    ? new BoolLiteralNode(Data.decodeBool(Buffer.from(res)))
    : new HexLiteralNode(Buffer.from(res));
}
