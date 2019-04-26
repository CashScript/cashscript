import { FunctionDefinitionNode } from './FunctionDefinitionNode';
import { ContractNode } from './ContractNode';
import { ContractDefinitionContext, FunctionDefinitionContext, StatementContext, VariableDefinitionContext } from './../grammar/CashScriptParser';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { Node } from './Node';
import { CashScriptVisitor } from '../grammar/CashScriptVisitor';
import { SourceFileContext } from '../grammar/CashScriptParser';
import { SourceFileNode } from './SourceFileNode';
import { Location } from './Location';
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
        const parameters = ctx.parameterList().parameter().map(p => this.visit(p));
        const variables = ctx.variableDefinition().map(v => this.visit(v))
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
}
