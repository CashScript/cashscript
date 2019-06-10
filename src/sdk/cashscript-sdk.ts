import * as fs from 'fs';
import { parseCode } from '../util';
import SymbolTableTraversal from '../compiler/semantic/SymbolTableTraversal';
import TypeCheckTraversal from '../compiler/semantic/TypeCheckTraversal';
import GenerateTargetTraversal from '../compiler/generation/GenerateTargetTraversal';
import { generateArtifact, Artifact } from './Artifact';
import { Ast } from '../compiler/ast/AST';

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

export function exportArtifact(artifact: Artifact, targetFile: string): void {
  const jsonString = JSON.stringify(artifact, null, 2);
  fs.writeFileSync(targetFile, jsonString);
}

export function importArtifact(artifactFile: string): Artifact {
  const artifactString = fs.readFileSync(artifactFile, { encoding: 'utf-8' });
  return JSON.parse(artifactString, scriptReviver);
}

function scriptReviver(key: any, val: any) {
  if (val && typeof val === 'object' && val.type === 'Buffer') {
    return Buffer.from(val.data);
  }
  return val;
}

export * from './Contract';
