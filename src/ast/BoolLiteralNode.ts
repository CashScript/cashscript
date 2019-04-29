import { Node } from "./Node";

export class BoolLiteralNode extends Node {
    constructor(
        public value: boolean
    ) {
        super();
    }
}
