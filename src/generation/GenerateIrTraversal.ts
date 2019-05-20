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
  RequireNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import {
  Call,
  PushInt,
  Get,
  PushBool,
  PushString,
  PushBytes,
  Replace,
  IrOp,
} from './IR';
import { GlobalFunction } from '../ast/Globals';
import { BinaryOperator } from '../ast/Operator';
import { Op } from './Script';

export default class GenerateIrTraversal extends AstTraversal {
  output: IrOp[] = [];
  stack: string[] = [];

  private scopeDepth = 0;

  private emit(op: IrOp) {
    this.output.push(op);
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

  visitContract(node: ContractNode) {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    if (node.functions.length === 1) {
      node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    } else {
      this.pushToStack('$$', true);
      node.functions = node.functions.map((f, i) => {
        const stackCopy = [...this.stack];
        this.emit(new Get(this.getStackIndex('$$')));
        this.emit(new PushInt(i));
        this.emit(new Call(BinaryOperator.EQ));
        this.emit(Op.IF);
        f = this.visit(f) as FunctionDefinitionNode;

        if (i < node.functions.length - 1) {
          this.emit(Op.ELSE);
          this.stack = [...stackCopy];
        }

        return f;
      });

      node.functions.forEach(() => this.emit(Op.ENDIF));
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

  visitRequire(node: RequireNode) {
    node.expression = this.visit(node.expression);
    this.emit(new Call(GlobalFunction.REQUIRE));
    this.popFromStack();
    return node;
  }

  visitBranch(node: BranchNode) {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(Op.IF);

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth);

    if (node.elseBlock) {
      this.emit(Op.ELSE);
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth);
    }

    this.emit(Op.ENDIF);
    this.scopeDepth -= 1;

    return node;
  }

  removeScopedVariables(depthBeforeScope: number) {
    for (let i = 0; i < this.stack.length - depthBeforeScope; i += 1) {
      this.emit(Op.DROP);
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

    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      const sigs = node.parameters[0] as ArrayNode;
      const pks = node.parameters[1] as ArrayNode;
      this.popFromStack(sigs.elements.length + pks.elements.length + 2);
    } else {
      this.popFromStack(node.parameters.length);
    }

    this.pushToStack('(value)');

    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode) {
    node.tuple = this.visit(node.tuple);

    if (node.index === 0) {
      this.emit(Op.DROP);
      this.popFromStack();
    } else if (node.index === 1) {
      this.emit(Op.NIP);
      this.nipFromStack();
    }

    return node;
  }

  visitSizeOp(node: SizeOpNode) {
    node.object = this.visit(node.object);
    this.emit(new Call('size'));
    this.popFromStack();
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
