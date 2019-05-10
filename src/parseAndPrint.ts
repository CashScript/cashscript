import * as fs from 'fs';
import { printAst, parseCode } from './sdk';

printAst(parseCode(fs.readFileSync(process.argv[2], { encoding: 'utf-8' })));
