/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import { assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import SymbolTableTraversal from '../../src/compiler/semantic/SymbolTableTraversal';
import { Ast } from '../../src/compiler/ast/AST';
import TypeCheckTraversal from '../../src/compiler/semantic/TypeCheckTraversal';
import { parseCode } from '../../src/util';
import GenerateIrTraversal from '../../src/compiler/generation/GenerateIrTraversal';
import { irFixtures, targetFixtures } from './fixture/fixtures';
import GenerateTargetTraversal from '../../src/compiler/generation/GenerateTargetTraversal';
import { ScriptUtil } from '../../src/sdk/BITBOX';

describe('Code generation', () => {
  describe('IR', () => {
    irFixtures.forEach((fixture) => {
      it(`should compile ${fixture.fn} to IR`, () => {
        const code = fs.readFileSync(path.join(__dirname, 'fixture', fixture.fn), { encoding: 'utf-8' });
        let ast = parseCode(code);
        ast = ast.accept(new SymbolTableTraversal()) as Ast;
        ast = ast.accept(new TypeCheckTraversal()) as Ast;

        const genIr = new GenerateIrTraversal();
        ast.accept(genIr);

        assert.deepEqual(
          genIr.output.map(o => o.toString()),
          fixture.ir.map(o => o.toString()),
        );
        assert.deepEqual(genIr.stack, ['true']);
      });
    });
  });

  describe('Bitcoin Script generation', () => {
    [...irFixtures, ...targetFixtures].forEach((fixture) => {
      it(`should compile ${fixture.fn} to Bitcoin Script`, () => {
        const target = new GenerateTargetTraversal(fixture.ir).traverse();

        assert.equal(
          ScriptUtil.toASM(ScriptUtil.encode(target)),
          fixture.script,
        );
      });
    });
  });
});
