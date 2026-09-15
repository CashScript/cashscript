import {
  FunctionCallNode,
  FunctionDefinitionNode,
  FunctionKind,
  Node,
  NullaryOpNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { GlobalFunction } from '../ast/Globals.js';
import { NullaryOperator } from '../ast/Operator.js';
import { UnsafeFunctionOperationError } from '../Errors.js';

// checkSig and checkMultisig, as well as this.activeBytecode use the function's bytecode instead of the contract's.
// This is almost never what a developer would expect, so we reject using these inside global functions altogether.
export default class EnsureFunctionsSafeTraversal extends AstTraversal {
  private insideGlobalFunction = false;

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    const enclosingInsideGlobalFunction = this.insideGlobalFunction;
    this.insideGlobalFunction = node.kind === FunctionKind.GLOBAL;

    node = super.visitFunctionDefinition(node) as FunctionDefinitionNode;

    this.insideGlobalFunction = enclosingInsideGlobalFunction;
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    if (this.insideGlobalFunction && node.operator === NullaryOperator.BYTECODE) {
      throw new UnsafeFunctionOperationError(node, node.operator);
    }

    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node = super.visitFunctionCall(node) as FunctionCallNode;

    const UNSAFE_FUNCTIONS: string[] = [GlobalFunction.CHECKSIG, GlobalFunction.CHECKMULTISIG];
    if (this.insideGlobalFunction && UNSAFE_FUNCTIONS.includes(node.identifier.name)) {
      throw new UnsafeFunctionOperationError(node, node.identifier.name);
    }

    return node;
  }
}
