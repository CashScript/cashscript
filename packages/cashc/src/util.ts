import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { Script } from 'bitbox-sdk';
import * as fs from 'fs';
import { Ast } from './ast/AST';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import { CashScriptParser } from './grammar/CashScriptParser';
import AstBuilder from './ast/AstBuilder';
import { generateArtifact, Artifact } from './artifact/Artifact';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal';
import TypeCheckTraversal from './semantic/TypeCheckTraversal';
import SymbolTableTraversal from './semantic/SymbolTableTraversal';

export class Data {
  static encodeBool(b: boolean): Buffer {
    return b ? this.encodeInt(1) : this.encodeInt(0);
  }

  static encodeInt(i: number): Buffer {
    return new Script().encodeNumber(i);
  }

  static encodeString(s: string): Buffer {
    return Buffer.from(s, 'ascii');
  }
}

export function parseCode(code: string): Ast {
  const inputStream: ANTLRInputStream = new ANTLRInputStream(code);
  const lexer: CashScriptLexer = new CashScriptLexer(inputStream);
  const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
  const parser: CashScriptParser = new CashScriptParser(tokenStream);
  const ast: Ast = new AstBuilder(parser.sourceFile()).build() as Ast;
  return ast;
}

export function compile(code: string): Artifact {
  let ast = parseCode(code);
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  const traversal = new GenerateTargetTraversal();
  ast.accept(traversal);
  const targetCode = traversal.output;

  return generateArtifact(ast, targetCode, code);
}

export function compileFile(codeFile: string): Artifact {
  const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
  return compile(code);
}

export function writeArtifact(artifact: Artifact, targetFile: string): void {
  const jsonString = JSON.stringify(artifact, null, 2);
  fs.writeFileSync(targetFile, jsonString);
}

export function readArtifact(artifactFile: string): Artifact {
  const artifactString = fs.readFileSync(artifactFile, { encoding: 'utf-8' });
  return JSON.parse(artifactString, scriptReviver);
}

function scriptReviver(key: any, val: any) {
  if (val && typeof val === 'object' && val.type === 'Buffer') {
    return Buffer.from(val.data);
  }
  return val;
}