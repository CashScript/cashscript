import { BytesType, implicitlyCastable, PrimitiveType, Type } from '@cashscript/utils';
import { BinaryOperator } from './ast/Operator.js';
import { CompilerOptions } from '@cashscript/utils';
import { FunctionDefinitionNode } from './ast/AST.js';

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

export function isInternalFunctionName(
  name: string,
  compilerOptions: CompilerOptions = {},
): boolean {
  const prefix = compilerOptions.internalFunctionPrefix;
  if (prefix !== undefined) {
    return prefix.length > 0 && name.startsWith(prefix);
  }

  return name.endsWith('_');
}

export function getPublicFunctions(
  functions: FunctionDefinitionNode[],
  compilerOptions: CompilerOptions = {},
): FunctionDefinitionNode[] {
  return functions.filter((func) => !isInternalFunctionName(func.name, compilerOptions));
}

export function getInvokedFunctionClosure(functions: FunctionDefinitionNode[]): Set<string> {
  const functionsByName = new Map(functions.map((func) => [func.name, func]));
  const reachableFunctions = new Set<string>();
  const pending = functions.flatMap((func) => Array.from(func.calledFunctions));

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
