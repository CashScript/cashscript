#! /usr/bin/env node
import { binToHex } from '@bitauth/libauth';
import {
  asmToScript,
  calculateBytesize,
  countOpcodes,
  formatArtifact,
  scriptToAsm,
  scriptToBytecode,
} from '@cashscript/utils';
import { program, Option } from 'commander';
import fs from 'fs';
import path from 'path';
import { compileFile, version } from './index.js';
import { MAX_INPUT_BYTESIZE } from './constants.js';

program
  .storeOptionsAsProperties(false)
  .name('cashc')
  .version(version, '-V, --version', 'Output the version number.')
  .argument('<source_file>', 'The source file to compile.')
  .option('-o, --output <path>', 'Specify a file to output the generated artifact.')
  .option('-h, --hex', 'Compile the contract to hex format rather than a full artifact.')
  .option('-A, --asm', 'Compile the contract to ASM format rather than a full artifact.')
  .option('-c, --opcount', 'Display the number of opcodes in the compiled bytecode.')
  .option('-s, --size', 'Display the size in bytes of the compiled bytecode.')
  .addOption(
    new Option('-f, --format <format>', 'Specify the format of the output.')
      .choices(['json', 'ts'])
      .default('json'),
  )
  .helpOption('-?, --help', 'Display help')
  .parse();

const opts = program.opts();

run();

function run(): void {
  ensure(program.args.length === 1, 'Please provide exactly one source file');
  ensure(!(opts.asm && opts.hex), 'Flags --asm and --hex cannot be used together');
  ensure(!(opts.asm || opts.hex) || !opts.output, 'Flags --asm or --hex cannot be used with --output');
  ensure(!opts.args || opts.asm || opts.hex, '--args can only be used with --asm or --hex');

  const sourceFile = path.resolve(program.args[0]);
  ensure(fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile(), 'Please provide a valid source file');

  const outputFile = opts.output && opts.output !== '-' && path.resolve(opts.output);

  try {
    const artifact = compileFile(sourceFile);
    const script = asmToScript(artifact.bytecode);

    const opcount = countOpcodes(script);
    const bytesize = calculateBytesize(script);

    if (bytesize > MAX_INPUT_BYTESIZE) {
      console.warn(`Warning: Your contract is ${bytesize} bytes, which is over the limit of ${MAX_INPUT_BYTESIZE} bytes and will not be accepted by the BCH network`);
    }

    if (opts.asm) {
      console.log(scriptToAsm(script));
      return;
    }

    if (opts.hex) {
      console.log(binToHex(scriptToBytecode(script)));
      return;
    }

    // Opcount and size checks can happen together, but do not output compilation result
    if (opts.opcount || opts.size) {
      if (opts.opcount) {
        console.log('Opcode count:', opcount);
      }
      if (opts.size) {
        console.log('Bytesize:', bytesize);
      }
      return;
    }

    const formattedArtifact = formatArtifact(artifact, opts.format);

    if (outputFile) {
      // Create output file and write the artifact to it
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(outputFile, formattedArtifact);
    } else {
      // Output artifact to STDOUT
      console.log(formattedArtifact);
    }
  } catch (e: any) {
    abort(e.message);
  }
}

function ensure(condition: boolean, msg: string, code?: number): void {
  condition || abort(msg, code);
}

function abort(msg: string, code: number = 1): void {
  console.error(msg);
  process.exit(code);
}
