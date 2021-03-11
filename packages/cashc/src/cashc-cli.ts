#! /usr/bin/env node
import { binToHex, hexToBin } from '@bitauth/libauth';
import {
  asmToScript,
  calculateBytesize,
  countOpcodes,
  encodeBool,
  encodeInt,
  encodeString,
  exportArtifact,
  scriptToAsm,
  scriptToBytecode,
} from '@cashscript/utils';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { compileFile, version } from '.';

program
  .storeOptionsAsProperties(false)
  .name('cashc')
  .version(version, '-V, --version', 'Output the version number.')
  .usage('[options] [source_file]')
  .option('-o, --output <path>', 'Specify a file to output the generated artifact.')
  .option('-h, --hex', 'Compile the contract to hex format rather than a full artifact.')
  .option('-A, --asm', 'Compile the contract to ASM format rather than a full artifact.')
  .option('-c, --opcount', 'Display the number of opcodes in the compiled bytecode.')
  .option('-s, --size', 'Display the size in bytes of the compiled bytecode.')
  .option('-a, --args <args...>', 'List of constructor arguments to pass into the contract. '
  + 'Can only be used in combination with either the --hex or --asm flags. '
  + 'When compiling to a JSON artifact, contract instantiation should be done through the CashScript SDK. '
  + 'Note that NO type checking is performed by the cashc CLI, so it is safer to use the CashScript SDK.')
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

    // Parse any provided args and add these to the front of the script
    if (opts.args) {
      opts.args.forEach((arg: string) => {
        if (arg === 'true') {
          script.unshift(encodeBool(true));
        } else if (arg === 'false') {
          script.unshift(encodeBool(false));
        } else if (arg.startsWith('0x')) {
          script.unshift(hexToBin(arg.substring(2)));
        } else if (!Number.isNaN(Number(arg))) {
          script.unshift(encodeInt(Number(arg)));
        } else {
          script.unshift(encodeString(arg));
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

    if (outputFile) {
      // Create output file and write the artifact to it
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      exportArtifact(artifact, outputFile);
    } else {
      // Output artifact to STDOUT
      console.log(JSON.stringify(artifact, null, 2));
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
  process.exit(code);
}
