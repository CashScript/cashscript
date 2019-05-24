import * as fs from 'fs';
import { parseCode } from '../util';
import GenerateIrTraversal from '../generation/GenerateIrTraversal';
import TypeCheckTraversal from '../semantic/TypeCheckTraversal';
import SymbolTableTraversal from '../semantic/SymbolTableTraversal';
import GenerateTargetTraversal from '../generation/GenerateTargetTraversal';
import { generateAbi, Abi } from './ABI';
import { Ast } from '../ast/AST';

export function compile(code: string): Abi {
  let ast = parseCode(code);
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  const irTraversal = new GenerateIrTraversal();
  ast.accept(irTraversal);
  const ir = irTraversal.output;
  const targetCode = new GenerateTargetTraversal(ir).traverse();

  return generateAbi(ast, targetCode);
}

export function compileFile(codeFile: string): Abi {
  const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
  return compile(code);
}

export { Contract, Sig } from './Contract';
