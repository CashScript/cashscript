import { BinaryOperator, UnaryOperator } from './Operator';
import { Location } from './Location';
import { Type } from './Type';

export class Node {
    location?: Location;
}

export class SourceFileNode extends Node {
    constructor(
        public contract: ContractNode
    ) {
        super();
    }
}
export class ContractNode extends Node {
    constructor(
        public name: string,
        public parameters: ParameterNode[],
        public variables: VariableDefinitionNode[],
        public functions: FunctionDefinitionNode[]
    ) {
        super();
    }
}

export class FunctionDefinitionNode extends Node {
    constructor(
        public name: string,
        public parameters: ParameterNode[],
        public statements: StatementNode[]
    ) {
        super();
    }
}

export class ParameterNode extends Node {
    constructor(
        public type: Type,
        public name: string
    ) {
        super();
    }
}

export type StatementNode = VariableDefinitionNode | AssignNode | BranchNode | FunctionCallNode;


export class VariableDefinitionNode extends Node {
    constructor(
        public type: Type,
        public name: string,
        public expression: ExpressionNode
    ) {
        super();
    }
}

export class AssignNode extends Node {
    constructor(
        public identifier: IdentifierNode,
        public expression: ExpressionNode
    ) {
        super();
    }
}

export class ThrowNode extends Node {
    constructor(
        public expression?: ExpressionNode
    ) {
        super();
    }
}

export class BranchNode extends Node {
    constructor(
        public condition: ExpressionNode,
        public ifBlock: StatementNode[],
        public elseBlock: StatementNode[]
    ) {
        super();
    }
}

export class ExpressionNode extends Node {}

export class CastNode extends ExpressionNode {
    constructor(
        public type: Type,
        public expression: ExpressionNode
    ) {
        super();
    }
}

export class MemberAccessNode extends ExpressionNode {
    constructor(
        public object: ExpressionNode,
        public member: string
    ) {
        super();
    }
}

export class MemberFunctionCallNode extends ExpressionNode {
    constructor(
        public object: ExpressionNode,
        public functionCall: FunctionCallNode
    ) {
        super();
    }
}

export class FunctionCallNode extends ExpressionNode {
    constructor(
        public identifier: IdentifierNode,
        public parameters: ExpressionNode[]
    ) {
        super();
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
}

export class UnaryOpNode extends ExpressionNode {
    constructor(
        public operator: UnaryOperator,
        public expression: ExpressionNode
    ) {
        super();
    }
}

// TODO: Add symboltable support
export class IdentifierNode extends ExpressionNode {
    constructor(
        public name: string
    ) {
        super();
    }
}

export class LiteralNode extends ExpressionNode {}

export class BoolLiteralNode extends LiteralNode {
    constructor(
        public value: boolean
    ) {
        super();
    }
}

export class IntLiteralNode extends LiteralNode {
    constructor(
        public value: number
    ) {
        super();
    }
}


export class StringLiteralNode extends LiteralNode {
    constructor(
        public value: string
    ) {
        super();
    }
}

export class HexLiteralNode extends LiteralNode {
    constructor(
        public value: Buffer
    ) {
        super();
    }
}
