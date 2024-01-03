import { Script, scriptToBitAuthAsm } from './script.js';
import { sourceMapToLocationData } from './source-map.js';

export type LineToOpcodesMap = Record<string, Script>;
export type LineToAsmMap = Record<string, string>;

export function buildLineToOpcodesMap(bytecode: Script, souceMap: string): LineToOpcodesMap {
  const locationData = sourceMapToLocationData(souceMap);

  return locationData.reduce<LineToOpcodesMap>((lineToOpcodeMap, [location, positionHint], index) => {
    const opcode = bytecode[index];
    const line = positionHint ? location?.end.line : location?.start.line;

    return {
      ...lineToOpcodeMap,
      [line]: [...(lineToOpcodeMap[line] || []), opcode],
    };
  }, {});
}

export function buildLineToAsmMap(bytecode: Script, souceMap: string): LineToAsmMap {
  const lineToOpcodesMap = buildLineToOpcodesMap(bytecode, souceMap);

  return Object.fromEntries(
    Object.entries(lineToOpcodesMap).map(([lineNumber, opcodeList]) => [lineNumber, scriptToBitAuthAsm(opcodeList)]),
  );
}

export function formatBitAuthScript(bytecode: Script, souceMap: string, sourceCode: string): string {
  const lineToAsmMap = buildLineToAsmMap(bytecode, souceMap);

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
