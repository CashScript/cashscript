import type { ParserRuleContext } from 'antlr4ts/ParserRuleContext.js';
import type { Token } from 'antlr4ts';

export class Location {
  constructor(public start: Point, public end: Point) {}

  static fromCtx(ctx: ParserRuleContext): Location | undefined {
    const stop = ctx.stop?.text ? ctx.stop : ctx.start;
    const textLength = (stop.text ?? '').length;

    const start = new Point(ctx.start.line, ctx.start.charPositionInLine);
    const end = new Point(stop.line, stop.charPositionInLine + textLength);

    return new Location(start, end);
  }

  static fromToken(token: Token): Location | undefined {
    const textLength = (token.text ?? '').length;

    const start = new Point(token.line, token.charPositionInLine);
    const end = new Point(token.line, token.charPositionInLine + textLength);

    return new Location(start, end);
  }

  text(code: string): string {
    return code.slice(this.start.offset(code), this.end.offset(code));
  }
}

export class Point {
  constructor(public line: number, public column: number) {}

  offset(code: string): number {
    const lines = code.split('\n');
    const newLines = this.line - 1;
    const lineOffset = lines.slice(0, newLines).reduce((acc, curr) => acc + curr.length, 0);
    return lineOffset + newLines + this.column;
  }

  toString(): string {
    return `Line ${this.line}, Column ${this.column}`;
  }
}
