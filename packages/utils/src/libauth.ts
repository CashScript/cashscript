import { binToHex } from '@bitauth/libauth';
import { Script, Op } from './script.js';
import { sourceMapToLocationData } from './sourceMap.js';

function buildLineMap(bytecode: Script, souceMap: string): { [line: string]: Script; } {
  const lineMap: { [line: string]: Script } = {} as any;

  const locationData = sourceMapToLocationData(souceMap);

  const map = locationData.map(([location, positionHint], index) => {
    const op = bytecode[index];
    return [
      op,
      Object.keys(Op)[Object.values(Op).indexOf(op as Op)],
      // eslint-disable-next-line
      positionHint
        ? location?.end.line
        // : (op === Op.OP_ENDIF || op === Op.OP_ELSE || op === Op.OP_NIP || op === Op.OP_CHECKLOCKTIMEVERIFY
        //   ? location?.end.line
          : location?.start.line,
    ];
  });

  map.forEach(([op, , line]) => {
    if (!lineMap[line as string]) {
      lineMap[line as string] = [];
    }
    lineMap[line as string].push(op as any);
  });

  return lineMap;
}

export function buildOpCodeMap(bytecode: Script, souceMap: string) {
  const lineMap = buildLineMap(bytecode, souceMap);

  const opCodeMap: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(lineMap)) {
    opCodeMap[key] = value.map((asmElement) => {
      if (asmElement instanceof Uint8Array) {
        if (asmElement.length === 0) {
          return 'OP_0';
        }
        return `<0x${binToHex(asmElement)}>`;
      }
      return Object.keys(Op)[Object.values(Op).indexOf(asmElement)];
    }).join(' ');
  }

  return opCodeMap;
}

export function formatLibauthScript(bytecode: Script, souceMap: string, sourceCode: string): string {
  const opCodeMap = buildOpCodeMap(bytecode, souceMap);

  const split = sourceCode.split('\n');

  const maxCodeLength = Math.max(...split.map((val) => val.length));
  const maxBytecodeLength = Math.max(...Object.values(opCodeMap).map((val) => val.length));

  const result = split.map((line, index) => {
    const opCodes = opCodeMap[index + 1];
    return `${(opCodes || '').padEnd(maxBytecodeLength)} /* ${line.padEnd(maxCodeLength)} */`;
  }).join('\n');

  return result;
}
