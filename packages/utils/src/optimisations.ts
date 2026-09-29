import { binToHex, hexToBin, isVmNumberError, vmNumberToBigInt } from '@bitauth/libauth';
import { encodeInt } from './data.js';

// A match replaces consecutive parts of the script, each with its own replacement. Every replacement opcode gets the
// merged source location of its part, so a match should keep the opcodes that it does not change in their own parts.
export type OptimisationMatch = OptimisationPart[];

export interface OptimisationPart {
  // The number of ASM tokens that the part replaces
  length: number;
  replacement: string[];
}

// Matches a family of patterns at the index of the script's ASM tokens, for patterns that a single
// [pattern, replacement] pair cannot express, e.g. because they depend on a stack depth
export type OptimisationMatcher = (tokens: string[], index: number) => OptimisationMatch | undefined;

// Note: the order in which these optimisations are applied can impact the output, so entries should
// not be reordered without carefully verifying the compiled bytecode of existing contracts.
const optimisationReplacements: Array<[string, string] | OptimisationMatcher> = [
  // Hardcoded arithmetic
  ['OP_1 OP_ADD', 'OP_1ADD'],
  ['OP_1 OP_SUB', 'OP_1SUB'],
  ['OP_1 OP_NEGATE', 'OP_1NEGATE'],
  ['OP_0 OP_NUMEQUAL OP_NOT', 'OP_0NOTEQUAL'],
  ['OP_NUMEQUAL OP_NOT', 'OP_NUMNOTEQUAL'],
  ['OP_SHA256 OP_SHA256', 'OP_HASH256'],
  ['OP_SHA256 OP_RIPEMD160', 'OP_HASH160'],

  // Hardcoded stack ops
  ['OP_2 OP_PICK OP_1 OP_PICK OP_3 OP_PICK', 'OP_3DUP OP_SWAP'],
  ['OP_2 OP_PICK OP_2 OP_PICK OP_2 OP_PICK', 'OP_3DUP'],

  ['OP_0 OP_PICK OP_2 OP_PICK', 'OP_2DUP OP_SWAP'],
  ['OP_2 OP_PICK OP_4 OP_PICK', 'OP_2OVER OP_SWAP'],
  ['OP_3 OP_PICK OP_3 OP_PICK', 'OP_2OVER'],

  ['OP_2 OP_ROLL OP_3 OP_ROLL', 'OP_2SWAP OP_SWAP'],
  ['OP_3 OP_ROLL OP_3 OP_ROLL', 'OP_2SWAP'],
  ['OP_4 OP_ROLL OP_5 OP_ROLL', 'OP_2ROT OP_SWAP'],
  ['OP_5 OP_ROLL OP_5 OP_ROLL', 'OP_2ROT'],

  ['OP_0 OP_PICK', 'OP_DUP'],
  ['OP_1 OP_PICK', 'OP_OVER'],
  ['OP_0 OP_ROLL', ''],
  ['OP_1 OP_ROLL', 'OP_SWAP'],
  ['OP_2 OP_ROLL', 'OP_ROT'],
  ['OP_DROP OP_DROP', 'OP_2DROP'],

  // Secondary effects
  ['OP_DUP OP_SWAP', 'OP_DUP'],
  ['OP_SWAP OP_SWAP', ''],
  ['OP_2SWAP OP_2SWAP', ''],
  ['OP_ROT OP_ROT OP_ROT', ''],
  ['OP_2ROT OP_2ROT OP_2ROT', ''],
  ['OP_OVER OP_OVER', 'OP_2DUP'],
  ['OP_DUP OP_DROP', ''],
  ['OP_DUP OP_NIP', ''],

  // Enabling secondary effects
  ['OP_DUP OP_OVER', 'OP_DUP OP_DUP'],

  // Merge OP_VERIFY
  ['OP_EQUAL OP_VERIFY', 'OP_EQUALVERIFY'],
  ['OP_NUMEQUAL OP_VERIFY', 'OP_NUMEQUALVERIFY'],
  ['OP_CHECKSIG OP_VERIFY', 'OP_CHECKSIGVERIFY'],
  ['OP_CHECKDATASIG OP_VERIFY', 'OP_CHECKDATASIGVERIFY'],

  // Remove/replace extraneous OP_SWAP
  ['OP_SWAP OP_ADD', 'OP_ADD'],
  ['OP_SWAP OP_MUL', 'OP_MUL'],
  // This was added to keep the old behaviour while explicitly disallowing partial matches in the optimisation regex
  ['OP_SWAP OP_EQUALVERIFY', 'OP_EQUALVERIFY'],
  ['OP_SWAP OP_EQUAL', 'OP_EQUAL'],
  // This was added to keep the old behaviour while explicitly disallowing partial matches in the optimisation regex
  ['OP_SWAP OP_NUMEQUALVERIFY', 'OP_NUMEQUALVERIFY'],
  ['OP_SWAP OP_NUMEQUAL', 'OP_NUMEQUAL'],
  ['OP_SWAP OP_NUMNOTEQUAL', 'OP_NUMNOTEQUAL'],
  ['OP_SWAP OP_GREATERTHANOREQUAL', 'OP_LESSTHANOREQUAL'],
  ['OP_SWAP OP_LESSTHANOREQUAL', 'OP_GREATERTHANOREQUAL'],
  ['OP_SWAP OP_GREATERTHAN', 'OP_LESSTHAN'],
  ['OP_SWAP OP_LESSTHAN', 'OP_GREATERTHAN'],
  ['OP_SWAP OP_DROP', 'OP_NIP'],
  ['OP_SWAP OP_NIP', 'OP_DROP'],

  // Remove/replace extraneous OP_DUP
  ['OP_DUP OP_DROP', ''],
  ['OP_DUP OP_NIP', ''],

  // Random optimisations (don't know what I'm targeting with this)
  ['OP_2DUP OP_DROP', 'OP_OVER'],
  ['OP_2DUP OP_NIP', 'OP_DUP'],
  // Note that this removes OP_CAT's maximum stack item size check, which only matters for unused concatenations
  ['OP_CAT OP_DROP', 'OP_2DROP'],
  ['OP_NIP OP_DROP', 'OP_2DROP'],

  // Far-fetched stuff
  // <pick n> OP_ROT OP_SWAP OP_DROP => OP_SWAP, for any depth n
  dropPickedCopy,

  ['OP_DUP OP_ROT OP_DROP', 'OP_NIP OP_DUP'],
  ['OP_OVER OP_ROT OP_DROP', 'OP_SWAP'],
  ['OP_2 OP_PICK OP_ROT OP_DROP', 'OP_NIP OP_OVER'],

  // <push> OP_NIP => OP_DROP <push>, for any push
  moveDropBeforePush,

  ['OP_2 OP_PICK OP_SWAP OP_2 OP_PICK OP_NIP', 'OP_DROP OP_2DUP'],

  // .slice(0, x) optimisation & .slice(x, y.length) optimisation
  ['OP_0 OP_SPLIT OP_NIP', ''],
  ['OP_SIZE OP_SPLIT OP_DROP', ''],

  // Hardcoded arithmetic
  // Note that OP_NOT does a VM-number check that OP_NOTIF does not, which gets removed by this optimisation. Compiled
  // bools are always valid VM numbers unless they come from unsafe_bool() or unenforced function parameter types.
  // This is also why OP_0 OP_NUMEQUAL => OP_NOT is not safe: it would remove the function selector's number check
  ['OP_NOT OP_IF', 'OP_NOTIF'],

  // Merge OP_VERIFY
  ['OP_CHECKMULTISIG OP_VERIFY', 'OP_CHECKMULTISIGVERIFY'],

  // Remove/replace extraneous OP_SWAP
  ['OP_SWAP OP_AND', 'OP_AND'],
  ['OP_SWAP OP_OR', 'OP_OR'],
  ['OP_SWAP OP_XOR', 'OP_XOR'],

  // Remove/replace extraneous OP_DUP
  ['OP_DUP OP_AND', ''],
  ['OP_DUP OP_OR', ''],

  // Invert comparison operators instead of negating them
  ['OP_LESSTHAN OP_NOT', 'OP_GREATERTHANOREQUAL'],
  ['OP_GREATERTHAN OP_NOT', 'OP_LESSTHANOREQUAL'],
  ['OP_LESSTHANOREQUAL OP_NOT', 'OP_GREATERTHAN'],
  ['OP_GREATERTHANOREQUAL OP_NOT', 'OP_LESSTHAN'],

  // This can get emitted by tuple destructuring
  ['OP_TOALTSTACK OP_FROMALTSTACK', ''],

  // unsafe_bool(4) == true => false, but !!unsafe_bool(4) == true => true) so we can't replace OP_NOT OP_NOT with ''
  // in the general case, but when it is followed by a consuming instruction that does not differentiate between
  // true and truthy values (e.g. OP_IF, OP_UNTIL, OP_VERIFY), we can replace OP_NOT OP_NOT with ''
  // Note that technically OP_NOT OP_NOT would also do a VM-number check, which gets removed by this optimisation
  ['OP_NOT OP_NOT OP_UNTIL', 'OP_UNTIL'],
  ['OP_NOT OP_NOTIF', 'OP_IF'],
  ['OP_NOT OP_NOT OP_VERIFY', 'OP_VERIFY'],

  // Replace alt stack round trips (e.g. from reassignments inside loops) with regular stack ops
  ['OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK', 'OP_ROT OP_ROT'],
  ['OP_TOALTSTACK OP_NIP OP_FROMALTSTACK', 'OP_ROT OP_DROP'],
  ['OP_ROT OP_ROT OP_2DROP', 'OP_NIP OP_NIP'],

  // Remove extraneous OP_SWAP before order-independent operations
  ['OP_SWAP OP_BOOLOR', 'OP_BOOLOR'],
  ['OP_SWAP OP_BOOLAND', 'OP_BOOLAND'],
  ['OP_SWAP OP_MIN', 'OP_MIN'],
  ['OP_SWAP OP_MAX', 'OP_MAX'],
  ['OP_SWAP OP_2DROP', 'OP_2DROP'],

  // Remove extraneous OP_DUP before OP_SIZE, which leaves its input on the stack
  ['OP_DUP OP_SIZE OP_NIP', 'OP_SIZE'],

  // Replace stack shuffles with shorter equivalents
  ['OP_SWAP OP_OVER', 'OP_TUCK'],
  // Note that OP_3DUP also copies an item that is then dropped, which raises the operation cost when that item is large
  ['OP_2 OP_PICK OP_2 OP_PICK', 'OP_3DUP OP_DROP'],
  ['OP_2 OP_PICK OP_OVER', 'OP_3DUP OP_NIP'],
  ['OP_2 OP_PICK OP_NIP', 'OP_DROP OP_OVER'],
  ['OP_TOALTSTACK OP_ROT OP_ROT OP_FROMALTSTACK', 'OP_2SWAP OP_ROT'],
  // OP_TUCK leaves the two operands in the opposite order, so this only holds for order-independent comparisons
  ['OP_DUP OP_ROT OP_NUMEQUALVERIFY', 'OP_TUCK OP_NUMEQUALVERIFY'],

  // <pick n> <expression> <drop n+1> => <roll n> <expression>, for any depth n and any expression, which updates a
  // variable in place instead of copying it and dropping the original (e.g. x = x + 1 inside a branch)
  // This comes before the deeper drop rules below, which would otherwise match the end of its patterns first
  updateInPlace,

  // Replace drops of items deeper in the stack (e.g. from scope cleanup) with shorter equivalents
  ['OP_ROT OP_DROP OP_NIP', 'OP_NIP OP_NIP'],
  ['OP_3 OP_ROLL OP_DROP OP_ROT', 'OP_2SWAP OP_NIP'],
  ['OP_ROT OP_ROT OP_DROP', 'OP_NIP OP_SWAP'],
  ['OP_3 OP_ROLL OP_DROP OP_NIP OP_NIP', 'OP_NIP OP_NIP OP_NIP'],
];

// Static [pattern, replacement] pairs become matchers of their exact tokens, so every optimisation applies the same way
export const optimisationMatchers = optimisationReplacements.map((optimisation) => (
  typeof optimisation === 'function' ? optimisation : matchStaticReplacement(optimisation)
));

function matchStaticReplacement([pattern, replacement]: [string, string]): OptimisationMatcher {
  const patternTokens = tokeniseAsm(pattern);
  const replacementTokens = tokeniseAsm(replacement);

  return (tokens, index) => (
    matchesTokens(tokens, index, patternTokens)
      ? [{ length: patternTokens.length, replacement: replacementTokens }]
      : undefined
  );
}

// OP_ROT OP_SWAP OP_DROP drops the copy that the pick pushed, and swaps the two items below it
function dropPickedCopy(tokens: string[], index: number): OptimisationMatch | undefined {
  const pick = matchPick(tokens, index);
  if (!pick || !matchesTokens(tokens, pick.end, ['OP_ROT', 'OP_SWAP', 'OP_DROP'])) return undefined;

  return [{ length: pick.end + 3 - index, replacement: ['OP_SWAP'] }];
}

// Moving the OP_DROP before the push lets it combine with the ops that produced the dropped item
function moveDropBeforePush(tokens: string[], index: number): OptimisationMatch | undefined {
  if (!isPush(tokens[index]) || tokens[index + 1] !== 'OP_NIP') return undefined;

  return [{ length: 2, replacement: ['OP_DROP', tokens[index]] }];
}

// The expression can be anything that turns the copied value into a single new value, including copies of other
// variables (see matchExpressionStep)
function updateInPlace(tokens: string[], index: number): OptimisationMatch | undefined {
  const pick = matchPick(tokens, index);
  if (!pick) return undefined;

  const drop = dropTokens(pick.depth + 1);
  for (const expression of updatedExpressions(tokens, pick.end, pick.depth)) {
    if (matchesTokens(tokens, expression.end, drop)) {
      return [
        { length: pick.end - index, replacement: rollTokens(pick.depth) },
        ...expression.parts,
        { length: drop.length, replacement: [] },
      ];
    }
  }

  return undefined;
}

interface UpdatedExpression {
  end: number;
  parts: OptimisationPart[];
}

const MAX_EXPRESSION_STEPS = 100;

// Yields every expression from `start` that turns the top stack item into exactly one value, with one part per step
function* updatedExpressions(tokens: string[], start: number, rolledDepth: number): Generator<UpdatedExpression> {
  const parts: OptimisationPart[] = [];
  let height = 1; // the number of stack items that the expression has produced so far
  let position = start;

  // The step limit keeps the search linear in long runs of opcodes that could all be part of an expression
  while (parts.length <= MAX_EXPRESSION_STEPS) {
    if (height === 1) yield { end: position, parts: [...parts] };

    const step = matchExpressionStep(tokens, position, height, rolledDepth);
    if (!step) return;

    parts.push(step.part);
    height += step.heightChange;
    position += step.part.length;
  }
}

interface ExpressionStep {
  part: OptimisationPart;
  heightChange: number;
}

// A step can only consume the items that the expression produced itself, but it can copy any item from below them.
// Those copies are rewritten for when the original variable was rolled from `rolledDepth` instead of copied from it,
// which moves the items below it up by one. A copy of the original variable itself ends the expression, since the
// expression might already have consumed it.
function matchExpressionStep(
  tokens: string[],
  position: number,
  height: number,
  rolledDepth: number,
): ExpressionStep | undefined {
  const pick = matchPick(tokens, position);
  if (pick) {
    const depthBelowExpression = pick.depth - height;
    if (depthBelowExpression === rolledDepth) return undefined;

    const depth = depthBelowExpression > rolledDepth ? pick.depth - 1 : pick.depth;
    return { part: { length: pick.end - position, replacement: pickTokens(depth) }, heightChange: 1 };
  }

  const stackEffect = getStackEffect(tokens[position]);
  if (!stackEffect || stackEffect.pops > height) return undefined;

  return { part: { length: 1, replacement: [tokens[position]] }, heightChange: stackEffect.pushes - stackEffect.pops };
}

interface Pick {
  depth: number;
  end: number;
}

function matchPick(tokens: string[], index: number): Pick | undefined {
  if (tokens[index] === 'OP_DUP') return { depth: 0, end: index + 1 };
  if (tokens[index] === 'OP_OVER') return { depth: 1, end: index + 1 };

  const depth = decodeNumber(tokens[index]);
  if (depth === undefined || depth < 0 || tokens[index + 1] !== 'OP_PICK') return undefined;

  return { depth, end: index + 2 };
}

// <pick n>, <roll n> and <drop n> are the forms of <n> OP_PICK, <n> OP_ROLL and <n> OP_ROLL OP_DROP that are left after
// the hardcoded stack op rules above, e.g. OP_OVER instead of OP_1 OP_PICK
const pickTokens = (depth: number): string[] => [['OP_DUP'], ['OP_OVER']][depth] ?? [encodeNumber(depth), 'OP_PICK'];
const rollTokens = (depth: number): string[] => [[], ['OP_SWAP'], ['OP_ROT']][depth] ?? [encodeNumber(depth), 'OP_ROLL'];
const dropTokens = (depth: number): string[] => [['OP_DROP'], ['OP_NIP']][depth] ?? [...rollTokens(depth), 'OP_DROP'];

interface StackEffect {
  pops: number;
  pushes: number;
}

function getStackEffect(token: string | undefined): StackEffect | undefined {
  if (token === undefined) return undefined;
  if (isPush(token)) return { pops: 0, pushes: 1 };
  return PURE_OPCODE_STACK_EFFECTS.find(({ opcodes }) => opcodes.includes(token));
}

// Opcodes that replace their `pops` top stack items with `pushes` items that only depend on the popped items and the
// transaction. Any other opcode (e.g. OP_VERIFY, OP_ROLL, OP_TOALTSTACK or OP_IF) ends an expression.
// OP_DUP, OP_OVER and OP_PICK are handled separately, because they can read items below the expression.
const PURE_OPCODE_STACK_EFFECTS: Array<StackEffect & { opcodes: string[] }> = [
  {
    pops: 0,
    pushes: 1,
    opcodes: ['OP_INPUTINDEX', 'OP_ACTIVEBYTECODE', 'OP_TXVERSION', 'OP_TXINPUTCOUNT', 'OP_TXOUTPUTCOUNT', 'OP_TXLOCKTIME'],
  },
  { pops: 1, pushes: 0, opcodes: ['OP_DROP'] },
  {
    pops: 1,
    pushes: 1,
    opcodes: [
      'OP_1ADD', 'OP_1SUB', 'OP_NEGATE', 'OP_ABS', 'OP_NOT', 'OP_0NOTEQUAL', 'OP_INVERT', 'OP_BIN2NUM', 'OP_REVERSEBYTES',
      'OP_RIPEMD160', 'OP_SHA1', 'OP_SHA256', 'OP_HASH160', 'OP_HASH256', 'OP_UTXOVALUE', 'OP_UTXOBYTECODE',
      'OP_OUTPOINTTXHASH', 'OP_OUTPOINTINDEX', 'OP_INPUTBYTECODE', 'OP_INPUTSEQUENCENUMBER', 'OP_OUTPUTVALUE',
      'OP_OUTPUTBYTECODE', 'OP_UTXOTOKENCATEGORY', 'OP_UTXOTOKENCOMMITMENT', 'OP_UTXOTOKENAMOUNT',
      'OP_OUTPUTTOKENCATEGORY', 'OP_OUTPUTTOKENCOMMITMENT', 'OP_OUTPUTTOKENAMOUNT',
    ],
  },
  { pops: 1, pushes: 2, opcodes: ['OP_SIZE'] },
  { pops: 2, pushes: 0, opcodes: ['OP_2DROP'] },
  {
    pops: 2,
    pushes: 1,
    opcodes: [
      'OP_NIP', 'OP_CAT', 'OP_NUM2BIN', 'OP_AND', 'OP_OR', 'OP_XOR', 'OP_EQUAL', 'OP_ADD', 'OP_SUB', 'OP_MUL', 'OP_DIV',
      'OP_MOD', 'OP_LSHIFTNUM', 'OP_RSHIFTNUM', 'OP_LSHIFTBIN', 'OP_RSHIFTBIN', 'OP_BOOLAND', 'OP_BOOLOR', 'OP_NUMEQUAL',
      'OP_NUMNOTEQUAL', 'OP_LESSTHAN', 'OP_GREATERTHAN', 'OP_LESSTHANOREQUAL', 'OP_GREATERTHANOREQUAL', 'OP_MIN',
      'OP_MAX', 'OP_CHECKSIG',
    ],
  },
  { pops: 2, pushes: 2, opcodes: ['OP_SWAP', 'OP_SPLIT'] },
  { pops: 2, pushes: 3, opcodes: ['OP_TUCK'] },
  { pops: 2, pushes: 4, opcodes: ['OP_2DUP'] },
  { pops: 3, pushes: 1, opcodes: ['OP_WITHIN', 'OP_CHECKDATASIG'] },
  { pops: 3, pushes: 3, opcodes: ['OP_ROT'] },
  { pops: 3, pushes: 6, opcodes: ['OP_3DUP'] },
  { pops: 4, pushes: 4, opcodes: ['OP_2SWAP'] },
  { pops: 4, pushes: 6, opcodes: ['OP_2OVER'] },
  { pops: 6, pushes: 6, opcodes: ['OP_2ROT'] },
];

// Data pushes are hex tokens in the ASM, and number pushes are OP_0, OP_1NEGATE and OP_1 to OP_16
function isPush(token: string | undefined): boolean {
  return token !== undefined && (!token.startsWith('OP_') || /^OP_(\d+|1NEGATE)$/.test(token));
}

function decodeNumber(token: string | undefined): number | undefined {
  if (token === undefined || !isPush(token)) return undefined;
  if (token.startsWith('OP_')) return token === 'OP_1NEGATE' ? -1 : Number(token.slice(3));

  const number = vmNumberToBigInt(hexToBin(token));
  return isVmNumberError(number) ? undefined : Number(number);
}

function encodeNumber(number: number): string {
  return number <= 16 ? `OP_${number}` : binToHex(encodeInt(BigInt(number)));
}

function matchesTokens(tokens: string[], index: number, expectedTokens: string[]): boolean {
  return expectedTokens.every((token, offset) => tokens[index + offset] === token);
}

function tokeniseAsm(asm: string): string[] {
  return asm.match(/\S+/g) ?? [];
}
