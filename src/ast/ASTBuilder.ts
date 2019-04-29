import { MemberFunctionCallNode } from './MemberFunctionCallNode';
import { MemberAccessNode } from './MemberAccessNode';
import { CastNode } from './CastNode';
import { BranchNode } from './BranchNode';
import { AssignNode } from './AssignNode';
import { VariableDefinitionNode } from './VariableDefinitionNode';
import { getTypeFromCtx } from './Type';
import { FunctionDefinitionNode } from './FunctionDefinitionNode';
import { ContractNode } from './ContractNode';
import { ContractDefinitionContext, FunctionDefinitionContext, VariableDefinitionContext, ParameterContext, AssignStatementContext, IfStatementContext, ThrowStatementContext, FunctionCallContext, CastContext, ExpressionContext } from './../grammar/CashScriptParser';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { Node } from './Node';
import { CashScriptVisitor } from '../grammar/CashScriptVisitor';
import { SourceFileContext } from '../grammar/CashScriptParser';
import { SourceFileNode } from './SourceFileNode';
import { Location } from './Location';
import { ParameterNode } from './ParameterNode';
import { ThrowNode } from './ThrowNode';
import { FunctionCallNode } from './FunctionCallNode';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { IdentifierNode } from './IdentifierNode';
export class ASTBuilder extends AbstractParseTreeVisitor<Node> implements CashScriptVisitor<Node> {
    constructor(private tree: ParseTree) {
        super();
    }

    defaultResult(): Node {
        return new Node();
    }

    build(): Node {
        return this.visit(this.tree);
    }

    visitSourceFile(ctx: SourceFileContext): SourceFileNode {
        const contract = this.visit(ctx.contractDefinition()) as ContractNode;
        const sourceFileNode = new SourceFileNode(contract);
        sourceFileNode.location = Location.fromCtx(ctx);
        return sourceFileNode;
    }

    visitContractDefinition(ctx: ContractDefinitionContext): ContractNode {
        const name = ctx.Identifier().text;
        const parameters = ctx.parameterList().parameter().map(p => this.visit(p) as ParameterNode);
        const variables = ctx.variableDefinition().map(v => this.visit(v) as VariableDefinitionNode)
        const functions = ctx.functionDefinition().map(f => this.visit(f) as FunctionDefinitionNode);
        const contract = new ContractNode(name, parameters, variables, functions);
        contract.location = Location.fromCtx(ctx);
        return contract;
    }

    visitFunctionDefinition(ctx: FunctionDefinitionContext): FunctionDefinitionNode {
        const name = ctx.Identifier().text;
        const parameters = ctx.parameterList().parameter().map(p => this.visit(p));
        const statements = ctx.statement().map(s => this.visit(s));
        const functionDefinition = new FunctionDefinitionNode(name, parameters, statements);
        functionDefinition.location = Location.fromCtx(ctx);
        return functionDefinition;
    }

    visitParameter(ctx: ParameterContext): ParameterNode {
        const type = getTypeFromCtx(ctx.typeName());
        const name = ctx.Identifier().text;
        const parameter = new ParameterNode(type, name);
        parameter.location = Location.fromCtx(ctx);
        return parameter;
    }

    visitVariableDefinition(ctx: VariableDefinitionContext): VariableDefinitionNode {
        const type = getTypeFromCtx(ctx.typeName());
        const name = ctx.Identifier().text;
        const expression = this.visit(ctx.expression());
        const variableDefinition = new VariableDefinitionNode(type, name, expression);
        variableDefinition.location = Location.fromCtx(ctx);
        return variableDefinition;
    }

    visitAssignStatement(ctx: AssignStatementContext): AssignNode {
        const identifier = new IdentifierNode(ctx.Identifier().text);
        const expression = this.visit(ctx.expression());
        const assign = new AssignNode(identifier, expression);
        assign.location = Location.fromCtx(ctx);
        return assign;
    }

    visitThrowStatement(ctx: ThrowStatementContext): ThrowNode {
        const expressionCtx = ctx.expression();
        const expression = expressionCtx && this.visit(expressionCtx);
        const throwNode = new ThrowNode(expression);
        throwNode.location = Location.fromCtx(ctx);
        return throwNode;
    }

    visitIfStatement(ctx: IfStatementContext): BranchNode {
        const condition = this.visit(ctx.expression());
        // I want these _ifBlock variables to be getters @antlr4ts :(
        const ifBlock = ctx._ifBlock.statement().map(s => this.visit(s));
        const elseBlock = ctx._elseBlock.statement().map(s => this.visit(s));
        const branch = new BranchNode(condition, ifBlock, elseBlock);
        branch.location = Location.fromCtx(ctx);
        return branch;
    }

    visitFunctionCall(ctx: FunctionCallContext): FunctionCallNode {
        const identifier = new IdentifierNode(ctx.ReservedFunction().text);
        const parameters = ctx.expressionList().expression().map(e => this.visit(e));
        const functionCall = new FunctionCallNode(identifier, parameters);
        functionCall.location = Location.fromCtx(ctx);
        return functionCall;
    }
}
