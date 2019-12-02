/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import { assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import { Ast } from '../../src/ast/AST';
import TypeCheckTraversal from '../../src/semantic/TypeCheckTraversal';
import { parseCode } from '../../src/util';
import { fixtures } from './fixtures';
import GenerateTargetTraversal from '../../src/generation/GenerateTargetTraversal';
import { generateArtifact } from '../../src/artifact/Artifact';
import TargetCodeOptimisation from '../../src/optimisations/TargetCodeOptimisation';

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const code = fs.readFileSync(path.join(__dirname, '..', 'fixture', fixture.fn), { encoding: 'utf-8' });
      let ast = parseCode(code);
      ast = ast.accept(new SymbolTableTraversal()) as Ast;
      ast = ast.accept(new TypeCheckTraversal()) as Ast;

      const traversal = new GenerateTargetTraversal();
      ast.accept(traversal);
      const optimisedScript = TargetCodeOptimisation.optimise(traversal.output);
      const artifact = generateArtifact(ast, optimisedScript, code);

      // Disregard updatedAt
      fixture.artifact.updatedAt = artifact.updatedAt;
      assert.deepEqual(
        artifact,
        fixture.artifact,
      );

      assert.deepEqual(traversal.stack, ['(value)']);
    });
  });
});
