import { FunctionDefinitionNode } from './FunctionDefinitionNode';
import { Node } from "./Node";

export class ContractNode extends Node {
    constructor(
        public name: string,
        public parameters: Node[],
        public variables: Node[],
        public functions: FunctionDefinitionNode[]
    ) {
        super();
    }
}
