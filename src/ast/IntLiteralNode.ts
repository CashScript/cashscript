import { Node } from "./Node";

export class IntLiteralNode extends Node {
    constructor(
        public value: number
    ) {
        super();
    }
}
