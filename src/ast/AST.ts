import { AstVisitor } from './AstVisitor';
import { BinaryOperator, UnaryOperator } from './Operator';
import { Location } from './Location';
import { Type } from './Type';

export abstract class Node {
    location?: Location;
    abstract accept<T>(visitor: AstVisitor<T>): T;
}

export interface Named {
    name: string;
}

export interface Typed {
    type: Type;
}

export class SourceFileNode extends Node {
    constructor(
        public contract: ContractNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitSourceFile(this);
    }
}

export class ContractNode extends Node implements Named {
    constructor(
        public name: string,
        public parameters: ParameterNode[],
        public variables: VariableDefinitionNode[],
        public functions: FunctionDefinitionNode[]
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitContract(this);
    }
}

export class FunctionDefinitionNode extends Node implements Named {
    constructor(
        public name: string,
        public parameters: ParameterNode[],
        public statements: StatementNode[]
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitFunctionDefinition(this);
    }
}

export class ParameterNode extends Node implements Named, Typed {
    constructor(
        public type: Type,
        public name: string
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitParameter(this);
    }
}

export type StatementNode = VariableDefinitionNode | AssignNode | BranchNode | FunctionCallNode;

export class VariableDefinitionNode extends Node implements Named, Typed {
    constructor(
        public type: Type,
        public name: string,
        public expression: ExpressionNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitVariableDefinition(this);
    }
}

export class AssignNode extends Node {
    constructor(
        public identifier: IdentifierNode,
        public expression: ExpressionNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitAssign(this);
    }
}

export class ThrowNode extends Node {
    constructor(
        public expression?: ExpressionNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitThrow(this);
    }
}

export class FunctionCallStatementNode extends Node {
    constructor(
        public functionCall: FunctionCallNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitFunctionCallStatement(this);
    }
}

export class BranchNode extends Node {
    constructor(
        public condition: ExpressionNode,
        public ifBlock: StatementNode[],
        public elseBlock?: StatementNode[]
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitBranch(this);
    }
}

export abstract class ExpressionNode extends Node {}

export class CastNode extends ExpressionNode implements Typed {
    constructor(
        public type: Type,
        public expression: ExpressionNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitCast(this);
    }
}

export class MemberAccessNode extends ExpressionNode {
    constructor(
        public object: ExpressionNode,
        public member: string
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitMemberAccess(this);
    }
}

export class MemberFunctionCallNode extends ExpressionNode {
    constructor(
        public object: ExpressionNode,
        public functionCall: FunctionCallNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitMemberFunctionCall(this);
    }
}

export class FunctionCallNode extends ExpressionNode {
    constructor(
        public identifier: IdentifierNode,
        public parameters: ExpressionNode[]
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitFunctionCall(this);
    }
}

export class BinaryOpNode extends ExpressionNode {
    constructor(
        public left: ExpressionNode,
        public operator: BinaryOperator,
        public right: ExpressionNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitBinaryOp(this);
    }
}

export class UnaryOpNode extends ExpressionNode {
    constructor(
        public operator: UnaryOperator,
        public expression: ExpressionNode
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitUnaryOp(this);
    }
}

// TODO: Add symboltable support
export class IdentifierNode extends ExpressionNode implements Named {
    constructor(
        public name: string
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitIdentifier(this);
    }
}

export abstract class LiteralNode extends ExpressionNode {}

export class BoolLiteralNode extends LiteralNode {
    constructor(
        public value: boolean
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitBoolLiteral(this);
    }
}

export class IntLiteralNode extends LiteralNode {
    constructor(
        public value: number
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitIntLiteral(this);
    }
}

export class StringLiteralNode extends LiteralNode {
    constructor(
        public value: string
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitStringLiteral(this);
    }
}

export class HexLiteralNode extends LiteralNode {
    constructor(
        public value: Buffer
    ) {
        super();
    }

    accept<T>(visitor: AstVisitor<T>): T {
        return visitor.visitHexLiteral(this);
    }
}
