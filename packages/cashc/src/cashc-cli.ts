#! /usr/bin/env node
import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import { CashCompiler, Artifacts, version } from '.';

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
  .version(version);

ensure(argv._.length === 1, 'Please provide exactly one source file');
const sourceFile = path.resolve(argv._[0]);
const outputFile = path.resolve(argv.output);
ensure(fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile(), 'Please provide a valid source file');

try {
  const artifact = CashCompiler.compileFile(sourceFile);
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  Artifacts.export(artifact, outputFile);
} catch (e) {
  abort(e.message);
}

function ensure(condition: boolean, msg: string, code?: number): void {
  condition || abort(msg, code);
}

function abort(msg: string, code: number = 1): void {
  console.error(msg);
  process.exit(code);
}
