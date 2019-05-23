import * as fs from 'fs';
import {
  parseCode,
  printAstAsCode,
  printTargetCode,
} from './util';
import { compileFile, Contract } from './sdk/cashscript-sdk';

printAstAsCode(parseCode(fs.readFileSync(process.argv[2], { encoding: 'utf-8' })));
printTargetCode(compileFile(process.argv[2]).uninstantiatedScript);

const abi = compileFile(process.argv[2]);
const TransferWithTimeout = new Contract(abi);
const instance = TransferWithTimeout.new('senderPK', 'recipientPK', 500000);
console.log(instance.address);

// instance.functions.timeout('recipientSig').send('address', 1000000);
