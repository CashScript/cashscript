import { Node } from "./Node";

export class HexLiteralNode extends Node {
    constructor(
        public value: Buffer
    ) {
        super();
    }
}
