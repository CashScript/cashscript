import { implicitlyCastable } from '@cashscript/utils';
import {
  SourceFileNode,
  ConstantDefinitionNode,
  ContractNode,
  FunctionDefinitionNode,
  ExpressionNode,
  IdentifierNode,
  LiteralNode,
  IntLiteralNode,
  BoolLiteralNode,
  StringLiteralNode,
  HexLiteralNode,
  UnaryOpNode,
  BinaryOpNode,
  CastNode,
  FunctionCallNode,
  InstantiationNode,
  ParameterNode,
  VariableDefinitionNode,
  TupleAssignmentNode,
  AssignNode,
  Node,
} from './ast/AST.js';
import AstTraversal from './ast/AstTraversal.js';
import { BinaryOperator, UnaryOperator } from './ast/Operator.js';
import {
  ConstantDefinitionError,
  ConstantRedefinitionError,
  ConstantNameCollisionError,
} from './Errors.js';

// Folds every top-level constant to a literal and inlines it at each use site (in the contract and
// in global function bodies). Runs after dependency resolution and before semantic analysis, so the
// rest of the pipeline only ever sees plain literals.
export function inlineConstants(ast: SourceFileNode): SourceFileNode {
  if (ast.constants.length === 0) return ast;

  const values = new Map<string, LiteralNode>();
  for (const definition of ast.constants) {
    if (values.has(definition.name)) throw new ConstantRedefinitionError(definition);
    const value = evaluateConstant(definition.expression, values, definition);
    assertMatchesDeclaredType(definition, value);
    values.set(definition.name, value);
  }

  ast.functions.forEach((func) => {
    if (values.has(func.name)) throw new ConstantNameCollisionError(func, func.name);
  });

  const inliner = new ConstantInliner(values);
  ast.functions = ast.functions.map((func) => inliner.visit(func) as FunctionDefinitionNode);
  if (ast.contract) ast.contract = inliner.visit(ast.contract) as ContractNode;
  ast.constants = [];

  return ast;
}

// Folds a constant initializer to a literal node. Supports literals, references to previously defined
// constants, and arithmetic/logical/comparison operators over them. Anything that depends on
// runtime/introspection values is rejected (constants must be known at compile time).
function evaluateConstant(
  expression: ExpressionNode,
  known: Map<string, LiteralNode>,
  definition: ConstantDefinitionNode,
): LiteralNode {
  if (expression instanceof IntLiteralNode) return new IntLiteralNode(expression.value);
  if (expression instanceof BoolLiteralNode) return new BoolLiteralNode(expression.value);
  if (expression instanceof HexLiteralNode) return new HexLiteralNode(expression.value);
  if (expression instanceof StringLiteralNode) return new StringLiteralNode(expression.value, expression.quote);

  if (expression instanceof IdentifierNode) {
    const value = known.get(expression.name);
    if (!value) {
      throw new ConstantDefinitionError(
        definition,
        `Constant '${definition.name}' references '${expression.name}', which is not a known constant`,
      );
    }
    return cloneLiteral(value);
  }

  if (expression instanceof UnaryOpNode) {
    const operand = evaluateConstant(expression.expression, known, definition);
    return foldUnary(expression.operator, operand, definition);
  }

  if (expression instanceof BinaryOpNode) {
    const left = evaluateConstant(expression.left, known, definition);
    const right = evaluateConstant(expression.right, known, definition);
    return foldBinary(expression.operator, left, right, definition);
  }

  if (expression instanceof CastNode) {
    // Allow trivial numeric casts of constant expressions (e.g. int(...)); the value is unchanged.
    return evaluateConstant(expression.expression, known, definition);
  }

  throw new ConstantDefinitionError(
    definition,
    `Constant '${definition.name}' must be a compile-time constant expression (no introspection or runtime values)`,
  );
}

function foldUnary(operator: UnaryOperator, operand: LiteralNode, definition: ConstantDefinitionNode): LiteralNode {
  if (operator === UnaryOperator.NEGATE && operand instanceof IntLiteralNode) {
    return new IntLiteralNode(-operand.value);
  }
  if (operator === UnaryOperator.NOT && operand instanceof BoolLiteralNode) {
    return new BoolLiteralNode(!operand.value);
  }
  throw new ConstantDefinitionError(
    definition,
    `Constant '${definition.name}' uses operator '${operator}' on an unsupported constant operand`,
  );
}

function foldBinary(
  operator: BinaryOperator,
  left: LiteralNode,
  right: LiteralNode,
  definition: ConstantDefinitionNode,
): LiteralNode {
  if (left instanceof IntLiteralNode && right instanceof IntLiteralNode) {
    const a = left.value;
    const b = right.value;
    switch (operator) {
      case BinaryOperator.PLUS: return new IntLiteralNode(a + b);
      case BinaryOperator.MINUS: return new IntLiteralNode(a - b);
      case BinaryOperator.MUL: return new IntLiteralNode(a * b);
      case BinaryOperator.DIV: return new IntLiteralNode(a / b);
      case BinaryOperator.MOD: return new IntLiteralNode(a % b);
      case BinaryOperator.LT: return new BoolLiteralNode(a < b);
      case BinaryOperator.LE: return new BoolLiteralNode(a <= b);
      case BinaryOperator.GT: return new BoolLiteralNode(a > b);
      case BinaryOperator.GE: return new BoolLiteralNode(a >= b);
      case BinaryOperator.EQ: return new BoolLiteralNode(a === b);
      case BinaryOperator.NE: return new BoolLiteralNode(a !== b);
      default: break;
    }
  }

  if (left instanceof BoolLiteralNode && right instanceof BoolLiteralNode) {
    switch (operator) {
      case BinaryOperator.AND: return new BoolLiteralNode(left.value && right.value);
      case BinaryOperator.OR: return new BoolLiteralNode(left.value || right.value);
      case BinaryOperator.EQ: return new BoolLiteralNode(left.value === right.value);
      case BinaryOperator.NE: return new BoolLiteralNode(left.value !== right.value);
      default: break;
    }
  }

  throw new ConstantDefinitionError(
    definition,
    `Constant '${definition.name}' uses operator '${operator}' on unsupported constant operands`,
  );
}

// The folded value must fit the declared type (e.g. `bytes32 constant X` requires a 32-byte literal).
function assertMatchesDeclaredType(definition: ConstantDefinitionNode, value: LiteralNode): void {
  if (!implicitlyCastable(value.type, definition.type)) {
    throw new ConstantDefinitionError(
      definition,
      `Constant '${definition.name}' has declared type ${definition.type} but its value has type ${value.type}`,
    );
  }
}

function cloneLiteral(literal: LiteralNode): LiteralNode {
  if (literal instanceof IntLiteralNode) return new IntLiteralNode(literal.value);
  if (literal instanceof BoolLiteralNode) return new BoolLiteralNode(literal.value);
  if (literal instanceof HexLiteralNode) return new HexLiteralNode(literal.value);
  if (literal instanceof StringLiteralNode) return new StringLiteralNode(literal.value, literal.quote);
  throw new Error(`Cannot clone literal of type ${literal.type}`); // Shouldn't happen
}

// Replaces every identifier that names a constant with a clone of the constant's literal value.
// Callee identifiers (function/instantiation names) are left untouched, and any local that shadows a
// constant name is rejected (it would silently break inlining).
class ConstantInliner extends AstTraversal {
  constructor(private constants: Map<string, LiteralNode>) {
    super();
  }

  visitIdentifier(node: IdentifierNode): Node {
    const value = this.constants.get(node.name);
    if (value) {
      // The inlined literal takes the use site's source location (a folded constant value may have
      // none of its own), so source-map generation always has a valid location to point at.
      const literal = cloneLiteral(value);
      literal.location = node.location;
      return literal;
    }
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    // Do NOT inline the callee identifier (it is a function name, not a value).
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitParameter(node: ParameterNode): Node {
    this.assertNotConstant(node.name, node);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    this.assertNotConstant(node.name, node);
    return super.visitVariableDefinition(node);
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    node.targets.forEach((target) => this.assertNotConstant(target.name, node));
    return super.visitTupleAssignment(node);
  }

  visitAssign(node: AssignNode): Node {
    this.assertNotConstant(node.identifier.name, node);
    node.expression = this.visit(node.expression);
    return node;
  }

  private assertNotConstant(name: string, node: Node): void {
    if (this.constants.has(name)) throw new ConstantNameCollisionError(node, name);
  }
}
