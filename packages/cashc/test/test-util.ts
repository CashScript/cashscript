import { hexToBin } from '@bitauth/libauth';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { CommonTokenStream, ParserRuleContext } from 'antlr4ts';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import fs from 'fs';
import path from 'path';
import { CashScriptParser } from '../src/grammar/CashScriptParser';
import { CashScriptLexer } from '../src/grammar/CashScriptLexer';
import {
  LiteralNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
} from '../src/ast/AST';

export function literalToNode(literal: boolean | number | string): LiteralNode {
  if (typeof literal === 'boolean') {
    return new BoolLiteralNode(literal);
  } else if (typeof literal === 'number') {
    return new IntLiteralNode(literal);
  } else if (literal.startsWith('0x')) {
    return new HexLiteralNode(hexToBin(literal.slice(2)));
  } else {
    return new StringLiteralNode(literal, '"');
  }
}

export function getSubdirectories(directory: string): string[] {
  return fs.readdirSync(directory)
    .filter(fn => fs.statSync(path.join(directory, fn)).isDirectory());
}

export function readCashFiles(directory: string): {fn: string, contents: string}[] {
  return fs.readdirSync(directory)
    .filter(fn => fn.endsWith('.cash'))
    .map(fn => ({ fn, contents: fs.readFileSync(path.join(directory, fn), { encoding: 'utf-8' }) }));
}

export function prettyPrintTokenStream(
  lexer: CashScriptLexer,
  tokenStream: CommonTokenStream,
): void {
  const tokens = tokenStream.getTokens().map((t) => {
    const tokenName = lexer.vocabulary.getSymbolicName(t.type);
    const tokenRepresentation = tokenName ? `${tokenName}<${t.text}>` : t.text;
    return tokenRepresentation;
  });
  console.log(`Token stream:\n${tokens.join('  ')}`);
}

export function prettyPrintParseTree(
  lexer: CashScriptLexer,
  tokenStream: CommonTokenStream,
): void {
  const parser = new CashScriptParser(tokenStream);
  const rootContext = parser.sourceFile();
  console.log('Parse Tree:');
  prettyPrintParseTreeElement(lexer, rootContext, '');
}

function prettyPrintParseTreeElement(
  lexer: CashScriptLexer,
  el: ParseTree,
  indent: string,
): void {
  if (el instanceof ParserRuleContext) {
    console.log(indent + el.constructor.name.replace('Context', ''));
    el.children?.forEach((c) => {
      prettyPrintParseTreeElement(lexer, c, `${indent}  `);
    });
  } else if (el instanceof TerminalNode) {
    const symbolicName = lexer.vocabulary.getSymbolicName(el.symbol.type);
    if (symbolicName) {
      console.log(`${indent}${symbolicName}<${el}>`);
    }
  }
}
