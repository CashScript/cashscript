#! /usr/bin/env node
import * as yargs from 'yargs';
import * as pjson from 'pjson';
import * as fs from 'fs';
import * as path from 'path';
import { CashCompiler, Artifacts } from './util';

const { argv } = yargs
  .usage('Usage: $0 [options] [source_file]')
  .option('output', {
    alias: 'o',
    describe: 'Specify a file to output the generated artifact.',
    type: 'string',
    demand: true,
  })
  .showHelpOnFail(true)
  .help()
  .version(`v${pjson.version}`);

console.log(argv);

ensure(argv._.length === 1, 'Please provide exactly one source file');
const sourceFile = path.resolve(process.cwd(), argv._[0]);
const outputFile = path.resolve(process.cwd(), argv.output);
ensure(fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile(), 'Please provide a valid source file');

try {
  const artifact = CashCompiler.compileFile(sourceFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  Artifacts.export(artifact, outputFile);
} catch (e) {
  abort(e.message);
}

function ensure(condition: boolean, msg: string, code?: number) {
  condition || abort(msg, code);
}

function abort(msg: string, code: number = 1) {
  console.error(msg);
  process.exit(code);
}
