import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
export class Location {
    constructor(public start: Point, public end: Point) {}

    static fromCtx(ctx: ParserRuleContext) {
        if (!ctx.stop || !ctx.stop.text)
            return undefined;
        const start = new Point(ctx.start.line, ctx.start.charPositionInLine);
        const end = new Point(ctx.stop.line, ctx.stop.charPositionInLine + ctx.stop.text.length);

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
        return lines.slice(0, this.line - 1).reduce((acc, curr) => acc + curr.length, 0) + newLines + this.column;
    }

    toString() {
        (`Line ${this.line}, Column ${this.column}`);
    }
}
