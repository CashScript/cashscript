import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import * as util from 'util';
import { Ast, SourceFileNode } from './compiler/ast/AST';
import { CashScriptLexer } from './compiler/grammar/CashScriptLexer';
import { CashScriptParser } from './compiler/grammar/CashScriptParser';
import AstBuilder from './compiler/ast/AstBuilder';
import OutputSourceCodeTraversal from './compiler/print/OutputSourceCodeTraversal';
import SymbolTableTraversal from './compiler/semantic/SymbolTableTraversal';
import TypeCheckTraversal from './compiler/semantic/TypeCheckTraversal';
import GenerateTargetTraversal from './compiler/generation/GenerateTargetTraversal';
import { Script } from './compiler/generation/Script';
import { ScriptUtil, CryptoUtil } from './sdk/BITBOX';
import { Utxo } from './sdk/interfaces';

export function parseCode(code: string): Ast {
  const inputStream: ANTLRInputStream = new ANTLRInputStream(code);
  const lexer: CashScriptLexer = new CashScriptLexer(inputStream);
  const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
  const parser: CashScriptParser = new CashScriptParser(tokenStream);
  const ast: SourceFileNode = new AstBuilder(parser.sourceFile()).build() as Ast;
  return ast;
}

export function printAstAsCode(ast: Ast): void {
  const traversal: OutputSourceCodeTraversal = new OutputSourceCodeTraversal();
  ast.accept(traversal);
  console.log(traversal.output);
}

export function printAst(ast: Ast): void {
  console.log(util.inspect(ast, false, null, true));
}

export function encodeBool(b: boolean): Buffer {
  return b ? encodeInt(1) : encodeInt(0);
}

export function encodeInt(i: number): Buffer {
  return ScriptUtil.encodeNumber(i);
}

export function encodeString(s: string): Buffer {
  return Buffer.from(s, 'ascii');
}

export function compileToTargetCode(code: string): Script {
  const ast: SourceFileNode = parseCode(code);
  ast.accept(new SymbolTableTraversal());
  ast.accept(new TypeCheckTraversal());
  const traversal: GenerateTargetTraversal = new GenerateTargetTraversal();
  ast.accept(traversal);
  return traversal.output;
}

export function printTargetCode(target: Script) {
  console.log(ScriptUtil.toASM(ScriptUtil.encode(target)));
}

export function meep(tx: any, utxos: Utxo[], script: Script) {
  const scriptPubkey: string = ScriptUtil.encodeP2SHOutput(
    CryptoUtil.hash160(
      ScriptUtil.encode(script),
    ),
  ).toString('hex');
  console.log(`meep debug --tx=${tx.toHex()} --idx=0 --amt=${utxos[0].satoshis} --pkscript=${scriptPubkey}`);
}
