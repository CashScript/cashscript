import { Node } from "./Node";
import { Type } from "./Type";

export class ParameterNode extends Node {
    constructor(
        public type: Type,
        public name: string
    ) {
        super();
    }
}
