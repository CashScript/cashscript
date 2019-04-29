import { BinaryOperator } from './Operator';
import { ExpressionNode } from './ExpressionNode';
import { Node } from "./Node";

export class BinaryOp extends ExpressionNode {
    constructor(
        public left: Node,
        public operator: BinaryOperator,
        public right: Node
    ) {
        super();
    }
}
