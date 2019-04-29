import { Node } from "./Node";

export class StringLiteralNode extends Node {
    constructor(
        public value: string
    ) {
        super();
    }
}
