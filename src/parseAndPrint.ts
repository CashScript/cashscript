import * as fs from 'fs';
import {
  parseCode,
  printAstAsCode,
  printTargetCode,
  compileToTargetCode,
} from './sdk';

printAstAsCode(parseCode(fs.readFileSync(process.argv[2], { encoding: 'utf-8' })));
printTargetCode(compileToTargetCode(fs.readFileSync(process.argv[2], { encoding: 'utf-8' })));
