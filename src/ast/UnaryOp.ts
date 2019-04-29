import { ExpressionNode } from './ExpressionNode';
import { Node } from "./Node";
import { UnaryOperator } from './Operator';

export class UnaryOp extends ExpressionNode {
    constructor(
        public operator: UnaryOperator,
        public expression: Node
    ) {
        super();
    }
}
