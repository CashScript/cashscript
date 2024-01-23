import type { ParserRuleContext, Token } from 'antlr4';
import { LocationI } from '@cashscript/utils';

export class Location implements LocationI {
  constructor(public start: Point, public end: Point) {}

  static fromCtx(ctx: ParserRuleContext): Location {
    const stop = ctx.stop?.text ? ctx.stop : ctx.start;
    const textLength = (stop.text ?? '').length;

    const start = new Point(ctx.start.line, ctx.start.column);
    const end = new Point(stop.line, stop.column + textLength);

    return new Location(start, end);
  }

  static fromToken(token: Token): Location {
    const textLength = (token.text ?? '').length;

    const start = new Point(token.line, token.column);
    const end = new Point(token.line, token.column + textLength);

    return new Location(start, end);
  }

  static fromObject(object: LocationI): Location {
    const start = new Point(object.start.line, object.start.column);
    const end = new Point(object.end.line, object.end.column);

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
