import {
  AssignNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  IdentifierNode,
  SizeOpNode,
  SpliceOpNode,
  TimeOpNode,
  VariableDefinitionNode,
  ArrayNode,
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
} from '../Errors';
import {
  PrimitiveType,
  explicitlyCastable,
  implicitlyCastable,
  implicitlyCastableSignature,
  resultingType,
  arrayType,
  ArrayType,
} from '../ast/Type';
import { BinaryOperator, UnaryOperator } from '../ast/Operator';

export default class TypeCheckTraversal extends AstTraversal {
  visitVariableDefinition(node: VariableDefinitionNode) {
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, node.type)) {
      throw new AssignTypeError(node);
    }

    return node;
  }

  visitAssign(node: AssignNode) {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, node.identifier.type)) {
      throw new AssignTypeError(node);
    }

    return node;
  }

  visitTimeOp(node: TimeOpNode) {
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, PrimitiveType.INT)) {
      throw new UnsupportedTypeError(node, node.expression.type, PrimitiveType.INT);
    }

    return node;
  }

  visitBranch(node: BranchNode) {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock);
    node.elseBlock = this.visitOptional(node.elseBlock);

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node, PrimitiveType.BOOL, node.condition.type);
    }

    return node;
  }

  visitCast(node: CastNode) {
    node.expression = this.visit(node.expression);

    if (!explicitlyCastable(node.expression.type, node.type)) {
      throw new CastTypeError(node);
    }

    return node;
  }

  visitFunctionCall(node: FunctionCallNode) {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;
    if (!definition || !definition.parameters) return node; // aready checked in symbol table

    const parameterTypes = node.parameters.map(p => p.type as PrimitiveType);

    if (!implicitlyCastableSignature(parameterTypes, definition.parameters)) {
      throw new InvalidParameterTypeError(node, definition.parameters, parameterTypes);
    }

    node.type = type;
    return node;
  }

  visitSizeOp(node: SizeOpNode) {
    node.object = this.visit(node.object);

    if (!implicitlyCastable(node.object.type, PrimitiveType.BYTES)
     && !implicitlyCastable(node.object.type, PrimitiveType.STRING)
    ) { // Should support Bytes and String
      throw new UnsupportedTypeError(node, node.object.type, PrimitiveType.BYTES);
    }

    node.type = PrimitiveType.INT;
    return node;
  }

  visitSpliceOp(node: SpliceOpNode) {
    node.object = this.visit(node.object);
    node.index = this.visit(node.index);

    if (!implicitlyCastable(node.object.type, PrimitiveType.BYTES)
     && !implicitlyCastable(node.object.type, PrimitiveType.STRING)
    ) { // Should support Bytes and String
      throw new UnsupportedTypeError(node, node.object.type, PrimitiveType.BYTES);
    }

    if (!implicitlyCastable(node.index.type, PrimitiveType.INT)) {
      throw new UnsupportedTypeError(node, node.object.type, PrimitiveType.INT);
    }

    // TODO: Splice should return two values, left and right
    // node.type = isBytes(node.object.type) ? PrimitiveType.BYTES : PrimitiveType.STRING;
    return node;
  }

  visitBinaryOp(node: BinaryOpNode) {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);

    const resType = resultingType(node.left.type, node.right.type);
    if (!resType) {
      throw new UnequalTypeError(node);
    }

    switch (node.operator) {
      case BinaryOperator.PLUS:
        if (!implicitlyCastable(resType, PrimitiveType.INT)
         && !implicitlyCastable(resType, PrimitiveType.STRING)
         && !implicitlyCastable(resType, PrimitiveType.BYTES)
        ) { // Should support int, string, bytes
          throw new UnsupportedTypeError(node, resType, PrimitiveType.INT);
        }
        node.type = resType;
        break;
      case BinaryOperator.DIV:
      case BinaryOperator.MOD:
      case BinaryOperator.MINUS:
        if (!implicitlyCastable(resType, PrimitiveType.INT)) {
          throw new UnsupportedTypeError(node, resType, PrimitiveType.INT);
        }
        node.type = resType;
        break;
      case BinaryOperator.LT:
      case BinaryOperator.LE:
      case BinaryOperator.GT:
      case BinaryOperator.GE:
        if (!implicitlyCastable(resType, PrimitiveType.INT)) {
          throw new UnsupportedTypeError(node, resType, PrimitiveType.INT);
        }
        node.type = PrimitiveType.BOOL;
        break;
      case BinaryOperator.EQ:
      case BinaryOperator.NE:
        node.type = PrimitiveType.BOOL;
        break;
      case BinaryOperator.AND:
      case BinaryOperator.OR:
        if (!implicitlyCastable(resType, PrimitiveType.BOOL)) {
          throw new UnsupportedTypeError(node, resType, PrimitiveType.BOOL);
        }
        node.type = PrimitiveType.BOOL;
        break;
      default:
    }

    return node;
  }

  visitUnaryOp(node: UnaryOpNode) {
    node.expression = this.visit(node.expression);

    switch (node.operator) {
      case UnaryOperator.NOT:
        if (!implicitlyCastable(node.expression.type, PrimitiveType.BOOL)) {
          throw new UnsupportedTypeError(node, node.expression.type, PrimitiveType.BOOL);
        }
        node.type = PrimitiveType.BOOL;
        break;
      case UnaryOperator.PLUS:
      case UnaryOperator.NEGATE:
        if (!implicitlyCastable(node.expression.type, PrimitiveType.INT)) {
          throw new UnsupportedTypeError(node, node.expression.type, PrimitiveType.INT);
        }
        node.type = PrimitiveType.INT;
        break;
      default:
    }

    return node;
  }

  visitArray(node: ArrayNode) {
    node.elements = this.visitList(node.elements);

    const elementTypes = node.elements.map((e) => {
      if (!e.type || e.type instanceof ArrayType) {
        throw new ArrayElementError(node);
      }
      return e.type;
    });
    const elementType = arrayType(elementTypes);

    if (!elementType) {
      throw new ArrayElementError(node);
    }

    node.type = new ArrayType(elementType);
    return node;
  }

  visitIdentifier(node: IdentifierNode) {
    if (!node.definition) return node;
    node.type = node.definition.type;
    return node;
  }
}
