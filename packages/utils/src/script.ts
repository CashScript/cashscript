import {
  OpcodesBch2023,
  encodeDataPush,
  hexToBin,
  disassembleBytecodeBch,
  flattenBinArray,
  encodeAuthenticationInstructions,
  decodeAuthenticationInstructions,
} from '@bitauth/libauth';
import OptimisationsEquivFile from './cashproof-optimisations.js';
import extraOptimisations from './extra-optimizations.js';
import type { FullLocationData, SingleLocationData } from './types.js';
import { generateSourceMap } from './source-map.js';

export const Op = OpcodesBch2023;
export type Op = number;
export type OpOrData = Op | Uint8Array;
export type Script = OpOrData[];

export function scriptToAsm(script: Script): string {
  return bytecodeToAsm(scriptToBytecode(script));
}

export function scriptToBitAuthAsm(script: Script): string {
  return bytecodeToBitAuthAsm(scriptToBytecode(script));
}

export function asmToScript(asm: string): Script {
  return bytecodeToScript(asmToBytecode(asm));
}

// asmToBytecode also works for BitAuth ASM
export function bitAuthAsmToScript(asm: string): Script {
  return asmToScript(asm);
}

export function scriptToBytecode(script: Script): Uint8Array {
  // Convert the script elements to AuthenticationInstructions
  const instructions = script.map((opOrData) => {
    if (typeof opOrData === 'number') {
      return { opcode: opOrData };
    }

    return decodeAuthenticationInstructions(encodeDataPush(opOrData))[0];
  });

  // Convert the AuthenticationInstructions to bytecode
  return encodeAuthenticationInstructions(instructions);
}

export function bytecodeToScript(bytecode: Uint8Array): Script {
  // Convert the bytecode to AuthenticationInstructions
  const instructions = decodeAuthenticationInstructions(bytecode);

  // Convert the AuthenticationInstructions to script elements
  const script = instructions.map((instruction) => (
    'data' in instruction ? instruction.data : instruction.opcode
  ));

  return script;
}

export function asmToBytecode(asm: string): Uint8Array {
  // Remove any duplicate whitespace
  asm = asm.replace(/\s+/g, ' ').trim();

  // Convert the ASM tokens to AuthenticationInstructions
  const instructions = asm.split(' ').map((token) => {
    if (token.startsWith('OP_')) {
      return { opcode: Op[token as keyof typeof Op] };
    }

    const data = token.replace(/<|>/g, '').replace(/^0x/, '');

    return decodeAuthenticationInstructions(encodeDataPush(hexToBin(data)))[0];
  });

  // Convert the AuthenticationInstructions to bytecode
  return encodeAuthenticationInstructions(instructions);
}

export function bytecodeToAsm(bytecode: Uint8Array): string {
  // Convert the bytecode to libauth's ASM format
  let asm = disassembleBytecodeBch(bytecode);

  // COnvert libauth's ASM format to BITBOX's
  asm = asm.replace(/OP_PUSHBYTES_[^\s]+/g, '');
  asm = asm.replace(/OP_PUSHDATA[^\s]+ [^\s]+/g, '');
  asm = asm.replace(/(^|\s)0x/g, ' ');

  // Remove any duplicate whitespace
  asm = asm.replace(/\s+/g, ' ').trim();

  return asm;
}

// TODO: If we decide to change the ASM / artifact format, we can remove this function and merge it with bytecodeToAsm
export function bytecodeToBitAuthAsm(bytecode: Uint8Array): string {
  // Convert the bytecode to libauth's ASM format
  let asm = disassembleBytecodeBch(bytecode);

  // COnvert libauth's ASM format to BitAuth Script ASM
  asm = asm.replace(/OP_PUSHBYTES_[^\s]+/g, '');
  asm = asm.replace(/OP_PUSHDATA[^\s]+ [^\s]+/g, '');
  asm = asm.replace(/(^|\s)(0x\w*)/g, ' \<$2\>');

  // Remove any duplicate whitespace
  asm = asm.replace(/\s+/g, ' ').trim();

  return asm;
}

export function countOpcodes(script: Script): number {
  return script
    .filter((opOrData) => typeof opOrData === 'number')
    .filter((op) => (op as number) > Op.OP_16)
    .length;
}

export function calculateBytesize(script: Script): number {
  return scriptToBytecode(script).byteLength;
}

// For encoding OP_RETURN data (doesn't require BIP62.3 / MINIMALDATA)
export function encodeNullDataScript(chunks: OpOrData[]): Uint8Array {
  return flattenBinArray(
    chunks.map((chunk) => {
      if (typeof chunk === 'number') {
        return new Uint8Array([chunk]);
      }

      const pushdataOpcode = getPushDataOpcode(chunk);
      return new Uint8Array([...pushdataOpcode, ...chunk]);
    }),
  );
}

function getPushDataOpcode(data: Uint8Array): Uint8Array {
  const { byteLength } = data;

  if (byteLength === 0) return Uint8Array.from([0x4c, 0x00]);
  if (byteLength < 76) return Uint8Array.from([byteLength]);
  if (byteLength < 256) return Uint8Array.from([0x4c, byteLength]);
  throw Error('Pushdata too large');
}

export function generateRedeemScript(baseScript: Script, encodedConstructorArgs: Script): Script {
  return [...encodedConstructorArgs.slice().reverse(), ...baseScript];
}

interface OptimiseBytecodeResult {
  sourceMap: string,
  oldToNewIpMap: number[],
  optimisedBytecode: Script
}

export function optimiseBytecode(
  script: Script, locationData: FullLocationData, runs: number = 1000,
): OptimiseBytecodeResult {
  const cashProofoptimisations = OptimisationsEquivFile
    // Split by line and filter all line comments (#)
    .split('\n')
    .map((equiv) => equiv.trim())
    .filter((equiv) => !equiv.startsWith('#'))
    // Join back the lines, and split on semicolon
    .join('')
    .split(';')
    // Parse all optimisations in .equiv file
    .map((equiv) => equiv.trim())
    .map((equiv) => equiv.split('<=>').map((part) => part.trim()))
    .filter((equiv) => equiv.length === 2);

  const optimisations = [...cashProofoptimisations, ...extraOptimisations];
  let oldToNewIpMap = script.map((_, i) => i);

  for (let i = 0; i < runs; i += 1) {
    const oldScript = script;
    ({ script, locationData, oldToNewIpMap } = replaceOps(script, optimisations, locationData, oldToNewIpMap));

    // Break on fixed point
    if (scriptToAsm(oldScript) === scriptToAsm(script)) break;
  }

  const sourceMap = generateSourceMap(locationData);

  return {
    sourceMap,
    oldToNewIpMap,
    optimisedBytecode: script,
  };
}

interface AnnotatedOp {
  op: OpOrData;
  oldIp: number;
  location: SingleLocationData;
}

interface ReplaceOpsResult {
  script: Script,
  locationData: FullLocationData,
  oldToNewIpMap: number[],
}
function replaceOps(
  script: Script, optimisations: string[][], oldLocationData: FullLocationData, oldToNewIpMap: number[],
): ReplaceOpsResult {
  let annotatedScript: AnnotatedOp[] = script.map((op, i) => ({
    op,
    oldIp: oldToNewIpMap[i],
    location: oldLocationData[i],
  }));

  const tokenizedOptimisations = optimisations.map(([from, to]) => [
    from.trim().split(/\s+/),
    to.trim().split(/\s+/),
  ] as [string[], string[]]);

  const newAnnotatedScript: AnnotatedOp[] = [];
  const updatedIpMap = new Array(oldLocationData.length).fill(undefined);
  
  for (let i = 0; i < annotatedScript.length;) {
    let matched = false;
  
    for (const [fromPattern, toPattern] of tokenizedOptimisations) {
      const slice = annotatedScript.slice(i, i + fromPattern.length).map(op => op.op.toString());
  
      const matchingExpression = slice.length === fromPattern.length && slice.every((item, j) => item === fromPattern[j]);
      if (matchingExpression) {
        // Match found — apply replacement
        const replacedOps = annotatedScript.slice(i, i + fromPattern.length);
        const fallbackLocation = replacedOps[0].location;
  
        toPattern.forEach((opcodeString, j) => {
          const oldIp = replacedOps[Math.min(j, replacedOps.length - 1)].oldIp;
          const newIp = newAnnotatedScript.length;
          const opcode = OpcodesBch2023[opcodeString as keyof typeof OpcodesBch2023];

          newAnnotatedScript.push({
            op: opcode as OpOrData,
            oldIp,
            location: fallbackLocation,
          });
  
          updatedIpMap[oldIp] = newIp;
        });
  
        i += fromPattern.length;
        matched = true;
        break;
      }
    }
  
    if (!matched) {
      // No pattern matched — keep the op as-is
      const newIp = newAnnotatedScript.length;
      const { op, oldIp, location } = annotatedScript[i];
      newAnnotatedScript.push({ op, oldIp, location });
      updatedIpMap[oldIp] = newIp;
      i += 1;
    }
  }

  return {
    script: newAnnotatedScript.map(({ op }) => op),
    locationData: newAnnotatedScript.map(({ location }) => location),
    oldToNewIpMap: updatedIpMap,
  };
}
