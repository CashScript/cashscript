import { Node } from "./Node";

export class AssignNode extends Node {
    constructor(
        public name: string,
        public expression: Node
    ) {
        super();
    }
}
