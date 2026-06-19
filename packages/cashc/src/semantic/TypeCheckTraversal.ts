import {
  PrimitiveType,
  explicitlyCastable,
  implicitlyCastable,
  implicitlyCastableSignature,
  arrayType,
  ArrayType,
  TupleType,
  BytesType,
  Type,
} from '@cashscript/utils';
import {
  AssignNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  IdentifierNode,
  TimeOpNode,
  VariableDefinitionNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  ReturnNode,
  Node,
  InstantiationNode,
  TupleAssignmentNode,
  NullaryOpNode,
  SliceNode,
  IntLiteralNode,
  DoWhileNode,
  WhileNode,
  ForNode,
  BlockNode,
  StatementNode,
  ExpressionNode,
  FunctionDefinitionNode,
  ParameterNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import {
  InvalidParameterTypeError,
  UnequalTypeError,
  UnsupportedTypeError,
  CastTypeError,
  TypeError,
  AssignTypeError,
  ArrayElementError,
  IndexOutOfBoundsError,
  TupleAssignmentError,
  BitshiftBitcountNegativeError,
  ReturnTypeError,
  MissingReturnStatementError,
  ReturnStatementError,
} from '../Errors.js';
import { BinaryOperator, NullaryOperator, UnaryOperator } from '../ast/Operator.js';
import { GlobalFunction } from '../ast/Globals.js';
import { Symbol } from '../ast/SymbolTable.js';
import { resultingTypeForBinaryOp } from '../utils.js';

export default class TypeCheckTraversal extends AstTraversal {
  // Declared return types of the user-defined function currently being type-checked (if any).
  private currentReturnTypes?: Type[];
  // True while visiting the right-hand side of a tuple-destructuring assignment, where a
  // multi-return function call is permitted (and validated against the destructuring targets).
  private insideTupleAssignmentRhs = false;

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.currentReturnTypes = node.returnTypes;
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body) as BlockNode;
    this.currentReturnTypes = undefined;

    if (node.isUserFunction) {
      // The OP_DEFINE/OP_INVOKE lowering requires a single `return` as the final statement of the
      // body. Disallow missing, early, or nested returns so each call site lowers to a clean result
      // assignment.
      const statements = node.body.statements ?? [];
      const finalStatement = statements[statements.length - 1];
      if (!(finalStatement instanceof ReturnNode)) {
        throw new MissingReturnStatementError(node);
      }

      const nestedReturns = countReturns(node.body) - 1;
      if (nestedReturns > 0) {
        throw new ReturnStatementError(
          node,
          `Function '${node.name}' may only contain a single return statement as its final statement`,
        );
      }
    }

    return node;
  }

  visitReturn(node: ReturnNode): Node {
    node.expressions = this.visitList(node.expressions);

    // `return` is only valid inside a user-defined (value-returning) function.
    if (this.currentReturnTypes === undefined) {
      throw new ReturnStatementError(node, 'return statement is only allowed in functions with a declared return type');
    }

    // The number of returned values must match the declared return type count.
    if (node.expressions.length !== this.currentReturnTypes.length) {
      throw new ReturnStatementError(
        node,
        `Function returns ${node.expressions.length} value(s) but ${this.currentReturnTypes.length} were declared`,
      );
    }

    // Each returned expression must be assignable to the corresponding declared return type.
    node.expressions.forEach((expression, i) => {
      const expectedType = this.currentReturnTypes![i];
      if (!implicitlyCastable(expression.type, expectedType)) {
        throw new ReturnTypeError(node, expression.type, expectedType);
      }
    });

    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);
    expectAssignable(node, node.expression.type, node.type);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    this.insideTupleAssignmentRhs = true;
    node.tuple = this.visit(node.tuple);
    this.insideTupleAssignmentRhs = false;

    // A multi-return user-defined function call is the only N-ary tuple source. Its declared return
    // types must match the destructuring targets one-to-one (count + types).
    const callReturnTypes = userFunctionReturnTypes(node.tuple);
    if (callReturnTypes !== undefined) {
      if (callReturnTypes.length !== node.targets.length) {
        throw new ReturnStatementError(
          node.tuple,
          `Function returns ${callReturnTypes.length} value(s) but ${node.targets.length} were destructured`,
        );
      }

      node.targets.forEach((target, i) => {
        if (!implicitlyCastable(callReturnTypes[i], target.type)) {
          const syntheticAssignment = new VariableDefinitionNode(target.type, [], target.name, node.tuple);
          syntheticAssignment.location = node.location;
          throw new AssignTypeError(syntheticAssignment);
        }
      });

      return node;
    }

    // Otherwise the tuple must come from a built-in multi-value expression (e.g. `.split`), which
    // always produces exactly two values.
    if (!(node.tuple instanceof BinaryOpNode) || node.tuple.operator !== BinaryOperator.SPLIT) {
      throw new TupleAssignmentError(node.tuple);
    }

    if (node.targets.length !== 2) {
      throw new ReturnStatementError(
        node.tuple,
        `Expression returns 2 values but ${node.targets.length} were destructured`,
      );
    }

    const [left, right] = node.targets;
    const assignmentType = new TupleType(left.type, right.type);

    if (!implicitlyCastable(node.tuple.type, assignmentType)) {
      const syntheticAssignment = new VariableDefinitionNode(assignmentType, [], left.name, node.tuple);
      syntheticAssignment.location = node.location;
      throw new AssignTypeError(syntheticAssignment);
    }
    return node;
  }

  visitAssign(node: AssignNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.expression = this.visit(node.expression);
    expectAssignable(node, node.expression.type, node.identifier.type);
    return node;
  }

  visitTimeOp(node: TimeOpNode): Node {
    node.expression = this.visit(node.expression);
    expectInt(node, node.expression.type);
    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);
    const parameters = node.expression.type ? [node.expression.type] : [];
    expectParameters(node, parameters, [PrimitiveType.BOOL]);
    return node;
  }

  visitBlock(node: BlockNode): Node {
    // Mutates the statements in place, so no need to re-assign the result.
    this.visitStatementsRecursively(node.statements ?? []);
    return node;
  }

  // Visits statements sequentially, narrowing bytes types after require(x.length == N) checks.
  // Remaining statements are visited inside applyNarrowings so the narrowed types are
  // automatically restored when recursion unwinds.
  private visitStatementsRecursively(statements: StatementNode[], index: number = 0): void {
    if (index >= statements.length) return;

    statements[index] = this.visit(statements[index]) as StatementNode;

    if (statements[index] instanceof RequireNode) {
      const narrowings = extractBytesNarrowings((statements[index] as RequireNode).expression);
      executeWithNarrowedTypes(narrowings, () => this.visitStatementsRecursively(statements, index + 1));
    } else {
      this.visitStatementsRecursively(statements, index + 1);
    }
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);

    const narrowings = extractBytesNarrowings(node.condition);
    executeWithNarrowedTypes(narrowings, () => { node.ifBlock = this.visit(node.ifBlock); });

    node.elseBlock = this.visitOptional(node.elseBlock);

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node.condition, node.condition.type, PrimitiveType.BOOL);
    }

    return node;
  }

  visitDoWhile(node: DoWhileNode): Node {
    node.condition = this.visit(node.condition);
    node.block = this.visit(node.block);

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node.condition, node.condition.type, PrimitiveType.BOOL);
    }

    return node;
  }

  visitWhile(node: WhileNode): Node {
    node.condition = this.visit(node.condition);
    node.block = this.visit(node.block);

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node.condition, node.condition.type, PrimitiveType.BOOL);
    }

    return node;
  }

  visitFor(node: ForNode): Node {
    node.init = this.visit(node.init) as AssignNode | VariableDefinitionNode;
    node.condition = this.visit(node.condition);
    node.update = this.visit(node.update) as AssignNode;
    node.block = this.visit(node.block);

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node.condition, node.condition.type, PrimitiveType.BOOL);
    }

    return node;
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);

    if (!explicitlyCastable(node.expression.type, node.type)) {
      throw new CastTypeError(node);
    }

    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    // Whether this call is the direct RHS of a tuple destructuring. Consume the flag immediately so
    // that nested argument calls are type-checked as ordinary (single-value) expressions.
    const isTupleAssignmentRhs = this.insideTupleAssignmentRhs;
    this.insideTupleAssignmentRhs = false;

    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;
    if (!definition || !definition.parameters) return node; // already checked in symbol table

    const parameterTypes = node.parameters.map((p) => p.type!);
    expectParameters(node, parameterTypes, definition.parameters);

    // Additional array length check for checkMultiSig
    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      const sigs = node.parameters[0] as ArrayNode;
      const pks = node.parameters[1] as ArrayNode;
      if (sigs.elements.length > pks.elements.length) {
        throw new ArrayElementError(pks);
      }
    }

    node.type = type;

    // A multi-return user-defined function does not produce a single value, so it is only valid as
    // the right-hand side of a tuple destructuring assignment (handled in visitTupleAssignment).
    // Using it anywhere a single value is expected is an error.
    if (definition.returnTypes !== undefined && definition.returnTypes.length > 1 && !isTupleAssignmentRhs) {
      throw new ReturnStatementError(
        node,
        `Function '${node.identifier.name}' returns ${definition.returnTypes.length} values and must be destructured into ${definition.returnTypes.length} variables`,
      );
    }

    // Infer the type of the toPaddedBytes function (depends on the second parameter)
    if (node.identifier.name === GlobalFunction.TO_PADDED_BYTES) {
      node.type = inferPaddedBytesType(node);
    }

    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;
    if (!definition || !definition.parameters) return node; // already checked in symbol table

    const parameterTypes = node.parameters.map((p) => p.type!);
    expectParameters(node, parameterTypes, definition.parameters);

    node.type = type;
    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);

    expectTuple(node, node.tuple.type);

    if (node.index !== 0 && node.index !== 1) {
      throw new IndexOutOfBoundsError(node);
    }

    node.type = node.index === 0 ? (node.tuple.type as TupleType).leftType : (node.tuple.type as TupleType).rightType;
    return node;
  }

  visitSlice(node: SliceNode): Node {
    node.element = this.visit(node.element);
    node.start = this.visit(node.start);
    node.end = this.visit(node.end);

    expectAnyOfTypes(node, node.element.type, [new BytesType(), PrimitiveType.STRING]);
    expectInt(node, node.start.type);
    expectInt(node, node.end.type);

    node.type = inferSliceType(node);
    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);

    const resType = resultingTypeForBinaryOp(node.operator, node.left.type!, node.right.type!);
    if (!resType) {
      throw new UnequalTypeError(node);
    }

    switch (node.operator) {
      case BinaryOperator.PLUS:
        expectAnyOfTypes(node, resType, [PrimitiveType.INT, PrimitiveType.STRING, new BytesType()]);
        node.type = resType;
        // Infer new bounded bytes type if both operands are bounded bytes types
        if (node.left.type instanceof BytesType && node.right.type instanceof BytesType) {
          if (node.left.type.bound && node.right.type.bound) {
            node.type = new BytesType(node.left.type.bound + node.right.type.bound);
          }
        }
        return node;
      case BinaryOperator.MUL:
      case BinaryOperator.DIV:
      case BinaryOperator.MOD:
      case BinaryOperator.MINUS:
        expectInt(node, resType);
        node.type = resType;
        return node;
      case BinaryOperator.LT:
      case BinaryOperator.LE:
      case BinaryOperator.GT:
      case BinaryOperator.GE:
        expectInt(node, resType);
        node.type = PrimitiveType.BOOL;
        return node;
      case BinaryOperator.EQ:
      case BinaryOperator.NE:
        expectCompatibleBytesBounds(node, node.left.type, node.right.type);
        node.type = PrimitiveType.BOOL;
        return node;
      case BinaryOperator.AND:
      case BinaryOperator.OR:
        expectBool(node, resType);
        node.type = PrimitiveType.BOOL;
        return node;
      case BinaryOperator.BIT_AND:
      case BinaryOperator.BIT_OR:
      case BinaryOperator.BIT_XOR:
        expectSameSizeBytes(node, node.left.type, node.right.type);
        node.type = node.left.type;
        return node;
      case BinaryOperator.SHIFT_LEFT:
      case BinaryOperator.SHIFT_RIGHT:
        expectAnyOfTypes(node, node.left.type, [new BytesType(), PrimitiveType.INT]);
        expectInt(node, node.right.type);
        if (node.right instanceof IntLiteralNode && Number(node.right.value) < 0) {
          throw new BitshiftBitcountNegativeError(node, Number(node.right.value));
        }
        node.type = node.left.type;
        return node;
      case BinaryOperator.SPLIT:
        expectAnyOfTypes(node, node.left.type, [new BytesType(), PrimitiveType.STRING]);
        expectInt(node, node.right.type);
        node.type = inferTupleType(node);
        return node;
      default:
        return node;
    }
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);

    switch (node.operator) {
      case UnaryOperator.NOT:
        expectBool(node, node.expression.type);
        node.type = PrimitiveType.BOOL;
        return node;
      case UnaryOperator.NEGATE:
        expectInt(node, node.expression.type);
        node.type = PrimitiveType.INT;
        return node;
      case UnaryOperator.INVERT:
        expectBytes(node, node.expression.type);
        node.type = node.expression.type;
        return node;
      case UnaryOperator.SIZE:
        expectAnyOfTypes(node, node.expression.type, [new BytesType(), PrimitiveType.STRING]);
        node.type = PrimitiveType.INT;
        return node;
      case UnaryOperator.REVERSE:
        expectAnyOfTypes(node, node.expression.type, [new BytesType(), PrimitiveType.STRING]);
        // Type is preserved
        node.type = node.expression.type;
        return node;
      case UnaryOperator.INPUT_VALUE:
      case UnaryOperator.INPUT_OUTPOINT_INDEX:
      case UnaryOperator.INPUT_SEQUENCE_NUMBER:
      case UnaryOperator.OUTPUT_VALUE:
      case UnaryOperator.INPUT_TOKEN_AMOUNT:
      case UnaryOperator.OUTPUT_TOKEN_AMOUNT:
        expectInt(node, node.expression.type);
        node.type = PrimitiveType.INT;
        return node;
      case UnaryOperator.INPUT_LOCKING_BYTECODE:
      case UnaryOperator.INPUT_UNLOCKING_BYTECODE:
      case UnaryOperator.OUTPUT_LOCKING_BYTECODE:
      case UnaryOperator.INPUT_NFT_COMMITMENT:
      case UnaryOperator.OUTPUT_NFT_COMMITMENT:
      case UnaryOperator.INPUT_TOKEN_CATEGORY:
      case UnaryOperator.OUTPUT_TOKEN_CATEGORY:
        expectInt(node, node.expression.type);
        node.type = new BytesType();
        return node;
      case UnaryOperator.INPUT_OUTPOINT_HASH:
        expectInt(node, node.expression.type);
        node.type = new BytesType(32);
        return node;
      default:
        return node;
    }
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    switch (node.operator) {
      case NullaryOperator.INPUT_INDEX:
      case NullaryOperator.INPUT_COUNT:
      case NullaryOperator.OUTPUT_COUNT:
      case NullaryOperator.VERSION:
      case NullaryOperator.LOCKTIME:
        node.type = PrimitiveType.INT;
        return node;
      case NullaryOperator.BYTECODE:
        node.type = new BytesType();
        return node;
      default:
        return node;
    }
  }

  visitArray(node: ArrayNode): Node {
    node.elements = this.visitList(node.elements);

    const elementTypes = node.elements.map((e) => {
      if (!e.type) throw new ArrayElementError(node);
      return e.type;
    });

    const elementType = arrayType(elementTypes);

    if (!elementType) {
      throw new ArrayElementError(node);
    }

    node.type = new ArrayType(elementType);
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    if (!node.definition) return node;
    node.type = node.definition.type;
    return node;
  }
}

type ExpectedNode = BinaryOpNode | UnaryOpNode | TimeOpNode | TupleIndexOpNode | SliceNode;
function expectAnyOfTypes(node: ExpectedNode, actual?: Type, expectedTypes?: Type[]): void {
  if (!expectedTypes || expectedTypes.length === 0) return;
  if (expectedTypes.find((expected) => implicitlyCastable(actual, expected))) return;

  throw new UnsupportedTypeError(node, actual, expectedTypes[0]);
}

function expectBool(node: ExpectedNode, actual?: Type): void {
  expectAnyOfTypes(node, actual, [PrimitiveType.BOOL]);
}

function expectInt(node: ExpectedNode, actual?: Type): void {
  expectAnyOfTypes(node, actual, [PrimitiveType.INT]);
}

function expectBytes(node: ExpectedNode, actual?: Type): void {
  expectAnyOfTypes(node, actual, [new BytesType()]);
}

function expectSameSizeBytes(node: BinaryOpNode, left?: Type, right?: Type): void {
  if (!(left instanceof BytesType) || !(right instanceof BytesType)) {
    throw new UnsupportedTypeError(node, left, new BytesType());
  }

  if (left.bound !== right.bound) {
    throw new UnequalTypeError(node);
  }
}

// Two bounded bytes types are only comparable when their bounds match. Unbounded sides are
// allowed since they can match any size at runtime (and narrowing may refine them later).
function expectCompatibleBytesBounds(node: BinaryOpNode, left?: Type, right?: Type): void {
  if (!(left instanceof BytesType) || !(right instanceof BytesType)) return;
  if (left.bound === undefined || right.bound === undefined) return;
  if (left.bound !== right.bound) throw new UnequalTypeError(node);
}

function expectTuple(node: ExpectedNode, actual?: Type): void {
  if (!(actual instanceof TupleType)) {
    // We use a placeholder tuple to indicate that we're expecting *any* tuple at all
    const placeholderTuple = new TupleType(new BytesType(), new BytesType());
    throw new UnsupportedTypeError(node, actual, placeholderTuple);
  }
}

type AssigningNode = AssignNode | VariableDefinitionNode;
function expectAssignable(node: AssigningNode, actual?: Type, expected?: Type): void {
  if (!implicitlyCastable(actual, expected)) {
    throw new AssignTypeError(node);
  }
}

type NodeWithParameters = FunctionCallNode | RequireNode | InstantiationNode;
function expectParameters(node: NodeWithParameters, actual: Type[], expected: Type[]): void {
  if (!implicitlyCastableSignature(actual, expected)) {
    throw new InvalidParameterTypeError(node, actual, expected);
  }
}

// We only call this function for the split operator, so we assume that the node.op is SPLIT
function inferTupleType(node: BinaryOpNode): Type {
  if (node.right instanceof IntLiteralNode && Number(node.right.value) < 0) {
    throw new IndexOutOfBoundsError(node);
  }

  // string.split() -> string, string
  if (node.left.type === PrimitiveType.STRING) {
    return new TupleType(PrimitiveType.STRING, PrimitiveType.STRING);
  }

  // If the expression is not a bytes type, then it must be a different compatible type (e.g. sig/pubkey)
  // We treat this as an unbounded bytes type for the purposes of splitting
  const expressionType = node.left.type instanceof BytesType ? node.left.type : new BytesType();

  // bytes.split(variable) -> bytes, bytes
  if (!(node.right instanceof IntLiteralNode)) {
    return new TupleType(new BytesType(), new BytesType());
  }

  const splitIndex = Number(node.right.value);

  // bytes.split(NumberLiteral) -> bytes(NumberLiteral), bytes
  if (expressionType.bound === undefined) {
    return new TupleType(new BytesType(splitIndex), new BytesType());
  }

  if (splitIndex > expressionType.bound) {
    throw new IndexOutOfBoundsError(node);
  }

  // bytesX.split(NumberLiteral) -> bytes(NumberLiteral), bytes(X - NumberLiteral)
  return new TupleType(
    new BytesType(splitIndex),
    new BytesType(expressionType.bound! - splitIndex),
  );
}

function inferSliceType(node: SliceNode): Type {
  if (node.start instanceof IntLiteralNode && Number(node.start.value) < 0) {
    throw new IndexOutOfBoundsError(node);
  }

  if (node.end instanceof IntLiteralNode && Number(node.end.value) < 0) {
    throw new IndexOutOfBoundsError(node);
  }

  // string.slice() -> string
  if (node.element.type === PrimitiveType.STRING) {
    return PrimitiveType.STRING;
  }

  // If the expression is not a bytes type, then it must be a different compatible type (e.g. sig/pubkey)
  const expressionType = node.element.type instanceof BytesType ? node.element.type : new BytesType();

  if (expressionType.bound !== undefined) {
    if (node.start instanceof IntLiteralNode && Number(node.start.value) >= expressionType.bound) {
      throw new IndexOutOfBoundsError(node);
    }

    if (node.end instanceof IntLiteralNode && Number(node.end.value) > expressionType.bound) {
      throw new IndexOutOfBoundsError(node);
    }
  }

  // bytes.slice(variable, variable) -> bytes
  // bytes.slice(NumberLiteral, variable) -> bytes
  // bytes.slice(variable, NumberLiteral) -> bytes
  if (!(node.start instanceof IntLiteralNode) || !(node.end instanceof IntLiteralNode)) {
    return new BytesType();
  }

  const start = Number(node.start.value);
  const end = Number(node.end.value);

  if (start > end) {
    throw new IndexOutOfBoundsError(node);
  }

  // bytes.slice(NumberLiteral start, NumberLiteral end) -> bytes(end - start)
  return new BytesType(end - start);
}

const inferPaddedBytesType = (node: FunctionCallNode): Type => {
  if (node.parameters[1] instanceof IntLiteralNode) {
    return new BytesType(Number(node.parameters[1].value));
  }

  return new BytesType();
};

type Narrowing = { symbol: Symbol, bound: number };

// Temporarily narrows each symbol's type to BytesType(bound), calls fn, then restores.
// Recurses through the list so each narrowing is restored in reverse order as the stack unwinds.
function executeWithNarrowedTypes(narrowings: Narrowing[], fn: () => void): void {
  if (narrowings.length === 0) return fn();

  const [{ symbol, bound }, ...rest] = narrowings;
  const originalType = symbol.type;
  symbol.type = new BytesType(bound);
  executeWithNarrowedTypes(rest, fn);
  symbol.type = originalType;
}

// Extracts type narrowings from expressions like x.length == 20, including through && chains.
function extractBytesNarrowings(expr: ExpressionNode): Narrowing[] {
  if (!(expr instanceof BinaryOpNode)) return [];

  // Both sides of && must be true, so all narrowings apply
  if (expr.operator === BinaryOperator.AND) {
    return [...extractBytesNarrowings(expr.left), ...extractBytesNarrowings(expr.right)];
  }

  const narrowing = extractSingleBytesNarrowing(expr);
  return narrowing ? [narrowing] : [];
}

// Matches x.length == N or N == x.length where x is an unbounded bytes variable.
function extractSingleBytesNarrowing(expr: BinaryOpNode): Narrowing | undefined {
  if (expr.operator !== BinaryOperator.EQ) return undefined;

  const match = matchSizeLiteral(expr);
  if (!match) return undefined;

  const { sizeNode, literalNode } = match;
  if (!(sizeNode.expression instanceof IdentifierNode)) return undefined;

  const { definition } = sizeNode.expression;
  if (!definition || !(definition.type instanceof BytesType) || definition.type.bound !== undefined) return undefined;

  const bound = Number(literalNode.value);
  if (bound <= 0) return undefined;

  return { symbol: definition, bound };
}

// Matches expr.length <op> N or N <op> expr.length, returning the SIZE node and int literal.
function matchSizeLiteral(expr: BinaryOpNode): { sizeNode: UnaryOpNode, literalNode: IntLiteralNode } | undefined {
  if (isSizeOp(expr.left) && expr.right instanceof IntLiteralNode) {
    return { sizeNode: expr.left, literalNode: expr.right };
  }

  if (isSizeOp(expr.right) && expr.left instanceof IntLiteralNode) {
    return { sizeNode: expr.right, literalNode: expr.left };
  }

  return undefined;
}

const isSizeOp = (node: ExpressionNode): node is UnaryOpNode => (
  node instanceof UnaryOpNode && node.operator === UnaryOperator.SIZE
);

// If the expression is a call to a user-defined function (one with declared return types), returns
// that function's full ordered list of return types; otherwise returns undefined. This is the only
// source of an N-ary (N >= 2) tuple to destructure.
function userFunctionReturnTypes(node: ExpressionNode): Type[] | undefined {
  if (!(node instanceof FunctionCallNode)) return undefined;
  const { definition } = node.identifier;
  return definition?.returnTypes;
}

// Counts the number of `return` statements anywhere within a node (used to reject early/nested
// returns, which the lowering does not support).
function countReturns(node: Node): number {
  let count = 0;
  const counter = new (class extends AstTraversal {
    visitReturn(returnNode: ReturnNode): Node {
      count += 1;
      return super.visitReturn(returnNode);
    }
  })();
  node.accept(counter);
  return count;
}
