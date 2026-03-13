import { BytesType, implicitlyCastable, PrimitiveType, Type } from '@cashscript/utils';
import { BinaryOperator } from './ast/Operator.js';
import { FunctionDefinitionNode } from './ast/AST.js';
import { FunctionVisibility } from './ast/Globals.js';

export function resultingTypeForBinaryOp(
  operator: BinaryOperator,
  left: Type,
  right: Type,
): Type | undefined {
  if ([BinaryOperator.SHIFT_LEFT, BinaryOperator.SHIFT_RIGHT, BinaryOperator.SPLIT].includes(operator)) return left;

  if (implicitlyCastable(left, right)) return right;
  if (implicitlyCastable(right, left)) return left;
  if (left instanceof BytesType && right instanceof BytesType) {
    return new BytesType();
  }

  return undefined;
}

export function isNumericType(type?: Type): boolean {
  return type === PrimitiveType.INT || type === PrimitiveType.BOOL;
}

export function getPublicFunctions(
  functions: FunctionDefinitionNode[],
): FunctionDefinitionNode[] {
  return functions.filter((func) => func.visibility === FunctionVisibility.PUBLIC);
}

export function getInvokedFunctionClosure(
  functions: FunctionDefinitionNode[],
): Set<string> {
  const functionsByName = new Map(functions.map((func) => [func.name, func]));
  const reachableFunctions = new Set<string>();
  const pending = getPublicFunctions(functions)
    .flatMap((func) => Array.from(func.calledFunctions));

  while (pending.length > 0) {
    const functionName = pending.pop()!;
    if (reachableFunctions.has(functionName)) continue;

    reachableFunctions.add(functionName);
    const definition = functionsByName.get(functionName);
    if (!definition) continue;

    pending.push(...definition.calledFunctions);
  }

  return reachableFunctions;
}
