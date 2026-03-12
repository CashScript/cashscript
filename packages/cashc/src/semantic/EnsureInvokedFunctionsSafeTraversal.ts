import {
  ContractNode,
  FunctionCallNode,
  FunctionDefinitionNode,
  IdentifierNode,
  Node,
  ParameterNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { GlobalFunction } from '../ast/Globals.js';
import {
  CircularFunctionDependencyError,
  InvokedFunctionContractParameterReferenceError,
  InvokedFunctionSignatureCheckError,
} from '../Errors.js';
import { getInvokedFunctionClosure } from '../utils.js';

const SIGNATURE_FUNCTIONS = new Set([
  GlobalFunction.CHECKSIG,
  GlobalFunction.CHECKMULTISIG,
  GlobalFunction.CHECKDATASIG,
]);

export default class EnsureInvokedFunctionsSafeTraversal extends AstTraversal {
  private invokedFunctions = new Set<string>();
  private contractParameterNames = new Set<string>();
  private currentFunction?: FunctionDefinitionNode;

  visitContract(node: ContractNode): Node {
    this.contractParameterNames = new Set(node.parameters.map((parameter) => parameter.name));
    this.invokedFunctions = getInvokedFunctionClosure(node.functions);
    this.ensureAcyclicFunctionCalls(node.functions);

    return super.visitContract(node);
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    const previousFunction = this.currentFunction;
    this.currentFunction = node;

    const result = this.invokedFunctions.has(node.name) ? super.visitFunctionDefinition(node) : node;

    this.currentFunction = previousFunction;
    return result;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    if (SIGNATURE_FUNCTIONS.has(node.identifier.name as GlobalFunction)) {
      throw new InvokedFunctionSignatureCheckError(node);
    }

    return super.visitFunctionCall(node);
  }

  visitIdentifier(node: IdentifierNode): Node {
    if (
      this.currentFunction
      && this.invokedFunctions.has(this.currentFunction.name)
      && this.contractParameterNames.has(node.name)
      && node.definition?.definition instanceof ParameterNode
    ) {
      throw new InvokedFunctionContractParameterReferenceError(node);
    }

    return super.visitIdentifier(node);
  }

  private ensureAcyclicFunctionCalls(functions: FunctionDefinitionNode[]): void {
    const functionsByName = new Map(functions.map((func) => [func.name, func]));
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (func: FunctionDefinitionNode): void => {
      if (visited.has(func.name)) return;
      if (visiting.has(func.name)) {
        throw new CircularFunctionDependencyError(func);
      }

      visiting.add(func.name);
      func.calledFunctions.forEach((calledFunctionName) => {
        const calledFunction = functionsByName.get(calledFunctionName);
        if (calledFunction) visit(calledFunction);
      });
      visiting.delete(func.name);
      visited.add(func.name);
    };

    functions.forEach(visit);
  }
}
