#! /usr/bin/env node
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { CashCompiler, Artifacts, version } from '.';
import { countOpcodes, Data, calculateBytesize } from './util';

const bch = require('trout-bch');

const { argv } = yargs
  .parserConfiguration({ 'parse-numbers': false })
  .usage('Usage: $0 [options] [source_file]')
  .option('output', {
    alias: 'o',
    describe: 'Specify a file to output the generated artifact.',
    type: 'string',
  })
  .option('hex', {
    alias: 'h',
    describe: 'Compile the contract to hex format rather than a full artifact',
    type: 'boolean',
  })
  .option('asm', {
    alias: 'A',
    describe: 'Compile the contract to ASM format rather than a full artifact',
    type: 'boolean',
  })
  .option('opcount', {
    alias: 'c',
    describe: 'Display the number of opcodes in the compiled bytecode',
    type: 'boolean',
  })
  .option('size', {
    alias: 's',
    describe: 'Display the size in bytes of the compiled bytecode',
    type: 'boolean',
  })
  .option('args', {
    alias: 'a',
    describe: 'List of constructor arguments to pass into the contract. '
      + 'Can only be used in combination with either the --hex or --asm flags. '
      + 'When compiling to a JSON artifact, contract instantiation should be done through the CashScript SDK. '
      + 'Note that NO type checking is performed by the cashc CLI, so it is safer to use the CashScript SDK.',
    type: 'array',
  })
  .showHelpOnFail(true)
  .help()
  .version(version);

run();

function run(): void {
  ensure(argv._.length === 1, 'Please provide exactly one source file');
  ensure(!(argv.asm && argv.hex), 'Flags --asm and --hex can not be used together');
  ensure(!(argv.asm || argv.hex) || !argv.output, 'Flags --asm or --hex can not be used with --output');
  ensure(argv.asm || argv.hex || !argv.args, '--args can only be used with --asm or --hex');

  const sourceFile = path.resolve(argv._[0]);
  const outputFile = argv.output && argv.output !== '-' && path.resolve(argv.output);
  ensure(fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile(), 'Please provide a valid source file');

  try {
    const artifact = CashCompiler.compileFile(sourceFile);
    const script = Data.asmToScript(artifact.bytecode);

    if (argv.args) {
      argv.args.forEach((arg) => {
        if (typeof arg !== 'string') return; // Yargs parses everything as string
        if (arg === 'true') {
          script.unshift(Data.encodeBool(true));
        } else if (arg === 'false') {
          script.unshift(Data.encodeBool(false));
        } else if (arg.startsWith('0x')) {
          script.unshift(Buffer.from(arg.substring(2), 'hex'));
        } else if (!Number.isNaN(Number(arg))) {
          script.unshift(Data.encodeInt(Number(arg)));
        } else {
          script.unshift(Data.encodeString(arg));
        }
      });
    }

    const opcount = countOpcodes(script);
    const bytesize = calculateBytesize(script);

    if (opcount > 201) {
      console.warn('Warning: Your contract\'s opcount is over the limit of 201 and will not be accepted by the BCH network');
    }
    if (bytesize > 520) {
      console.warn('Warning: Your contract\'s bytesize is over the limit of 520 and will not be accepted by the BCH network');
    }

    if (argv.asm) {
      console.log(Data.scriptToAsm(script));
      return;
    }

    if (argv.hex) {
      console.log(bch.script.compile(script).toString('hex'));
      return;
    }

    if (argv.opcount || argv.size) {
      if (argv.opcount) {
        console.log('Opcode count:', opcount);
      }
      if (argv.size) {
        console.log('Bytesize:', bytesize);
      }
      return;
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
}

function ensure(condition: boolean, msg: string, code?: number): void {
  condition || abort(msg, code);
}

function abort(msg: string, code: number = 1): void {
  console.error(msg);
  console.error();
  yargs.showHelp();
  process.exit(code);
}
