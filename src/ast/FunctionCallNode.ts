import { Node } from "./Node";
import { IdentifierNode } from "./IdentifierNode";

export class FunctionCallNode extends Node {
    constructor(
        public identifier: IdentifierNode,
        public parameters: Node[]
    ) {
        super();
    }
}
