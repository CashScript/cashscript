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
  UnpackedVariableNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
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
} from '../Errors';
import { BinaryOperator, UnaryOperator } from '../ast/Operator';
import { GlobalFunction } from '../ast/Globals';

export default class TypeCheckTraversal extends AstTraversal {
  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);
    expectAssignable(node, node.expression.type, node.type);
    return node;
  }

  visitUnpackedVariable(node: UnpackedVariableNode): Node {
    node.tuple = this.visit(node.tuple);
    expectAssignable(node.createVariableDefNode('name'), (node.tuple.type as TupleType).elementType, node.type);
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

    node.type = (node.tuple.type as TupleType).elementType;
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

        // Result of split are two unbounded bytes types (could be improved to do type inference)
        node.type = new TupleType(
          node.left.type instanceof BytesType ? new BytesType() : PrimitiveType.STRING,
        );
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

type ExpectedNode = BinaryOpNode | UnaryOpNode | TimeOpNode | TupleIndexOpNode;
function expectAnyOfTypes(node: ExpectedNode, actual?: Type, expectedTypes?: Type[]): void {
  if (!expectedTypes || expectedTypes.length === 0) return;
  if (expectedTypes.find((expected) => implicitlyCastable(actual, expected))) {
    return;
  }

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
    throw new UnsupportedTypeError(node, actual, new TupleType());
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
