import { Node, SourceFileNode, ContractNode, ParameterNode, VariableDefinitionNode, FunctionDefinitionNode, AssignNode, IdentifierNode, ThrowNode, BranchNode, CastNode, MemberAccessNode, MemberFunctionCallNode, FunctionCallNode, UnaryOpNode, BinaryOpNode, BoolLiteralNode, IntLiteralNode, HexLiteralNode, StringLiteralNode, ExpressionNode, StatementNode, LiteralNode } from './AST';
import { UnaryOperator, BinaryOperator } from './Operator';
import { getTypeFromCtx } from './Type';
import { ContractDefinitionContext, FunctionDefinitionContext, VariableDefinitionContext, ParameterContext, AssignStatementContext, IfStatementContext, ThrowStatementContext, FunctionCallContext, CastContext, ExpressionContext, LiteralContext, NumberLiteralContext, FunctionCallStatementContext } from '../grammar/CashScriptParser';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { CashScriptVisitor } from '../grammar/CashScriptVisitor';
import { SourceFileContext } from '../grammar/CashScriptParser';
import { Location } from './Location';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { NumberUnit } from './NumberUnit';
export class AstBuilder extends AbstractParseTreeVisitor<Node> implements CashScriptVisitor<Node> {
    constructor(private tree: ParseTree) {
        super();
    }

    defaultResult(): Node {
        return new BoolLiteralNode(false);
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
        const parameters = ctx.parameterList().parameter().map(p => this.visit(p) as ParameterNode);
        const statements = ctx.statement().map(s => this.visit(s) as StatementNode);
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

    visitFunctionCallStatement(ctx: FunctionCallStatementContext): FunctionCallNode {
        return this.visit(ctx.functionCall()) as FunctionCallNode;
    }

    visitIfStatement(ctx: IfStatementContext): BranchNode {
        const condition = this.visit(ctx.expression());
        // I want these _ifBlock variables to be getters @antlr4ts :(
        const ifBlock = ctx._ifBlock.statement().map(s => this.visit(s) as StatementNode);
        const elseBlock = ctx._elseBlock.statement().map(s => this.visit(s) as StatementNode);
        const branch = new BranchNode(condition, ifBlock, elseBlock);
        branch.location = Location.fromCtx(ctx);
        return branch;
    }

    visitExpression(ctx: ExpressionContext): ExpressionNode {
        if (ctx._paren) {
            return this.visit(ctx._paren);
        } else if (ctx.cast()) {
            return this.visit(ctx.cast() as CastContext);
        } else if (ctx._obj) {
            if (ctx.Identifier()) {
                return this.createMemberAccess(ctx);
            } else {
                return this.createMemberFunctionCall(ctx);
            }
        } else if (ctx.functionCall()) {
            return this.visit(ctx.functionCall() as FunctionCallContext);
        } else if (ctx._left) {
            return this.createBinaryOp(ctx);
        } else if (ctx._right) {
            return this.createUnaryOp(ctx);
        } else if (ctx.Identifier()) {
            return this.createIdentifier(ctx);
        } else { // literal
            const literal = ctx.literal() as LiteralContext;
            return this.createLiteral(literal);
        }
    }

    visitCast(ctx: CastContext): CastNode {
        const type = getTypeFromCtx(ctx.typeName());
        const expression = this.visit(ctx.expression());
        const cast = new CastNode(type, expression);
        cast.location = Location.fromCtx(ctx);
        return cast;
    }

    createMemberAccess(ctx: ExpressionContext): MemberAccessNode {
        const obj = this.visit(ctx._obj);
        const member = (ctx.Identifier() as TerminalNode).text;
        const memberAccess = new MemberAccessNode(obj, member);
        memberAccess.location = Location.fromCtx(ctx);
        return memberAccess;
    }

    createMemberFunctionCall(ctx: ExpressionContext): MemberFunctionCallNode {
        const obj = this.visit(ctx._obj);
        const functionCall = this.visit(ctx.functionCall() as FunctionCallContext) as FunctionCallNode;
        const memberFunctionCall = new MemberFunctionCallNode(obj, functionCall);
        memberFunctionCall.location = Location.fromCtx(ctx);
        return memberFunctionCall;
    }

    visitFunctionCall(ctx: FunctionCallContext): FunctionCallNode {
        const identifier = new IdentifierNode(ctx.GlobalFunction().text);
        const parameters = ctx.expressionList().expression().map(e => this.visit(e) as ExpressionNode);
        const functionCall = new FunctionCallNode(identifier, parameters);
        functionCall.location = Location.fromCtx(ctx);
        return functionCall;
    }

    createBinaryOp(ctx: ExpressionContext): BinaryOpNode {
        const left = this.visit(ctx._left);
        const operator = ctx._op.text as BinaryOperator;
        const right = this.visit(ctx._right);
        const binaryOp = new BinaryOpNode(left, operator, right);
        binaryOp.location = Location.fromCtx(ctx);
        return binaryOp;
    }

    createUnaryOp(ctx: ExpressionContext): UnaryOpNode {
        const operator = ctx._op.text as UnaryOperator;
        const expression = this.visit(ctx._right);
        const unaryOp = new UnaryOpNode(operator, expression);
        unaryOp.location = Location.fromCtx(ctx);
        return unaryOp;
    }

    createIdentifier(ctx: ExpressionContext): IdentifierNode {
        const identifier = new IdentifierNode((ctx.Identifier() as TerminalNode).text);
        identifier.location = Location.fromCtx(ctx);
        return identifier;
    }

    createLiteral(ctx: LiteralContext): LiteralNode {
        if (ctx.BooleanLiteral()) {
            return this.createBooleanLiteral(ctx);
        } else if (ctx.numberLiteral()) {
            return this.createIntLiteral(ctx);
        } else if (ctx.StringLiteral()) {
            return this.createStringLiteral(ctx);
        } else {
            return this.createHexLiteral(ctx);
        }
    }

    createBooleanLiteral(ctx: LiteralContext): BoolLiteralNode {
        const boolString = (ctx.BooleanLiteral() as TerminalNode).text;
        const boolValue = boolString == "true";
        const booleanLiteral = new BoolLiteralNode(boolValue);
        booleanLiteral.location = Location.fromCtx(ctx);
        return booleanLiteral;
    }

    createIntLiteral(ctx: LiteralContext): IntLiteralNode {
        const numberCtx = ctx.numberLiteral() as NumberLiteralContext;
        const numberString = numberCtx.NumberLiteral().text;
        const numberUnit = numberCtx.NumberUnit();
        let numberValue = parseInt(numberString);
        numberValue *= numberUnit ? NumberUnit[numberUnit.text.toUpperCase()] : 1;
        const intLiteral = new IntLiteralNode(numberValue);
        intLiteral.location = Location.fromCtx(ctx);
        return intLiteral;
    }

    createStringLiteral(ctx: LiteralContext): StringLiteralNode {
        const rawString = (ctx.StringLiteral() as TerminalNode).text;
        const stringValue = rawString.substring(1, rawString.length - 1);
        const stringLiteral = new StringLiteralNode(stringValue);
        stringLiteral.location = Location.fromCtx(ctx);
        return stringLiteral;
    }

    createHexLiteral(ctx: LiteralContext): HexLiteralNode {
        const hexString = (ctx.HexLiteral() as TerminalNode).text;
        const hexValue = Buffer.from(hexString.substring(2), "hex");
        const hexLiteral = new HexLiteralNode(hexValue);
        hexLiteral.location = Location.fromCtx(ctx);
        return hexLiteral;
    }
}
