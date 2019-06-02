import * as fs from 'fs';
import {
  parseCode,
  printAstAsCode,
  printTargetCode,
} from './src/util';
import { compileFile } from './src/sdk/cashscript-sdk';

printAstAsCode(parseCode(fs.readFileSync(process.argv[2], { encoding: 'utf-8' })));
printTargetCode(compileFile(process.argv[2]).uninstantiatedScript);
