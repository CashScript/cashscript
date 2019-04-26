import { ParameterNode } from './ParameterNode';
import { VariableDefinitionNode } from './VariableDefinitionNode';
import { FunctionDefinitionNode } from './FunctionDefinitionNode';
import { Node } from "./Node";

export class ContractNode extends Node {
    constructor(
        public name: string,
        public parameters: ParameterNode[],
        public variables: VariableDefinitionNode[],
        public functions: FunctionDefinitionNode[]
    ) {
        super();
    }
}
