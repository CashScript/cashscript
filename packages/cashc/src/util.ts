import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import fs from 'fs';
import { Ast } from './ast/AST';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import { CashScriptParser } from './grammar/CashScriptParser';
import AstBuilder from './ast/AstBuilder';
import { generateArtifact, Artifact } from './artifact/Artifact';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal';
import TypeCheckTraversal from './semantic/TypeCheckTraversal';
import SymbolTableTraversal from './semantic/SymbolTableTraversal';
import { Script, Op } from './generation/Script';
import TargetCodeOptimisation from './optimisations/TargetCodeOptimisation';
import ReplaceBytecodeNop from './generation/ReplaceBytecodeNop';
import VerifyCovenantTraversal from './semantic/VerifyCovenantTraversal';

const bch = require('trout-bch');

export const Data = {
  encodeBool(b: boolean): Buffer {
    return b ? this.encodeInt(1) : this.encodeInt(0);
  },
  decodeBool(b: Buffer): boolean {
    // Any encoding of 0 is false, else true
    for (let i = 0; i < b.byteLength; i += 1) {
      if (b[i] !== 0) {
        // Can be negative zero
        if (i === b.byteLength - 1 && b[i] === 0x80) return false;
        return true;
      }
    }
    return false;
  },
  encodeInt(i: number): Buffer {
    return bch.script.number.encode(i);
  },
  decodeInt(i: Buffer, maxLength?: number): number {
    return bch.script.number.decode(i, maxLength);
  },
  encodeString(s: string): Buffer {
    return Buffer.from(s, 'ascii');
  },
  decodeString(s: Buffer): string {
    return s.toString('ascii');
  },
  scriptToAsm(s: Script): string {
    return bch.script.toASM(bch.script.compile(s));
  },
  scriptToHex(s: Script): string {
    return bch.script.compile(s).toString('hex');
  },
  asmToScript(s: string): Script {
    return bch.script.decompile(bch.script.fromASM(s));
  },
};
export type Data = typeof Data;

export const Artifacts = {
  require(artifactFile: string): Artifact {
    return JSON.parse(fs.readFileSync(artifactFile, { encoding: 'utf-8' }));
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
    ast = ast.accept(new VerifyCovenantTraversal()) as Ast;
    const traversal = new GenerateTargetTraversal();
    ast.accept(traversal);
    let bytecode = traversal.output;
    bytecode = TargetCodeOptimisation.optimise(bytecode);
    bytecode = ReplaceBytecodeNop.replace(bytecode);

    return generateArtifact(ast, bytecode, code);
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

export function countOpcodes(script: Script): number {
  return script
    .filter(opOrData => typeof opOrData === 'number')
    .filter(op => op > Op.OP_16)
    .length;
}

export function calculateBytesize(script: Script): number {
  return bch.script.compile(script).byteLength;
}
