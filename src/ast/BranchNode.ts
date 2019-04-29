import { Node } from "./Node";

export class BranchNode extends Node {
    constructor(
        public condition: Node,
        public ifBlock: Node[],
        public elseBlock: Node[]
    ) {
        super();
    }
}
