import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { Script as BScript } from 'bitbox-sdk';
import * as fs from 'fs';
import { Ast } from './ast/AST';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import { CashScriptParser } from './grammar/CashScriptParser';
import AstBuilder from './ast/AstBuilder';
import { generateArtifact, Artifact } from './artifact/Artifact';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal';
import TypeCheckTraversal from './semantic/TypeCheckTraversal';
import SymbolTableTraversal from './semantic/SymbolTableTraversal';
import { Script } from './generation/Script';
import TargetCodeOptimisation from './optimisations/TargetCodeOptimisation';

export const Data = {
  encodeBool(b: boolean): Buffer {
    return b ? this.encodeInt(1) : this.encodeInt(0);
  },
  encodeInt(i: number): Buffer {
    return new BScript().encodeNumber(i);
  },
  encodeString(s: string): Buffer {
    return Buffer.from(s, 'ascii');
  },
  scriptToAsm(s: Script): string {
    return new BScript().toASM(new BScript().encode(s));
  },
  asmToScript(s: string): Script {
    return new BScript().decode(new BScript().fromASM(s));
  },
};
export type Data = typeof Data;

export const Artifacts = {
  require(artifactFile: string): Artifact {
    const artifactString = fs.readFileSync(artifactFile, { encoding: 'utf-8' });
    return JSON.parse(artifactString);
  },
  export(artifact: Artifact, targetFile: string): void {
    const jsonString = JSON.stringify(artifact, null, 2);
    fs.writeFileSync(targetFile, jsonString);
  },
};
export type Artifacts = typeof Artifacts;

export const CashCompiler = {
  compileString(code: string): Artifact {
    let ast = parseCode(code);
    ast = ast.accept(new SymbolTableTraversal()) as Ast;
    ast = ast.accept(new TypeCheckTraversal()) as Ast;
    const traversal = new GenerateTargetTraversal();
    ast.accept(traversal);
    const targetCode = traversal.output;
    const optimisedCode = TargetCodeOptimisation.optimise(targetCode);

    return generateArtifact(ast, optimisedCode, code);
  },
  compileFile(codeFile: string): Artifact {
    const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
    return CashCompiler.compileString(code);
  },
};
export type CashCompiler = typeof CashCompiler;

export function parseCode(code: string): Ast {
  const inputStream: ANTLRInputStream = new ANTLRInputStream(code);
  const lexer: CashScriptLexer = new CashScriptLexer(inputStream);
  const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
  const parser: CashScriptParser = new CashScriptParser(tokenStream);
  const ast: Ast = new AstBuilder(parser.sourceFile()).build() as Ast;
  return ast;
}
