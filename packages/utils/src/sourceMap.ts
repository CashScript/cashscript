export interface LocationI {
  start: {
    line: number,
    column: number
  };
  end: {
    line: number,
    column: number
  };
}

export type LocationData = Array<[location: LocationI, positionHint?: number]>;

/*
 * The source mappings for the bytecode use the following notation (similar to Solidity):
 *
 * `sl:sc:el:ec:h`
 *
 * Where `sl` is the start line, `sc` - start column, `el` - end line, and `ec` - end column of the range in the source file.
 * `h` is the position hint denoting where to place the instruction - at the beginning of the parent AST block or at the end.
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
export function generateSourceMap(locationData: LocationData): string {
  let prevStartLine = 0;
  let prevStartColumn = 0;
  let prevEndLine = 0;
  let prevEndColumn = 0;
  let prevHint = 0;

  return locationData.map((row: any) => {
    const prevStartLineString = prevStartLine === row[0].start.line ? '' : String(row[0].start.line);
    prevStartLine = row[0].start.line;

    const prevStartColumnString = prevStartColumn === row[0].start.column ? '' : String(row[0].start.column);
    prevStartColumn = row[0].start.column;

    const prevEndLineString = prevEndLine === row[0].end.line ? '' : String(row[0].end.line);
    prevEndLine = row[0].end.line;

    const prevEndColumnString = prevEndColumn === row[0].end.column ? '' : String(row[0].end.column);
    prevEndColumn = row[0].end.column;

    const hint = row[1] ?? 0;
    const prevHintString = prevHint === hint ? '' : String(hint);
    prevHint = hint;

    let result = '';
    if (prevStartLineString) {
      result += prevStartLineString;
    }

    result += ":";
    if (prevStartColumnString) {
      result += prevStartColumnString;
    }

    result += ":";
    if (prevEndLineString) {
      result += prevEndLineString;
    }

    result += ":";
    if (prevEndColumnString) {
      result += prevEndColumnString;
    }

    result += ":";
    if (prevHintString) {
      result += prevHintString;
    }

    result = result.replace(/:*$/, '');
    return result;
  }).join(';');
}

export const sourceMapToLocationData = (sourceMap: string): LocationData => {
  let prevStartLine = 0;
  let prevStartColumn = 0;
  let prevEndLine = 0;
  let prevEndColumn = 0;
  let prevHint: any = undefined;

  return sourceMap.split(";").map((entry: string) => {
    const val = entry.split(':');
    const startLine = val[0] ? Number(val[0]) : prevStartLine; prevStartLine = startLine;
    const startColumn = val[1] ? Number(val[1]) : prevStartColumn; prevStartColumn = startColumn;
    const endLine = val[2] ? Number(val[2]) : prevEndLine; prevEndLine = endLine;
    const endColumn = val[3] ? Number(val[3]) : prevEndColumn; prevEndColumn = endColumn;
    const hint: number | undefined = val[4] ? Number(val[4]) : prevHint; prevHint = hint;

    return [
      {
        start: { line: startLine, column: startColumn },
        end: { line: endLine, column: endColumn }
      },
      ...(hint ? [hint] : [])
    ] as any;
  });
}