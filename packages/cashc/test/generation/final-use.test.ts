/*   final-use.test.ts
 *
 * - The symbol table records the final use of every variable, and code generation rolls the variable off the stack
 *   (rather than picking it) at that read. This only works if both traversals visit the children of every node in
 *   the same order, so this file checks that no variable is read again after it was rolled.
 * - The checks run on every valid contract file, and on a contract that reads the same variable in every child of
 *   each expression node type.
 */

import { URL } from 'url';
import { FunctionDefinitionNode, IdentifierNode } from '../../src/ast/AST.js';
import GenerateTargetTraversal from '../../src/generation/GenerateTargetTraversal.js';
import { compileFile, compileString } from '../../src/index.js';
import { readCashFiles } from '../test-utils.js';

const EVERY_EXPRESSION_SOURCE = `
function add(int a, int b) returns (int) {
  return a + b;
}

function sliceInFunction(bytes b, int v) returns (bytes) {
  return b.slice(v, v + 1);
}

contract EveryExpression() {
  function slice(bytes b, int v) {
    require(b.slice(v, v + 1) == 0x11);
  }

  function sliceAfterReassignment(bytes b, int v) {
    v = v + 1;
    require(b.slice(v, v + 1) == 0x11);
  }

  function binaryOp(int v) {
    require(v - (v + 1) == -1);
  }

  function split(bytes b, int v) {
    require(b.split(v)[0].split(v)[1] == 0x);
  }

  function builtinFunctionCall(int v) {
    require(within(v, v - 1, v + 1));
  }

  function userFunctionCall(bytes b, int v) {
    require(add(v, v + 1) == 3);
    require(sliceInFunction(b, v) == 0x11);
  }

  function multiSig(sig s, pubkey pk) {
    require(checkMultiSig([s, s], [pk, pk]));
  }

  function instantiation(bytes b, bytes20 pkh) {
    require(new LockingBytecodeNullData([b, pkh, b + pkh]) == new LockingBytecodeP2PKH(pkh) + b);
  }

  function tupleAssignment(bytes b, int v) {
    bytes x, bytes y = b.split(v + v);
    (x, y) = y.split(v);
    require(x + y == b);
  }
}
`;

describe('Final use of variables', () => {
  it('should not read a variable after its final use in a contract that reads it in every child of each expression', () => {
    expectNoReadsAfterFinalUse(() => compileString(EVERY_EXPRESSION_SOURCE, { warningListener: () => {} }));
  });

  readCashFiles(new URL('../valid-contract-files', import.meta.url)).forEach(({ fn }) => {
    it(`should not read a variable after its final use in ${fn}`, () => {
      const sourceFile = new URL(`../valid-contract-files/${fn}`, import.meta.url);
      expectNoReadsAfterFinalUse(() => compileFile(sourceFile, { warningListener: () => {} }));
    });
  });
});

interface VariableRead {
  node: IdentifierNode;
  isFinalUse: boolean;
}

function expectNoReadsAfterFinalUse(compile: () => void): void {
  const readsPerFunction = new Map<FunctionDefinitionNode, VariableRead[]>();

  // Code generation checks isOpRoll() for every variable read, so we use it to record the reads in order
  const { isOpRoll } = GenerateTargetTraversal.prototype;
  const spy = vi.spyOn(GenerateTargetTraversal.prototype, 'isOpRoll').mockImplementation(
    function (this: GenerateTargetTraversal, node: IdentifierNode) {
      const isFinalUse = isOpRoll.call(this, node);
      const { currentFunction } = this as unknown as { currentFunction: FunctionDefinitionNode };
      readsPerFunction.set(currentFunction, [...readsPerFunction.get(currentFunction) ?? [], { node, isFinalUse }]);
      return isFinalUse;
    },
  );

  try {
    compile();
  } finally {
    spy.mockRestore();
  }

  readsPerFunction.forEach((reads, func) => {
    reads.forEach(({ node, isFinalUse }, index) => {
      if (!isFinalUse) return;
      const laterReads = reads.slice(index + 1).filter((read) => read.node.name === node.name);
      expect(laterReads, `'${node.name}' is read after its final use in ${func.name}`).toEqual([]);
    });
  });
}
