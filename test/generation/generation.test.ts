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
import { parseCode } from '../../src/sdk';
import GenerateIrTraversal from '../../src/generation/GenerateIrTraversal';
import fixtures from './fixture/fixtures';

describe('Code generation', () => {
  describe('IR', () => {
    fixtures.forEach((fixture) => {
      it(`should compile ${fixture.fn} to IR`, () => {
        const code = fs.readFileSync(path.join(__dirname, 'fixture', fixture.fn), { encoding: 'utf-8' });
        let ast = parseCode(code);
        ast = ast.accept(new SymbolTableTraversal()) as Ast;
        ast = ast.accept(new TypeCheckTraversal()) as Ast;
        const genIr = new GenerateIrTraversal();
        ast.accept(genIr);
        // const target = new GenerateTargetTraversal(genIr.output).traverse();

        assert.deepEqual(
          genIr.output.map(o => o.toString()),
          fixture.ir.map(o => o.toString()),
        );
        assert.deepEqual(genIr.stack, fixture.stack);
      });
    });
  });
});
