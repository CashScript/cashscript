import {
  AuthenticationInstruction,
  createVirtualMachineBch2026,
  decodeAuthenticationInstructions,
} from '@bitauth/libauth';
import { optimisationReplacements } from '../src/optimisations.js';
import { asmToBytecode } from '../src/script.js';

// These optimisations remove a check, so they are only equivalent when the original succeeds: the VM-number check of
// OP_NOT, and the maximum stack item size check of an unused OP_CAT result
const CHECK_REMOVING_OPTIMISATIONS = [
  'OP_NOT OP_IF',
  'OP_NOT OP_NOTIF',
  'OP_NOT OP_NOT OP_UNTIL',
  'OP_NOT OP_NOT OP_VERIFY',
  'OP_CAT OP_DROP',
];

const TRIALS_PER_OPTIMISATION = 100;
const STACK_DEPTH = 20;
const ALTERNATE_STACK_DEPTH = 3;

const vm = createVirtualMachineBch2026();
const initialState = vm.stateInitialize({
  inputIndex: 0,
  sourceOutputs: [{ lockingBytecode: Uint8Array.of(0x51), valueSatoshis: 10_000n }],
  transaction: {
    version: 2,
    locktime: 0,
    inputs: [{
      outpointIndex: 0,
      outpointTransactionHash: new Uint8Array(32),
      sequenceNumber: 0,
      // A large unlocking bytecode raises the operation cost budget so it never limits the fuzzed scripts
      unlockingBytecode: new Uint8Array(10_000),
    }],
    outputs: [{ lockingBytecode: Uint8Array.of(0x51), valueSatoshis: 1_000n }],
  },
});

describe('Optimisations', () => {
  optimisationReplacements.forEach(([pattern, replacement]) => {
    it(`${pattern} => ${replacement || '(nothing)'} should be equivalent in the VM`, () => {
      const random = createRandom(hashString(pattern));
      const patternInstructions = toInstructions(pattern);
      const replacementInstructions = toInstructions(replacement);
      const onlyCheckSuccesses = CHECK_REMOVING_OPTIMISATIONS.includes(pattern);

      for (let i = 0; i < TRIALS_PER_OPTIMISATION; i += 1) {
        const stack = createStack(random, STACK_DEPTH, i);
        const alternateStack = createStack(random, ALTERNATE_STACK_DEPTH, i);

        const expected = evaluate(patternInstructions, stack, alternateStack);
        if (onlyCheckSuccesses && expected.error) continue;

        const actual = evaluate(replacementInstructions, stack, alternateStack);

        // Comparing with toEqual() directly is too slow for the large stack items, so we only use it for the error message
        if (!isSameEvaluationResult(actual, expected)) {
          expect({ actual, trial: i }).toEqual({ expected, trial: i });
        }
      }
    });
  });
});

// Control flow opcodes need to be balanced, so we wrap the pattern in a loop / branch if needed
function toInstructions(asm: string): AuthenticationInstruction[] {
  const tokens = asm.split(' ');
  let wrappedAsm = asm;
  if (tokens.includes('OP_UNTIL')) wrappedAsm = `OP_BEGIN ${wrappedAsm}`;
  if (tokens.includes('OP_IF') || tokens.includes('OP_NOTIF')) wrappedAsm = `${wrappedAsm} OP_1 OP_ELSE OP_2 OP_ENDIF`;
  return decodeAuthenticationInstructions(asmToBytecode(wrappedAsm));
}

interface EvaluationResult {
  error: boolean;
  stack: Uint8Array[];
  alternateStack: Uint8Array[];
}

function evaluate(
  instructions: AuthenticationInstruction[],
  stack: Uint8Array[],
  alternateStack: Uint8Array[],
): EvaluationResult {
  const state = vm.stateEvaluate({
    ...vm.stateClone(initialState),
    instructions,
    stack: [...stack],
    alternateStack: [...alternateStack],
  });

  // Error messages can differ between equivalent scripts, so we only compare whether an error occurred
  if (state.error !== undefined) return { error: true, stack: [], alternateStack: [] };
  return { error: false, stack: state.stack, alternateStack: state.alternateStack };
}

function isSameEvaluationResult(a: EvaluationResult, b: EvaluationResult): boolean {
  return a.error === b.error && isSameStack(a.stack, b.stack) && isSameStack(a.alternateStack, b.alternateStack);
}

function isSameStack(a: Uint8Array[], b: Uint8Array[]): boolean {
  return a.length === b.length && a.every((item, i) => Buffer.from(item).equals(b[i]));
}

type Random = (max: number) => number;

// Stack items that exercise the edge cases of the VM's number, boolean and size checks
const STACK_ITEM_GENERATORS: ((random: Random) => Uint8Array)[] = [
  () => Uint8Array.of(),
  (random) => Uint8Array.of(random(16) + 1),
  (random) => Uint8Array.of(random(127) + 1),
  () => Uint8Array.of(0x81),
  () => Uint8Array.of(0x00),
  () => Uint8Array.of(0x80),
  () => Uint8Array.of(0x00, 0x80),
  () => Uint8Array.of(0x01, 0x00),
  (random) => createRandomBytes(random, random(8) + 1),
  (random) => createRandomBytes(random, random(40)),
  // Two of these exceed the maximum stack item size when concatenated
  (random) => new Uint8Array(5_001 + random(100)),
];

// The first trials fill the entire stack with a single kind of item, so interactions between items of the same kind
// (e.g. concatenating two large items) are always covered. Later trials mix random kinds of items.
function createStack(random: Random, depth: number, trial: number): Uint8Array[] {
  const pickGenerator = (): ((random: Random) => Uint8Array) => (
    STACK_ITEM_GENERATORS[trial < STACK_ITEM_GENERATORS.length ? trial : random(STACK_ITEM_GENERATORS.length)]
  );

  return Array.from({ length: depth }, () => pickGenerator()(random));
}

function createRandomBytes(random: Random, length: number): Uint8Array {
  return Uint8Array.from({ length }, () => random(256));
}

// Seeded PRNG (mulberry32), so that failures are reproducible
function createRandom(seed: number): Random {
  let state = seed;
  return (max: number) => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * max);
  };
}

function hashString(str: string): number {
  return [...str].reduce((hash, char) => Math.imul(hash, 31) + char.charCodeAt(0), 0);
}
