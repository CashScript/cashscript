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
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import {
  InvalidParameterTypeError,
  UnequalTypeError,
  UnsupportedTypeError,
} from '../Errors';
import {
  Type,
  isBytes,
  compatibleType,
  compatibleSignature,
  explicitlyCastable,
} from '../ast/Type';
import { BinaryOperator, UnaryOperator } from '../ast/Operator';

export default class TypeCheckTraversal extends AstTraversal {
  visitVariableDefinition(node: VariableDefinitionNode) {
    node.expression = this.visit(node.expression);

    if (node.expression.type !== node.type) {
      throw new Error(); // TODO
    }

    return node;
  }

  visitAssign(node: AssignNode) {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.expression = this.visit(node.expression);

    if (node.expression.type !== node.identifier.type) {
      throw new Error(); // TODO
    }

    return node;
  }

  visitTimeOp(node: TimeOpNode) {
    node.expression = this.visit(node.expression);

    if (node.expression.type !== Type.INT) {
      throw new Error(); // TODO
    }

    return node;
  }

  visitBranch(node: BranchNode) {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock);
    node.elseBlock = this.visitOptional(node.elseBlock);

    if (node.condition.type !== Type.BOOL) {
      throw new Error(); // TODO
    }

    return node;
  }

  visitCast(node: CastNode) {
    node.expression = this.visit(node.expression);
    if (!explicitlyCastable(node.expression.type, node.type)) {
      throw new Error(); // TODO Cast error
    }

    return node;
  }

  visitFunctionCall(node: FunctionCallNode) {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;

    if (!definition || !definition.parameters) return node;

    const parameterTypes = node.parameters.map(p => p.type as Type);

    if (!compatibleSignature(parameterTypes, definition.parameters)) {
      throw new InvalidParameterTypeError(node, definition.parameters, parameterTypes);
    }

    node.type = type;
    return node;
  }

  visitSizeOp(node: SizeOpNode) {
    node.object = this.visit(node.object);

    if (!compatibleType(node.object.type, Type.BYTES)
     && !compatibleType(node.object.type, Type.STRING)
    ) {
      throw new UnsupportedTypeError(node, Type.BYTES); // supports Bytes and String
    }

    node.type = Type.INT;
    return node;
  }

  visitSpliceOp(node: SpliceOpNode) {
    node.object = this.visit(node.object);
    node.index = this.visit(node.index);

    if (!compatibleType(node.object.type, Type.BYTES)
     && !compatibleType(node.object.type, Type.STRING)
    ) {
      throw new UnsupportedTypeError(node, Type.BYTES); // supports Bytes and String
    }
    if (!compatibleType(node.index.type, Type.INT)) {
      throw new UnsupportedTypeError(node, Type.INT);
    }

    node.type = isBytes(node.object.type) ? Type.BYTES : Type.STRING;
    return node;
  }

  visitBinaryOp(node: BinaryOpNode) {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);

    if ((!compatibleType(node.left.type, node.right.type))) {
      throw new UnequalTypeError(node);
    }

    switch (node.operator) {
      case BinaryOperator.PLUS:
        if (!compatibleType(node.left.type, Type.INT)
         && !compatibleType(node.left.type, Type.STRING)
         && !compatibleType(node.left.type, Type.BYTES)
        ) {
          throw new UnsupportedTypeError(node, Type.INT); // supports int, string, bytes
        }
        node.type = isBytes(node.left.type) ? Type.BYTES : node.left.type;
        break;
      case BinaryOperator.DIV:
      case BinaryOperator.MOD:
      case BinaryOperator.MINUS:
        if (!compatibleType(node.left.type, Type.INT)) {
          throw new UnsupportedTypeError(node, Type.INT);
        }
        node.type = Type.INT;
        break;
      case BinaryOperator.LT:
      case BinaryOperator.LE:
      case BinaryOperator.GT:
      case BinaryOperator.GE:
        if (!compatibleType(node.left.type, Type.INT)) {
          throw new UnsupportedTypeError(node, Type.INT);
        }
        node.type = Type.BOOL;
        break;
      case BinaryOperator.EQ:
      case BinaryOperator.NE:
        node.type = Type.BOOL;
        break;
      case BinaryOperator.AND:
      case BinaryOperator.OR:
        if (node.left.type !== Type.BOOL) {
          throw new UnsupportedTypeError(node, Type.BOOL);
        }
        node.type = Type.BOOL;
        break;
      default:
    }

    return node;
  }

  visitUnaryOp(node: UnaryOpNode) {
    node.expression = this.visit(node.expression);

    switch (node.operator) {
      case UnaryOperator.NOT:
        if (!compatibleType(node.expression.type, Type.BOOL)) {
          throw new UnsupportedTypeError(node, Type.BOOL);
        }
        node.type = Type.BOOL;
        break;
      case UnaryOperator.PLUS:
      case UnaryOperator.NEGATE:
        if (!compatibleType(node.expression.type, Type.INT)) {
          throw new UnsupportedTypeError(node, Type.INT);
        }
        node.type = Type.INT;
        break;
      default:
    }

    return node;
  }

  visitIdentifier(node: IdentifierNode) {
    if (!node.definition) return node;
    node.type = node.definition.type;
    return node;
  }
}
