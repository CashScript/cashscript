import {
  PrimitiveType,
  explicitlyCastable,
  implicitlyCastable,
  implicitlyCastableSignature,
  resultingType,
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
  Node,
  InstantiationNode,
  TupleAssignmentNode,
  NullaryOpNode,
  SliceNode,
  IntLiteralNode,
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
  CastSizeError,
  TupleAssignmentError,
} from '../Errors.js';
import { BinaryOperator, NullaryOperator, UnaryOperator } from '../ast/Operator.js';
import { GlobalFunction } from '../ast/Globals.js';

export default class TypeCheckTraversal extends AstTraversal {
  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);
    expectAssignable(node, node.expression.type, node.type);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    node.tuple = this.visit(node.tuple);
    if (!(node.tuple instanceof BinaryOpNode) || node.tuple.operator !== BinaryOperator.SPLIT) {
      throw new TupleAssignmentError(node.tuple);
    }

    const assignmentType = new TupleType(node.left.type, node.right.type);

    if (!implicitlyCastable(node.tuple.type, assignmentType)) {
      throw new AssignTypeError(
        new VariableDefinitionNode(assignmentType, [], node.left.name, node.tuple),
      );
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

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock);
    node.elseBlock = this.visitOptional(node.elseBlock);

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node, node.condition.type, PrimitiveType.BOOL);
    }

    return node;
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);
    node.size = this.visitOptional(node.size);

    if (!explicitlyCastable(node.expression.type, node.type)) {
      throw new CastTypeError(node);
    }

    // Variable size cast is only possible from INT to unbounded BYTES
    if (node.size) {
      if (node.expression.type !== PrimitiveType.INT || node.type.toString() !== 'bytes') {
        throw new CastSizeError(node);
      }
    }

    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;
    if (!definition || !definition.parameters) return node; // already checked in symbol table

    const parameterTypes = node.parameters.map((p) => p.type as Type);
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
    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;
    if (!definition || !definition.parameters) return node; // already checked in symbol table

    const parameterTypes = node.parameters.map((p) => p.type as Type);
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

    const resType = resultingType(node.left.type, node.right.type);
    if (!resType && !node.operator.startsWith('.')) {
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

function expectSameSizeBytes(node: BinaryOpNode, left?: Type, right?: Type): void {
  if (!(left instanceof BytesType) || !(right instanceof BytesType)) {
    throw new UnsupportedTypeError(node, left, new BytesType());
  }

  if (left.bound !== right.bound) {
    throw new UnequalTypeError(node);
  }
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
