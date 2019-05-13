import * as fs from 'fs';
import { parseCode, printAstAsCode } from './sdk';

printAstAsCode(parseCode(fs.readFileSync(process.argv[2], { encoding: 'utf-8' })));
