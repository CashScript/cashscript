import { Node } from "./Node";

export class FunctionDefinitionNode extends Node {
    constructor(
        public name: string,
        public parameters: Node[],
        public statements: Node[]
    ) {
        super();
    }
}
