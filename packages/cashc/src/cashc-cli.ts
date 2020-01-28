#! /usr/bin/env node
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { CashCompiler, Artifacts, version } from '.';
import { countOpcodes, Data, calculateBytesize } from './util';

const { argv } = yargs
  .usage('Usage: $0 [options] [source_file]')
  .option('output', {
    alias: 'o',
    describe: 'Specify a file to output the generated artifact.',
    type: 'string',
  })
  .showHelpOnFail(true)
  .help()
  .version(version);

ensure(argv._.length === 1, 'Please provide exactly one source file');
const sourceFile = path.resolve(argv._[0]);
const outputFile = argv.output && argv.output !== '-' && path.resolve(argv.output);
ensure(fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile(), 'Please provide a valid source file');

try {
  const artifact = CashCompiler.compileFile(sourceFile);

  const script = Data.asmToScript(artifact.bytecode);
  const opcount = countOpcodes(script);
  const bytesize = calculateBytesize(script);
  if (opcount > 201) {
    console.warn('Warning: Your contract\'s opcount is over the limit of 201 and will not be accepted by the BCH network');
  }
  if (bytesize > 520) {
    console.warn('Warning: Your contract\'s bytesize is over the limit of 520 and will not be accepted by the BCH network');
  }

  if (!outputFile) {
    console.log(JSON.stringify(artifact, null, 2));
  } else {
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    Artifacts.export(artifact, outputFile);
  }
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
