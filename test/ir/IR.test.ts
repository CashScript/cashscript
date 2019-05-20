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
import {
  Get,
  PushInt,
  PushString,
  Replace,
  PushBytes,
  PushBool,
  IrOp,
} from '../../src/generation/IR';
import GenerateIrTraversal from '../../src/generation/GenerateIrTraversal';
import { Op } from '../../src/generation/Script';

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
      new Get(1), Op.SHA256, new Get(1), Op.EQUAL, Op.VERIFY,
      new Get(2), new Get(2), Op.CHECKSIG, Op.VERIFY,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['pkh', 'pk', 's']);
  });

  it('should compile simple_variables contract (includes reassignment)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'simple_variables.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new PushInt(10), new PushInt(4), Op.SUB,
      new PushInt(20), new Get(1), new PushInt(2), Op.MOD, Op.ADD,
      new Get(0), new Get(3), Op.GREATERTHAN, Op.VERIFY,
      new PushString('Hello World'),
      new Get(0), new Get(5), Op.CAT,
      new Get(6), Op.RIPEMD160, new Get(1), Op.RIPEMD160, Op.EQUAL, Op.VERIFY,
      new Get(7), new Get(7), Op.CHECKSIG, Op.VERIFY,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['hw', 'hw', 'myOtherVariable', 'myVariable', 'x', 'y', 'pk', 's']);
  });

  it('should compile if_statements contract (includes scoped variables / reassignment)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'if_statement.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new Get(2), new Get(4), Op.ADD,
      new Get(0), new Get(4), Op.SUB,
      new Get(0), new Get(3), new PushInt(2), Op.SUB, Op.NUMEQUAL, Op.IF,
      new Get(0), new Get(6), Op.ADD,
      new Get(5), new Get(1), Op.ADD, new Replace(2),
      new Get(0), new Get(2), Op.GREATERTHAN, Op.VERIFY,
      Op.DROP, Op.ELSE,
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
      Op.ENDIF,
      new Get(0), new Get(5), Op.ADD,
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['d', 'd', 'd', 'x', 'y', 'a', 'b']);
  });

  it('should compile transfer_with_timeout (multi-function contract)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'transfer_with_timeout.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new Get(3), new PushInt(0), Op.NUMEQUAL, Op.IF,
      new Get(4), new Get(2), Op.CHECKSIG, Op.VERIFY,
      Op.ELSE, new Get(3), new PushInt(1), Op.NUMEQUAL, Op.IF,
      new Get(4), new Get(1), Op.CHECKSIG, Op.VERIFY,
      new Get(2), Op.CHECKLOCKTIMEVERIFY, Op.DROP,
      Op.ENDIF, Op.ENDIF,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['sender', 'recipient', 'timeout', '$$', 'senderSig']);
  });

  it('should compile multifunction_if_statements.cash (multi-function, scoping, reassignment)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'multifunction_if_statements.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new Get(2), new PushInt(0), Op.NUMEQUAL, Op.IF,
      new Get(3), new Get(5), Op.ADD,
      new Get(0), new Get(5), Op.SUB,
      new Get(0), new Get(3), Op.NUMEQUAL, Op.IF,
      new Get(0), new Get(7), Op.ADD,
      new Get(6), new Get(1), Op.ADD, new Replace(2),
      new Get(0), new Get(2), Op.GREATERTHAN, Op.VERIFY,
      Op.DROP, Op.ELSE,
      new Get(5), new Replace(1),
      Op.ENDIF,
      new Get(0), new Get(6), Op.ADD,
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
      Op.ELSE, new Get(2), new PushInt(1), Op.NUMEQUAL, Op.IF,
      new Get(3),
      new Get(0), new PushInt(2), Op.ADD,
      new Get(0), new Get(3), Op.NUMEQUAL, Op.IF,
      new Get(0), new Get(6), Op.ADD,
      new Get(0), new Get(2), Op.ADD, new Replace(2),
      new Get(0), new Get(2), Op.GREATERTHAN, Op.VERIFY,
      Op.DROP, Op.ENDIF,
      new Get(5),
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
      Op.ENDIF, Op.ENDIF,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['d', 'd', 'd', 'x', 'y', '$$', 'b']);
  });

  it('should compile 2_of_3_multisig.cash (multisig / array)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', '2_of_3_multisig.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new Get(3), new Get(5), new PushInt(2),
      new Get(3), new Get(5), new Get(7), new PushInt(3),
      Op.CHECKMULTISIG, Op.VERIFY,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['pk1', 'pk2', 'pk3', 's1', 's2']);
  });

  it('should compile splice_size.cash (splice, tuple, size)', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'splice_size.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new Get(0), new Get(1), Op.SIZE, Op.NIP, new PushInt(2), Op.DIV, Op.SPLIT, Op.NIP,
      new Get(0), new Get(2), Op.EQUAL, Op.NOT, Op.VERIFY,
      new Get(1), new PushInt(4), Op.SPLIT, Op.DROP, new Get(1), Op.EQUAL, Op.NOT, Op.VERIFY,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['x', 'b']);
  });

  it('should compile simple_operations.cash', () => {
    const code = fs.readFileSync(path.join(__dirname, 'fixture', 'simple_operations.cash'), { encoding: 'utf-8' });
    const { ast, traversal } = setup(code);
    ast.accept(traversal);
    const expectedIr: IrOp[] = [
      new Get(0), Op.RIPEMD160,
      new PushBytes(Buffer.from('0', 'hex')), Op.RIPEMD160,
      Op.EQUAL, new PushBool(true), Op.NOT, Op.EQUAL, Op.VERIFY,
      new Get(1), new Get(1), Op.CHECKSIG, Op.VERIFY,
    ];
    assert.deepEqual(
      traversal.output.map(o => o.toString()),
      expectedIr.map(o => o.toString()),
    );
    assert.deepEqual(traversal.stack, ['pk', 's']);
  });
});
