import { Script, scriptToBitAuthAsm } from './script.js';
import { sourceMapToLocationData } from './source-map.js';
import { PositionHint } from './types.js';

export type LineToOpcodesMap = Record<string, Script>;
export type LineToAsmMap = Record<string, string>;

export function buildLineToOpcodesMap(bytecode: Script, sourceMap: string): LineToOpcodesMap {
  const locationData = sourceMapToLocationData(sourceMap);

  return locationData.reduce<LineToOpcodesMap>((lineToOpcodeMap, { location, positionHint }, index) => {
    const opcode = bytecode[index];
    const line = positionHint === PositionHint.END ? location?.end.line : location?.start.line;

    return {
      ...lineToOpcodeMap,
      [line]: [...(lineToOpcodeMap[line] || []), opcode],
    };
  }, {});
}

export function buildLineToAsmMap(bytecode: Script, sourceMap: string): LineToAsmMap {
  const lineToOpcodesMap = buildLineToOpcodesMap(bytecode, sourceMap);

  return Object.fromEntries(
    Object.entries(lineToOpcodesMap).map(([lineNumber, opcodeList]) => [lineNumber, scriptToBitAuthAsm(opcodeList)]),
  );
}

export function formatBitAuthScript(bytecode: Script, sourceMap: string, sourceCode: string): string {
  const lineToAsmMap = buildLineToAsmMap(bytecode, sourceMap);

  const sourceCodeLines = sourceCode.split('\n');

  const sourceCodeLineLengths = sourceCodeLines.map((line) => line.length);
  const bytecodeLineLengths = Object.values(lineToAsmMap).map((line) => line.length);

  const maxSourceCodeLength = Math.max(...sourceCodeLineLengths);
  const maxBytecodeLength = Math.max(...bytecodeLineLengths);

  const annotatedAsmLines = sourceCodeLines.map((line, index) => {
    const lineAsm = lineToAsmMap[index + 1];
    return `${(lineAsm || '').padEnd(maxBytecodeLength)} /* ${line.padEnd(maxSourceCodeLength)} */`;
  });

  return annotatedAsmLines.join('\n');
}
