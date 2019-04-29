import { Node } from "./Node";
import { ExpressionNode } from "./ExpressionNode";

export class MemberFunctionCallNode extends ExpressionNode {
    constructor(
        public object: Node,
        public functionCall: Node
    ) {
        super();
    }
}
