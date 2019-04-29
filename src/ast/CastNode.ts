import { ExpressionNode } from './ExpressionNode';
import { Node } from "./Node";
import { Type } from "./Type";

export class CastNode extends ExpressionNode {
    constructor(
        public type: Type,
        public expression: Node
    ) {
        super();
    }
}
