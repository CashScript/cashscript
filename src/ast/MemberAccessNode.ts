import { Node } from "./Node";
import { ExpressionNode } from "./ExpressionNode";

export class MemberAccessNode extends ExpressionNode {
    constructor(
        public object: Node,
        public member: string
    ) {
        super();
    }
}
