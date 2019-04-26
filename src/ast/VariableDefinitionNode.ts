import { Node } from "./Node";
import { Type } from "./Type";

export class VariableDefinitionNode extends Node {
    constructor(
        public type: Type,
        public name: string,
        public expression: Node
    ) {
        super();
    }
}
