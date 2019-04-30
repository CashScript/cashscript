import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { CommonTokenStream, ParserRuleContext } from 'antlr4ts';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import * as fs from 'fs';
import * as path from 'path';
import { CashScriptParser } from '../src/grammar/CashScriptParser';
import { CashScriptLexer } from '../src/grammar/CashScriptLexer';

export function readCashFiles(directory: string): {fn: string, contents: string}[] {
  return fs.readdirSync(directory)
    .filter(fn => fn.endsWith('.cash'))
    .map(fn => ({ fn, contents: fs.readFileSync(path.join(directory, fn), { encoding: 'utf-8' }) }));
}

export function prettyPrintTokenStream(lexer: CashScriptLexer, tokenStream: CommonTokenStream) {
  const tokens = tokenStream.getTokens().map((t) => {
    const tokenName = lexer.vocabulary.getSymbolicName(t.type);
    const tokenRepresentation = tokenName ? `${tokenName}<${t.text}>` : t.text;
    return tokenRepresentation;
  });
  console.log(`Token stream:\n${tokens.join('  ')}`);
}

export function prettyPrintParseTree(lexer: CashScriptLexer, tokenStream: CommonTokenStream) {
  const parser = new CashScriptParser(tokenStream);
  const rootContext = parser.sourceFile();
  console.log('Parse Tree:');
  prettyPrintParseTreeElement(lexer, rootContext, '');
}

function prettyPrintParseTreeElement(lexer: CashScriptLexer, el: ParseTree, indent: string) {
  if (el instanceof ParserRuleContext) {
    console.log(indent + el.constructor.name.replace('Context', ''));
    el.children && el.children.forEach((c) => {
      prettyPrintParseTreeElement(lexer, c, `${indent}  `);
    });
  } else if (el instanceof TerminalNode) {
    const symbolicName = lexer.vocabulary.getSymbolicName(el.symbol.type);
    if (symbolicName) {
      console.log(`${indent}${symbolicName}<${el}>`);
    }
  }
}
