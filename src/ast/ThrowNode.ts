import { Node } from "./Node";

export class ThrowNode extends Node {
    constructor(
        public expression?: Node
    ) {
        super();
    }
}
