/*   IR.test.ts
 *
 * - This file is used to test the IR
 */

import { assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import { Node, Ast } from '../../src/ast/AST';
import TypeCheckTraversal from '../../src/semantic/TypeCheckTraversal';
import { parseCode } from '../../src/sdk';
import GenerateIrTraversal from '../../src/ir/GenerateIrTraversal';
import { GlobalFunction } from '../../src/ast/Globals';
import { BinaryOperator } from '../../src/ast/Operator';
import {
  Call,
  Get,
  Op,
  PushInt,
  PushString,
} from '../../src/ir/IR';

interface TestSetup {
  ast: Node,
  traversal: GenerateIrTraversal,
}

function setup(input: string): TestSetup {
  let ast = parseCode(input);
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  const traversal = new GenerateIrTraversal();

  return { ast, traversal };
}

describe('IR', () => {
  it('should compile P2PKH contract', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'p2pkh.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr = [
      new Get(1), new Call(GlobalFunction.SHA256),
      new Get(1), new Call(BinaryOperator.EQ),
      new Call(GlobalFunction.REQUIRE),
      new Get(2), new Get(2), new Call(GlobalFunction.CHECKSIG),
      new Call(GlobalFunction.REQUIRE),
    ];
    assert.deepEqual(traversal.output, expectedIr);
    assert.deepEqual(traversal.stack, ['pkh', 'pk', 's']);
  });

  it('should compile simple_variables contract (includes reassignment)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'simple_variables.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: Op[] = [
      new PushInt(10), new PushInt(4), new Call(BinaryOperator.MINUS),
      new PushInt(20), new Get(1), new PushInt(2),
      new Call(BinaryOperator.MOD), new Call(BinaryOperator.PLUS),
      new Get(0), new Get(3), new Call(BinaryOperator.GT), new Call(GlobalFunction.REQUIRE),
      new PushString('Hello World'),
      new Get(0), new Get(5), new Call(BinaryOperator.PLUS),
      new Get(6), new Call(GlobalFunction.RIPEMD160),
      new Get(1), new Call(GlobalFunction.RIPEMD160),
      new Call(BinaryOperator.EQ), new Call(GlobalFunction.REQUIRE),
      new Get(7), new Get(7), new Call(GlobalFunction.CHECKSIG),
      new Call(GlobalFunction.REQUIRE),
    ];
    assert.deepEqual(traversal.output, expectedIr);
    assert.deepEqual(traversal.stack, ['hw', 'hw', 'myOtherVariable', 'myVariable', 'x', 'y', 'pk', 's']);
  });
});
