import {
  asmToScript,
  FullLocationData,
  Op,
  optimiseBytecode,
  PositionHint,
  Script,
  scriptToAsm,
} from '../src/index.js';
import { optimisationReplacements } from '../src/optimisations.js';

// Differential oracle for the opcode-matching peephole optimiser: on any input, its bytecode must
// byte-for-byte match the string-based engine it replaced, running the SAME optimisation table.
// (The in-compiler cross-check against optimiseBytecodeOld is a different comparison: that
// optimiser applies the cashproof-derived table, whose rule order composes differently on
// adversarial inputs, so the two are only expected to agree on compiler-shaped output.)
//
// The reference below reproduces the replaced engine's string semantics: regex /g computes
// matches against the sweep-start string (a replacement never cascades within its own rule's
// sweep), and an empty replacement leaves a double space that no single-space pattern can match
// across until the pass-end whitespace cleanup. Patterns are anchored with \b, mirroring the
// replaced engine's `${pattern}(\s|$)` end anchor ("no partial matches") — equivalent for
// space-separated ASM — and the opcode matcher is immune to partial-token matches by
// construction. (The cashproof cross-check optimiser, optimiseBytecodeOld, has NO such anchor
// and genuinely can corrupt adversarial scripts: after `OP_NOT OP_IF` -> `OP_NOTIF`, its
// unanchored rule `OP_GREATERTHAN OP_NOT` matches inside `OP_GREATERTHAN OP_NOTIF`, yielding
// the invalid token `OP_LESSTHANOREQUALIF`. That, plus its differently-ordered rule table, is
// why this suite does not use it as the oracle.)
const referenceOptimise = (script: Script, runs: number = 1000): Script => {
  for (let i = 0; i < runs; i += 1) {
    const oldScript = script;
    let asm = scriptToAsm(script);
    optimisationReplacements.forEach(([pattern, replacement]) => {
      asm = asm.replace(new RegExp(`\\b${pattern}\\b`, 'g'), replacement);
    });
    asm = asm.replace(/\s+/g, ' ').trim();
    script = asmToScript(asm); // eslint-disable-line no-param-reassign
    if (scriptToAsm(oldScript) === scriptToAsm(script)) break;
  }
  return script;
};

// Deterministic PRNG (mulberry32) so any failure is reproducible from the reported script index.
const mulberry32 = (initialSeed: number): (() => number) => {
  let seed = initialSeed;
  return (): number => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const OPCODE_POOL: Op[] = [
  Op.OP_0, Op.OP_1, Op.OP_2, Op.OP_3, Op.OP_16, Op.OP_1NEGATE,
  Op.OP_DUP, Op.OP_2DUP, Op.OP_3DUP, Op.OP_DROP, Op.OP_2DROP, Op.OP_NIP, Op.OP_TUCK,
  Op.OP_SWAP, Op.OP_2SWAP, Op.OP_ROT, Op.OP_2ROT, Op.OP_OVER, Op.OP_2OVER,
  Op.OP_PICK, Op.OP_ROLL, Op.OP_TOALTSTACK, Op.OP_FROMALTSTACK, Op.OP_DEPTH, Op.OP_SIZE,
  Op.OP_NOT, Op.OP_0NOTEQUAL, Op.OP_ADD, Op.OP_SUB, Op.OP_1ADD, Op.OP_1SUB, Op.OP_NEGATE, Op.OP_ABS,
  Op.OP_MIN, Op.OP_MAX, Op.OP_WITHIN, Op.OP_BOOLAND, Op.OP_BOOLOR,
  Op.OP_NUMEQUAL, Op.OP_NUMEQUALVERIFY, Op.OP_NUMNOTEQUAL, Op.OP_EQUAL, Op.OP_EQUALVERIFY,
  Op.OP_LESSTHAN, Op.OP_GREATERTHAN, Op.OP_LESSTHANOREQUAL, Op.OP_GREATERTHANOREQUAL,
  Op.OP_VERIFY, Op.OP_IF, Op.OP_ELSE, Op.OP_ENDIF,
  Op.OP_CAT, Op.OP_SPLIT, Op.OP_REVERSEBYTES, Op.OP_BIN2NUM, Op.OP_NUM2BIN,
  Op.OP_SHA256, Op.OP_HASH160, Op.OP_HASH256, Op.OP_RIPEMD160, Op.OP_SHA1,
  Op.OP_CHECKSIG, Op.OP_CHECKSIGVERIFY, Op.OP_CHECKDATASIG, Op.OP_CHECKDATASIGVERIFY,
];

// Pushes chosen to stress the disassembly-exact matching of small-integer representations:
// empty push (renders OP_0), non-minimal single bytes (render OP_1..OP_16 / OP_1NEGATE), and
// plain multi-byte data.
const PUSH_POOL: Uint8Array[] = [
  new Uint8Array([]),
  new Uint8Array([0x00]),
  new Uint8Array([0x01]),
  new Uint8Array([0x07]),
  new Uint8Array([0x10]),
  new Uint8Array([0x81]),
  new Uint8Array([0x11]),
  new Uint8Array([0xff]),
  new Uint8Array([0x01, 0x02]),
  new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
  new Uint8Array(20).fill(0xab),
  new Uint8Array(32).fill(0xcd),
];

// Injected multi-element fragments that overlap known rewrite rules, so matches (including
// cascading ones) stay dense enough to exercise the splice/fixed-point machinery.
const FRAGMENT_POOL: Script[] = [
  [Op.OP_SWAP, Op.OP_SWAP],
  [Op.OP_DUP, Op.OP_DROP],
  [Op.OP_0, Op.OP_ROLL],
  [Op.OP_1, Op.OP_ROLL],
  [Op.OP_1, Op.OP_PICK],
  [Op.OP_TOALTSTACK, Op.OP_FROMALTSTACK],
  [Op.OP_OVER, Op.OP_OVER],
  [Op.OP_3, Op.OP_PICK, Op.OP_3, Op.OP_PICK],
  [Op.OP_3, Op.OP_ROLL, Op.OP_3, Op.OP_ROLL],
  [Op.OP_5, Op.OP_ROLL, Op.OP_5, Op.OP_ROLL],
  [Op.OP_EQUAL, Op.OP_VERIFY],
  [Op.OP_NUMEQUAL, Op.OP_VERIFY],
  [Op.OP_CHECKSIG, Op.OP_VERIFY],
  [Op.OP_SWAP, Op.OP_ADD],
  [Op.OP_SWAP, Op.OP_MUL],
  [Op.OP_DUP, Op.OP_SWAP],
  [Op.OP_NOT, Op.OP_IF],
];

const randomScript = (rand: () => number, length: number): Script => {
  const script: Script = [];
  while (script.length < length) {
    const roll = rand();
    if (roll < 0.5) {
      script.push(OPCODE_POOL[Math.floor(rand() * OPCODE_POOL.length)]);
    } else if (roll < 0.7) {
      script.push(PUSH_POOL[Math.floor(rand() * PUSH_POOL.length)]);
    } else {
      script.push(...FRAGMENT_POOL[Math.floor(rand() * FRAGMENT_POOL.length)]);
    }
  }
  return script;
};

const dummyLocationData = (length: number): FullLocationData => Array.from({ length }, () => ({
  location: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
  positionHint: PositionHint.START,
}));

const optimiseNew = (script: Script, requires = [], logs = []): ReturnType<typeof optimiseBytecode> => (
  optimiseBytecode(script, dummyLocationData(script.length), logs, requires, [], [], 0)
);

describe('optimiser differential (opcode matcher vs same-table string reference)', () => {
  // ~2s uninstrumented, but coverage instrumentation pushes it past vitest's 5s default timeout
  it('produces byte-for-byte identical output on seeded random scripts', { timeout: 60_000 }, () => {
    const rand = mulberry32(0xca5c);
    for (let i = 0; i < 2000; i += 1) {
      const length = 20 + Math.floor(rand() * 130);
      const script = randomScript(rand, length);

      const expected = scriptToAsm(referenceOptimise(script));
      const result = optimiseNew(script);
      const actual = scriptToAsm(result.script);

      if (actual !== expected) {
        throw new Error([
          `optimiser divergence at seeded script #${i}`,
          `input: ${scriptToAsm(script)}`,
          `reference: ${expected}`,
          `new: ${actual}`,
        ].join('\n'));
      }
      // metadata must track the script 1:1 through every splice
      expect(result.locationData.length).toBe(result.script.length);
    }
  });

  const directedCases: Array<[string, Script]> = [
    ['pattern at the very start', [Op.OP_SWAP, Op.OP_SWAP, Op.OP_ADD]],
    ['pattern at the very end', [Op.OP_ADD, Op.OP_SWAP, Op.OP_SWAP]],
    ['entire script optimises away', [Op.OP_SWAP, Op.OP_SWAP]],
    ['empty push renders as OP_0', [new Uint8Array([]), Op.OP_ROLL]],
    ['non-minimal single-byte push renders as OP_1', [new Uint8Array([0x01]), Op.OP_ROLL]],
    ['non-minimal single-byte push renders as OP_1NEGATE', [new Uint8Array([0x81]), Op.OP_DROP]],
    ['OP_1NEGATE opcode form', [Op.OP_1NEGATE, Op.OP_SWAP, Op.OP_SWAP, Op.OP_ADD]],
    ['cascading matches across a splice', [Op.OP_DUP, Op.OP_SWAP, Op.OP_SWAP, Op.OP_DROP, Op.OP_1]],
    ['overlapping candidates', [Op.OP_SWAP, Op.OP_SWAP, Op.OP_SWAP, Op.OP_ADD]],
    ['push data is opaque to patterns', [new Uint8Array([0xde, 0xad]), Op.OP_SWAP, Op.OP_SWAP]],
  ];

  it.each(directedCases)('matches the string reference on edge case: %s', (_, script) => {
    const expected = scriptToAsm(referenceOptimise(script));
    expect(scriptToAsm(optimiseNew(script).script)).toBe(expected);
  });
});

describe('optimiser metadata adjustment goldens', () => {
  it('shifts require ips and location data across a removed pair', () => {
    const script = [Op.OP_2, Op.OP_SWAP, Op.OP_SWAP, Op.OP_3, Op.OP_ADD];
    const requires = [{ ip: 4, line: 1 }];

    const result = optimiseBytecode(script, dummyLocationData(script.length), [], requires, [], [], 0);

    expect(scriptToAsm(result.script)).toBe('OP_2 OP_3 OP_ADD');
    expect(result.requires).toEqual([{ ip: 2, line: 1 }]);
    expect(result.locationData.length).toBe(3);
  });

  it('keeps require ips before a removed pair untouched', () => {
    const script = [Op.OP_2, Op.OP_3, Op.OP_ADD, Op.OP_SWAP, Op.OP_SWAP];
    const requires = [{ ip: 2, line: 1 }];

    const result = optimiseBytecode(script, dummyLocationData(script.length), [], requires, [], [], 0);

    expect(scriptToAsm(result.script)).toBe('OP_2 OP_3 OP_ADD');
    expect(result.requires).toEqual([{ ip: 2, line: 1 }]);
  });

  it('shifts log ips across a removed pair', () => {
    const script = [Op.OP_DUP, Op.OP_DROP, Op.OP_2, Op.OP_3, Op.OP_ADD];
    const logs = [{ ip: 4, line: 1, data: [] }];

    const result = optimiseBytecode(script, dummyLocationData(script.length), logs, [], [], [], 0);

    expect(scriptToAsm(result.script)).toBe('OP_2 OP_3 OP_ADD');
    expect(result.logs).toEqual([{ ip: 2, line: 1, data: [] }]);
  });
});
