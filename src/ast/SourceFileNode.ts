import { ContractNode } from './ContractNode';
import { Node } from "./Node";

export class SourceFileNode extends Node {
    constructor(public contract: ContractNode) {
        super();
    }
}
