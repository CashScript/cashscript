import { FullLocationData, PositionHint, SingleLocationData } from './types.js';

/*
 * The source mappings for the bytecode use the following notation (similar to Solidity):
 *
 * `sl:sc:el:ec:h`
 *
 * Where `sl` is the start line, `sc` - start column, `el` - end line, and `ec` - end column
 * of the range in the source file.
 * `h` is the position hint denoting where to place the instruction - at the beginning of the parent AST block
 * or at the end.
 * `h` is used with AST blocks, instructions of which surround children blocks, like function declarations and
 * if-then-else blocks.
 *
 * Mappings are a list of `sl:sc:el:ec:h` separated by `;`. Each of these elements corresponds to an instruction.
 *
 * In order to compress these source mappings, the following rules are used:
 *
 * If a field is empty, the value of the preceding element is used.
 * If a `:` is missing, all the following fields are considered empty.
 * This means the following source mappings represent the same information:
 *
 * 14:20:14:29;14:20:14:29;14:12:14:30;14:34:14:43;14:34:14:43
 *
 * 14:20:14:29;;:12::30;:34::43;
 *
 */
export function generateSourceMap(locationData: FullLocationData): string {
  let prevStartLine = 0;
  let prevStartColumn = 0;
  let prevEndLine = 0;
  let prevEndColumn = 0;
  let prevHint = PositionHint.START;

  return locationData.map(({ location, positionHint }: SingleLocationData) => {
    const prevStartLineString = prevStartLine === location.start.line ? '' : String(location.start.line);
    prevStartLine = location.start.line;

    const prevStartColumnString = prevStartColumn === location.start.column ? '' : String(location.start.column);
    prevStartColumn = location.start.column;

    const prevEndLineString = prevEndLine === location.end.line ? '' : String(location.end.line);
    prevEndLine = location.end.line;

    const prevEndColumnString = prevEndColumn === location.end.column ? '' : String(location.end.column);
    prevEndColumn = location.end.column;

    const hint = positionHint ?? PositionHint.START;
    const prevHintString = prevHint === hint ? '' : String(hint);
    prevHint = hint;

    let result = '';
    if (prevStartLineString) {
      result += prevStartLineString;
    }

    result += ':';
    if (prevStartColumnString) {
      result += prevStartColumnString;
    }

    result += ':';
    if (prevEndLineString) {
      result += prevEndLineString;
    }

    result += ':';
    if (prevEndColumnString) {
      result += prevEndColumnString;
    }

    result += ':';
    if (prevHintString) {
      result += prevHintString;
    }

    result = result.replace(/:*$/, '');
    return result;
  }).join(';');
}

export const sourceMapToLocationData = (sourceMap: string): FullLocationData => {
  let prevStartLine = 0;
  let prevStartColumn = 0;
  let prevEndLine = 0;
  let prevEndColumn = 0;
  let prevHint: PositionHint = PositionHint.START;

  return sourceMap.split(';').map((entry: string) => {
    const [startLineStr, startColumnStr, endLineStr, endColumnStr, positionHintStr] = entry.split(':');

    const startLine = startLineStr ? Number(startLineStr) : prevStartLine;
    prevStartLine = startLine;

    const startColumn = startColumnStr ? Number(startColumnStr) : prevStartColumn;
    prevStartColumn = startColumn;

    const endLine = endLineStr ? Number(endLineStr) : prevEndLine;
    prevEndLine = endLine;

    const endColumn = endColumnStr ? Number(endColumnStr) : prevEndColumn;
    prevEndColumn = endColumn;

    const hint: PositionHint = parsePositionHint(positionHintStr) ?? prevHint;
    prevHint = hint;

    return {
      location: {
        start: { line: startLine, column: startColumn },
        end: { line: endLine, column: endColumn },
      },
      positionHint: hint,
    };
  });
};

const parsePositionHint = (hint: string): PositionHint | undefined => {
  if (hint === '1') return PositionHint.END;
  if (hint === '0') return PositionHint.START;
  return undefined;
};

export function optimiseSourceMap(unoptimizedSourceMap: string, ipMap: number[]):string {
  // TODO: Implement the optimisation logic for the source map
  return unoptimizedSourceMap;
}