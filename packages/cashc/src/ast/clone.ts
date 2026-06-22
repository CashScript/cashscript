import {
  Node,
  StatementNode,
  ExpressionNode,
  BlockNode,
  VariableDefinitionNode,
  TupleAssignmentNode,
  AssignNode,
  TimeOpNode,
  RequireNode,
  ReturnNode,
  ConsoleStatementNode,
  BranchNode,
  DoWhileNode,
  WhileNode,
  ForNode,
  CastNode,
  FunctionCallNode,
  FunctionCallStatementNode,
  InstantiationNode,
  TupleIndexOpNode,
  SliceNode,
  BinaryOpNode,
  UnaryOpNode,
  NullaryOpNode,
  ArrayNode,
  IdentifierNode,
  BoolLiteralNode,
  IntLiteralNode,
  StringLiteralNode,
  HexLiteralNode,
  ConsoleParameterNode,
} from './AST.js';
import { Location } from './Location.js';

/**
 * Deep-clones an AST subtree, optionally alpha-renaming identifiers and the names of
 * variable-defining nodes (variable definitions, tuple assignments, for-loop init variables).
 *
 * Used by function inlining: the callee body is cloned per call site and its locals/parameters are
 * renamed to unique names so multiple inlinings (and the call site's own scope) never collide.
 *
 * The clone keeps a reference to the original source `location` (so debug/source-map data still
 * points at the user's function definition) but produces entirely fresh node objects, leaving
 * symbol-table / type annotations to be recomputed by a subsequent SymbolTableTraversal pass.
 */
export function cloneNode<T extends Node>(node: T, renames: Map<string, string> = new Map()): T {
  return clone(node, renames) as unknown as T;
}

const rename = (name: string, renames: Map<string, string>): string => renames.get(name) ?? name;

const withLocation = <T extends Node>(cloned: T, original: Node): T => {
  if (original.location) cloned.location = Location.fromObject(original.location);
  return cloned;
};

function clone(node: Node, renames: Map<string, string>): Node {
  if (node instanceof BlockNode) {
    const statements = node.statements?.map((s) => clone(s, renames) as StatementNode);
    return withLocation(new BlockNode(statements), node);
  }

  if (node instanceof VariableDefinitionNode) {
    return withLocation(new VariableDefinitionNode(
      node.type,
      [...node.modifier],
      rename(node.name, renames),
      clone(node.expression, renames) as ExpressionNode,
    ), node);
  }

  if (node instanceof TupleAssignmentNode) {
    return withLocation(new TupleAssignmentNode(
      node.targets.map((target) => ({ name: rename(target.name, renames), type: target.type })),
      clone(node.tuple, renames) as ExpressionNode,
    ), node);
  }

  if (node instanceof AssignNode) {
    return withLocation(new AssignNode(
      clone(node.identifier, renames) as IdentifierNode,
      clone(node.expression, renames) as ExpressionNode,
    ), node);
  }

  if (node instanceof TimeOpNode) {
    const cloned = new TimeOpNode(node.timeOp, clone(node.expression, renames) as ExpressionNode, node.message);
    cloned.isGuard = node.isGuard;
    return withLocation(cloned, node);
  }

  if (node instanceof RequireNode) {
    return withLocation(new RequireNode(clone(node.expression, renames) as ExpressionNode, node.message), node);
  }

  if (node instanceof ReturnNode) {
    return withLocation(new ReturnNode(
      node.expressions.map((expression) => clone(expression, renames) as ExpressionNode),
    ), node);
  }

  if (node instanceof ConsoleStatementNode) {
    const parameters = node.parameters.map((p) => clone(p, renames) as ConsoleParameterNode);
    return withLocation(new ConsoleStatementNode(parameters), node);
  }

  if (node instanceof BranchNode) {
    return withLocation(new BranchNode(
      clone(node.condition, renames) as ExpressionNode,
      clone(node.ifBlock, renames) as BlockNode,
      node.elseBlock ? clone(node.elseBlock, renames) as BlockNode : undefined,
    ), node);
  }

  if (node instanceof DoWhileNode) {
    return withLocation(new DoWhileNode(
      clone(node.condition, renames) as ExpressionNode,
      clone(node.block, renames) as BlockNode,
    ), node);
  }

  if (node instanceof WhileNode) {
    return withLocation(new WhileNode(
      clone(node.condition, renames) as ExpressionNode,
      clone(node.block, renames) as BlockNode,
    ), node);
  }

  if (node instanceof ForNode) {
    return withLocation(new ForNode(
      clone(node.init, renames) as VariableDefinitionNode | AssignNode,
      clone(node.condition, renames) as ExpressionNode,
      clone(node.update, renames) as AssignNode,
      clone(node.block, renames) as BlockNode,
    ), node);
  }

  if (node instanceof CastNode) {
    return withLocation(new CastNode(node.type, clone(node.expression, renames) as ExpressionNode, node.isUnsafe), node);
  }

  if (node instanceof FunctionCallStatementNode) {
    return withLocation(new FunctionCallStatementNode(
      clone(node.functionCall, renames) as FunctionCallNode,
    ), node);
  }

  if (node instanceof FunctionCallNode) {
    return withLocation(new FunctionCallNode(
      clone(node.identifier, renames) as IdentifierNode,
      node.parameters.map((p) => clone(p, renames) as ExpressionNode),
    ), node);
  }

  if (node instanceof InstantiationNode) {
    return withLocation(new InstantiationNode(
      clone(node.identifier, renames) as IdentifierNode,
      node.parameters.map((p) => clone(p, renames) as ExpressionNode),
    ), node);
  }

  if (node instanceof TupleIndexOpNode) {
    return withLocation(new TupleIndexOpNode(clone(node.tuple, renames) as ExpressionNode, node.index), node);
  }

  if (node instanceof SliceNode) {
    return withLocation(new SliceNode(
      clone(node.element, renames) as ExpressionNode,
      clone(node.start, renames) as ExpressionNode,
      clone(node.end, renames) as ExpressionNode,
    ), node);
  }

  if (node instanceof BinaryOpNode) {
    return withLocation(new BinaryOpNode(
      clone(node.left, renames) as ExpressionNode,
      node.operator,
      clone(node.right, renames) as ExpressionNode,
    ), node);
  }

  if (node instanceof UnaryOpNode) {
    return withLocation(new UnaryOpNode(node.operator, clone(node.expression, renames) as ExpressionNode), node);
  }

  if (node instanceof NullaryOpNode) {
    return withLocation(new NullaryOpNode(node.operator), node);
  }

  if (node instanceof ArrayNode) {
    return withLocation(new ArrayNode(node.elements.map((e) => clone(e, renames) as ExpressionNode)), node);
  }

  if (node instanceof IdentifierNode) {
    return withLocation(new IdentifierNode(rename(node.name, renames)), node);
  }

  if (node instanceof BoolLiteralNode) {
    return withLocation(new BoolLiteralNode(node.value), node);
  }

  if (node instanceof IntLiteralNode) {
    return withLocation(new IntLiteralNode(node.value), node);
  }

  if (node instanceof StringLiteralNode) {
    return withLocation(new StringLiteralNode(node.value, node.quote), node);
  }

  if (node instanceof HexLiteralNode) {
    return withLocation(new HexLiteralNode(node.value), node);
  }

  throw new Error(`cloneNode: unhandled node type ${node.constructor.name}`);
}
