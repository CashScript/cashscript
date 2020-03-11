import {
  AssignNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  IdentifierNode,
  SizeOpNode,
  SplitOpNode,
  TimeOpNode,
  VariableDefinitionNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  Node,
  InstantiationNode,
  BlockNode,
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
} from '../Errors';
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
} from '../ast/Type';
import { BinaryOperator, UnaryOperator } from '../ast/Operator';
import { GlobalFunction } from '../ast/Globals';

export default class TypeCheckTraversal extends AstTraversal {
  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, node.type)) {
      throw new AssignTypeError(node);
    }

    return node;
  }

  visitAssign(node: AssignNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, node.identifier.type)) {
      throw new AssignTypeError(node);
    }

    return node;
  }

  visitTimeOp(node: TimeOpNode): Node {
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, PrimitiveType.INT)) {
      throw new UnsupportedTypeError(node, node.expression.type, PrimitiveType.INT);
    }

    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);

    if (!implicitlyCastable(node.expression.type, PrimitiveType.BOOL)) {
      const actual = node.expression.type ? [node.expression.type] : [];
      throw new InvalidParameterTypeError(node, actual, [PrimitiveType.BOOL]);
    }

    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock) as BlockNode;
    node.elseBlock = this.visitOptional(node.elseBlock) as BlockNode;

    if (!implicitlyCastable(node.condition.type, PrimitiveType.BOOL)) {
      throw new TypeError(node, node.condition.type, PrimitiveType.BOOL);
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
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);

    const { definition, type } = node.identifier;
    if (!definition || !definition.parameters) return node; // aready checked in symbol table

    const parameterTypes = node.parameters.map(p => p.type as Type);

    if (!implicitlyCastableSignature(parameterTypes, definition.parameters)) {
      throw new InvalidParameterTypeError(node, parameterTypes, definition.parameters);
    }

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
    if (!definition || !definition.parameters) return node; // aready checked in symbol table

    const parameterTypes = node.parameters.map(p => p.type as Type);

    if (!implicitlyCastableSignature(parameterTypes, definition.parameters)) {
      throw new InvalidParameterTypeError(node, parameterTypes, definition.parameters);
    }

    node.type = type;
    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);

    if (!(node.tuple.type instanceof TupleType)) {
      throw new UnsupportedTypeError(node, node.tuple.type, new TupleType());
    }

    if (node.index !== 0 && node.index !== 1) {
      throw new IndexOutOfBoundsError(node);
    }

    node.type = node.tuple.type.elementType;
    return node;
  }

  visitSizeOp(node: SizeOpNode): Node {
    node.object = this.visit(node.object);

    if (!implicitlyCastable(node.object.type, new BytesType())
     && !implicitlyCastable(node.object.type, PrimitiveType.STRING)
    ) { // Should support Bytes and String
      throw new UnsupportedTypeError(node, node.object.type, new BytesType());
    }

    node.type = PrimitiveType.INT;
    return node;
  }

  visitSplitOp(node: SplitOpNode): Node {
    node.object = this.visit(node.object);
    node.index = this.visit(node.index);

    if (!implicitlyCastable(node.object.type, new BytesType())
     && !implicitlyCastable(node.object.type, PrimitiveType.STRING)
    ) { // Should support Bytes and String
      throw new UnsupportedTypeError(node, node.object.type, new BytesType());
    }

    if (!implicitlyCastable(node.index.type, PrimitiveType.INT)) {
      throw new UnsupportedTypeError(node, node.object.type, PrimitiveType.INT);
    }

    // Result of split are two unbounded bytes types (could be improved to do type inference)
    const elementType = node.object.type instanceof BytesType
      ? new BytesType()
      : PrimitiveType.STRING;
    node.type = new TupleType(elementType);
    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
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
         && !implicitlyCastable(resType, new BytesType())
        ) { // Should support int, string, bytes
          throw new UnsupportedTypeError(node, resType, PrimitiveType.INT);
        }
        node.type = resType;
        // Infer new bounded bytes type if both operands are bounded bytes types
        if (node.left.type instanceof BytesType && node.right.type instanceof BytesType) {
          if (node.left.type.bound && node.right.type.bound) {
            node.type = new BytesType(node.left.type.bound + node.right.type.bound);
          }
        }
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

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);

    switch (node.operator) {
      case UnaryOperator.NOT:
        if (!implicitlyCastable(node.expression.type, PrimitiveType.BOOL)) {
          throw new UnsupportedTypeError(node, node.expression.type, PrimitiveType.BOOL);
        }
        node.type = PrimitiveType.BOOL;
        break;
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
