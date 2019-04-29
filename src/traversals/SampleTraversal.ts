import { ContractNode } from './../ast/AST';
import { AstTraversal } from "../ast/AstTraversal";
import { SourceFileNode } from "../ast/AST";

export class SampleTraversal extends AstTraversal {
    visitContract(node: ContractNode) {
        console.log(node.name);
        return super.visitContract(node);
    }
}
