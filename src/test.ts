import * as fs from 'fs';
import * as path from 'path';
import SymbolTableTraversal from './semantic/SymbolTableTraversal';
import { parseCode, printAstAsCode } from './sdk';

const contents = fs.readFileSync(path.join(__dirname, '..', 'test', 'syntax', 'success', 'everything.cash'), { encoding: 'utf-8' });
const ast = parseCode(contents);
const st = new SymbolTableTraversal();

ast.accept(st);
printAstAsCode(ast);
