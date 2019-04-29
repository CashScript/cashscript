import { Node, SourceFileNode, ContractNode, FunctionDefinitionNode, ParameterNode, VariableDefinitionNode, AssignNode, ThrowNode, BranchNode, CastNode, MemberAccessNode, MemberFunctionCallNode, FunctionCallNode, UnaryOpNode, BinaryOpNode, IdentifierNode, BoolLiteralNode, IntLiteralNode, StringLiteralNode, HexLiteralNode, StatementNode, ExpressionNode } from './AST';
import { AstVisitor } from "./AstVisitor";

export class AstTraversal extends AstVisitor<Node> {
    visitSourceFile(node: SourceFileNode): Node {
        node.contract = this.visit(node.contract) as ContractNode;
        return node;
    }

    visitContract(node: ContractNode): Node {
        node.parameters = this.visitList(node.parameters) as ParameterNode[];
        node.variables = this.visitList(node.variables) as VariableDefinitionNode[];
        node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
        return node;
    }

    visitFunctionDefinition(node: FunctionDefinitionNode): Node {
        node.parameters = this.visitList(node.parameters) as ParameterNode[];
        node.statements = this.visitList(node.statements) as StatementNode[];
        return node;
    }

    visitParameter(node: ParameterNode): Node {
        return node;
    }

    visitVariableDefinition(node: VariableDefinitionNode): Node {
        node.expression = this.visit(node.expression);
        return node;
    }

    visitAssign(node: AssignNode): Node {
        node.identifier = this.visit(node.identifier) as IdentifierNode;
        node.expression = this.visit(node.expression);
        return node;
    }

    visitThrow(node: ThrowNode): Node {
        node.expression = this.optionalVisit(node.expression);
        return node;
    }

    visitBranch(node: BranchNode): Node {
        node.condition = this.visit(node.condition);
        node.ifBlock = this.visitList(node.ifBlock) as StatementNode[];
        node.elseBlock = this.visitList(node.elseBlock) as StatementNode[];
        return node;
    }

    visitCast(node: CastNode): Node {
        node.expression = this.visit(node.expression);
        return node;
    }

    visitMemberAccess(node: MemberAccessNode): Node {
        node.object = this.visit(node.object);
        return node;
    }

    visitMemberFunctionCall(node: MemberFunctionCallNode): Node {
        node.object = this.visit(node.object);
        node.functionCall = this.visit(node.functionCall) as FunctionCallNode;
        return node;
    }

    visitFunctionCall(node: FunctionCallNode): Node {
        node.identifier = this.visit(node.identifier) as IdentifierNode;
        node.parameters = this.visitList(node.parameters);
        return node;
    }

    visitBinaryOp(node: BinaryOpNode): Node {
        node.left = this.visit(node.left);
        node.right = this.visit(node.left);
        return node;
    }

    visitUnaryOp(node: UnaryOpNode): Node {
        node.expression = this.visit(node.expression);
        return node;
    }

    visitIdentifier(node: IdentifierNode): Node {
        return node;
    }

    visitBoolLiteral(node: BoolLiteralNode): Node {
        return node;
    }

    visitIntLiteral(node: IntLiteralNode): Node {
        return node;
    }

    visitStringLiteral(node: StringLiteralNode): Node {
        return node;
    }

    visitHexLiteral(node: HexLiteralNode): Node {
        return node;
    }
}
