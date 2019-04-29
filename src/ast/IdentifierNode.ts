import { Node } from "./Node";

// TODO: Add symboltable support
export class IdentifierNode extends Node {
    constructor(
        public name: string
    ) {
        super();
    }
}
