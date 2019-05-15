import {
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  AssignNode,
  IdentifierNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  BlockNode,
  TimeOpNode,
  SizeOpNode,
  SpliceOpNode,
  ArrayNode,
  TupleIndexOpNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import {
  Call,
  If,
  Else,
  EndIf,
  Op,
  Drop,
  Nip,
  PushInt,
  Get,
  PushBool,
  PushString,
  PushBytes,
  Replace,
} from './IR';
import { GlobalFunction } from '../ast/Globals';
import { PrimitiveType } from '../ast/Type';

export default class GenerateIrTraversal extends AstTraversal {
  output: Op[] = [];
  stack: string[] = [];

  private scopeDepth = 0;

  private emit(op: Op, addToFront?: boolean) {
    if (addToFront) {
      this.output.unshift(op);
    } else {
      this.output.push(op);
    }
  }

  private pushToStack(value: string, pushToBottom?: boolean) {
    if (pushToBottom) {
      this.stack.push(value);
    } else {
      this.stack.unshift(value);
    }
  }

  private popFromStack(count: number = 1) {
    for (let i = 0; i < count; i += 1) {
      this.stack.shift();
    }
  }

  private nipFromStack() {
    this.stack.splice(1, 1);
  }

  private getStackIndex(value: string) {
    const index = this.stack.indexOf(value);
    if (index === -1) throw new Error(); // Should not happen
    return index;
  }

  // private remove(op: Op) {
  //   const index = this.output.findIndex(o => o.toString() === op.toString());
  //   if (index) {
  //     this.output.splice(index, 1);
  //   }
  // }

  // TODO: Only works with single functions
  visitContract(node: ContractNode) {
    if (node.functions.length === 1) {
      node.parameters = this.visitList(node.parameters) as ParameterNode[];
      node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    }

    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode) {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body) as BlockNode;
    return node;
  }

  visitParameter(node: ParameterNode) {
    this.pushToStack(node.name, true);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode) {
    node.expression = this.visit(node.expression);
    this.popFromStack();
    this.pushToStack(node.name);
    return node;
  }

  visitAssign(node: AssignNode) {
    node.expression = this.visit(node.expression);
    if (this.scopeDepth > 0) {
      this.emit(new Replace(this.getStackIndex(node.identifier.name)));
      this.popFromStack();
    } else {
      this.popFromStack();
      this.pushToStack(node.identifier.name);
    }
    return node;
  }

  visitTimeOp(node: TimeOpNode) {
    node.expression = this.visit(node.expression);
    this.emit(new Call(node.timeOp));
    this.popFromStack();
    return node;
  }

  // TODO: Doesn't support scoped variables yet
  visitBranch(node: BranchNode) {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(new If());

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth);

    if (node.elseBlock) {
      this.emit(new Else());
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth);
    }

    this.emit(new EndIf());
    this.scopeDepth -= 1;

    return node;
  }

  removeScopedVariables(depthBeforeScope: number) {
    for (let i = 0; i < this.stack.length - depthBeforeScope; i += 1) {
      this.emit(new Drop());
      this.popFromStack();
    }
  }

  visitCast(node: CastNode) {
    node.expression = this.visit(node.expression);
    this.emit(new Call(node.type));
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitFunctionCall(node: FunctionCallNode) {
    node.parameters = this.visitList(node.parameters);
    this.emit(new Call(node.identifier.name as GlobalFunction));

    this.popFromStack(node.parameters.length);
    if (node.type !== PrimitiveType.VOID) {
      this.pushToStack('(value)');
    }

    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode) {
    node.tuple = this.visit(node.tuple);

    if (node.index === 0) {
      this.emit(new Drop());
      this.popFromStack();
    } else if (node.index === 1) {
      this.emit(new Nip());
      this.nipFromStack();
    }

    return node;
  }

  visitSizeOp(node: SizeOpNode) {
    node.object = this.visit(node.object);
    this.emit(new Call('size'));
    this.pushToStack('(value)');
    return node;
  }

  visitSpliceOp(node: SpliceOpNode) {
    node.object = this.visit(node.object);
    node.index = this.visit(node.index);
    this.emit(new Call('splice'));
    this.popFromStack(2);
    this.pushToStack('(value)');
    this.pushToStack('(value)');
    return node;
  }

  visitBinaryOp(node: BinaryOpNode) {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    this.emit(new Call(node.operator));
    this.popFromStack(2);
    this.pushToStack('(value)');
    return node;
  }

  visitUnaryOp(node: UnaryOpNode) {
    node.expression = this.visit(node.expression);
    this.emit(new Call(node.operator));
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitArray(node: ArrayNode) {
    node.elements = this.visitList(node.elements);
    this.emit(new PushInt(node.elements.length));
    this.pushToStack('(value)');
    return node;
  }

  visitIdentifier(node: IdentifierNode) {
    this.emit(new Get(this.getStackIndex(node.name)));
    this.pushToStack('(value)');
    return node;
  }

  visitBoolLiteral(node: BoolLiteralNode) {
    this.emit(new PushBool(node.value));
    this.pushToStack('(value)');
    return node;
  }

  visitIntLiteral(node: IntLiteralNode) {
    this.emit(new PushInt(node.value));
    this.pushToStack('(value)');
    return node;
  }

  visitStringLiteral(node: StringLiteralNode) {
    this.emit(new PushString(node.value));
    this.pushToStack('(value)');
    return node;
  }

  visitHexLiteral(node: HexLiteralNode) {
    this.emit(new PushBytes(node.value));
    this.pushToStack('(value)');
    return node;
  }
}
