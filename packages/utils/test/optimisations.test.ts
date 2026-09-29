import {
  bigIntToVmNumber,
  binToHex,
  createTestAuthenticationProgramBch,
  createVirtualMachineBch2026,
  encodeDataPush,
  flattenBinArray,
} from '@bitauth/libauth';
import {
  asmToBytecode,
  asmToScript,
  optimiseBytecode,
  OptimiseBytecodeResult,
  PositionHint,
  range,
  RequireStatement,
  scriptToAsm,
  SingleLocationData,
  SourceTagEntry,
  SourceTagKind,
} from '../src/index.js';

describe('optimiseBytecode()', () => {
  describe('optimisations for any stack depth or expression', () => {
    const fixtures = [
      { name: 'updates the top item in place', asm: 'OP_DUP OP_2 OP_ADD OP_NIP', expected: 'OP_2 OP_ADD' },
      { name: 'updates a deeper item in place', asm: 'OP_OVER OP_1ADD OP_ROT OP_DROP', expected: 'OP_SWAP OP_1ADD' },
      {
        name: 'updates an item deeper than OP_16 in place',
        asm: '11 OP_PICK OP_1SUB 12 OP_ROLL OP_DROP',
        expected: '11 OP_ROLL OP_1SUB',
      },
      {
        name: 'updates an item in place with a multi-opcode expression',
        asm: 'OP_3 OP_PICK OP_SHA256 OP_SIZE OP_NIP OP_4 OP_ROLL OP_DROP',
        expected: 'OP_3 OP_ROLL OP_SHA256 OP_SIZE OP_NIP',
      },
      {
        name: 'keeps copies of items above the updated item as they are',
        asm: 'OP_3 OP_PICK OP_2 OP_PICK OP_ADD OP_4 OP_ROLL OP_DROP',
        expected: 'OP_3 OP_ROLL OP_2 OP_PICK OP_ADD',
      },
      {
        name: 'rewrites copies of items below the updated item',
        asm: 'OP_3 OP_PICK OP_6 OP_PICK OP_ADD OP_4 OP_ROLL OP_DROP',
        expected: 'OP_3 OP_ROLL OP_5 OP_PICK OP_ADD',
      },
      {
        name: 'does not update an item in place when the expression copies the original item',
        asm: 'OP_3 OP_PICK OP_4 OP_PICK OP_MUL OP_4 OP_ROLL OP_DROP',
        expected: 'OP_3 OP_PICK OP_4 OP_PICK OP_MUL OP_4 OP_ROLL OP_DROP',
      },
      {
        name: 'does not update an item in place when the expression reads more than its own items',
        asm: 'OP_3 OP_PICK OP_DEPTH OP_ADD OP_4 OP_ROLL OP_DROP',
        expected: 'OP_3 OP_PICK OP_DEPTH OP_ADD OP_4 OP_ROLL OP_DROP',
      },
      { name: 'moves an OP_NIP after a data push', asm: 'abcd OP_NIP', expected: 'OP_DROP abcd' },
      { name: 'moves an OP_NIP after a number push', asm: 'OP_CAT OP_1NEGATE OP_NIP', expected: 'OP_2DROP OP_1NEGATE' },
    ];

    fixtures.forEach(({ name, asm, expected }) => {
      it(`${name} (${asm})`, () => {
        const optimised = scriptToAsm(optimiseAsm(asm).script);
        expect(optimised).toEqual(expected);
        expect(evaluate(optimised)).toEqual(evaluate(asm));
      });
    });
  });

  describe('debug information of an in-place update', () => {
    // x -= 3; require(x == 12); followed by the cleanup of the original x
    const asm = 'OP_DUP OP_3 OP_SUB OP_12 OP_NUMEQUAL OP_NIP';
    const optimise = (sourceTags: SourceTagEntry[] = []): OptimiseBytecodeResult => (
      optimiseAsm(asm, [{ ip: 5, line: 1 }], sourceTags)
    );

    it('keeps the source locations of the opcodes it keeps', () => {
      const result = optimise();
      expect(scriptToAsm(result.script)).toEqual('OP_3 OP_SUB OP_12 OP_NUMEQUAL');
      expect(result.locationData).toEqual(locations(asm).slice(1, 5));
    });

    it('keeps a final require directly after its condition', () => {
      expect(optimise().requires).toEqual([{ ip: 4, line: 1 }]);
    });

    it('ends a source tag at the last opcode it keeps', () => {
      const tag = { startIndex: 3, endIndex: 5, kind: SourceTagKind.LOOP_CONDITION };
      expect(optimise([tag]).sourceTags).toEqual([{ ...tag, startIndex: 2, endIndex: 3 }]);
    });

    it('removes a source tag whose opcodes were all removed', () => {
      const tag = { startIndex: 5, endIndex: 5, kind: SourceTagKind.LOOP_CONDITION };
      expect(optimise([tag]).sourceTags).toEqual([]);
    });
  });
});

// Give every opcode its own source location, so that merged locations are distinguishable
function locations(asm: string): SingleLocationData[] {
  return asmToScript(asm).map((_, index) => ({
    location: { start: { line: 1, column: index }, end: { line: 1, column: index + 1 } },
    positionHint: PositionHint.START,
  }));
}

function optimiseAsm(
  asm: string,
  requires: RequireStatement[] = [],
  sourceTags: SourceTagEntry[] = [],
): OptimiseBytecodeResult {
  return optimiseBytecode(asmToScript(asm), locations(asm), [], requires, sourceTags, [], 0);
}

const vm = createVirtualMachineBch2026(false);

// Evaluate the script on a stack of distinct numbers, so reading the wrong stack item changes the result
function evaluate(asm: string): object {
  const unlockingBytecode = flattenBinArray(range(1, 20).map((n) => encodeDataPush(bigIntToVmNumber(BigInt(n)))));
  const program = createTestAuthenticationProgramBch({
    lockingBytecode: asmToBytecode(asm), unlockingBytecode, valueSatoshis: 0n,
  });
  const { stack, alternateStack, error } = vm.evaluate(program);
  return { stack: stack.map(binToHex), alternateStack: alternateStack.map(binToHex), error };
}
