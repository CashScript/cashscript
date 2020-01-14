import { Type } from 'cashc';

export class TypeError extends Error {
  constructor(actual: string, expected: Type) {
    super(`Found type '${actual}' where type '${expected.toString()}' was expected`);
  }
}

export class FailedTransactionError extends Error {
  constructor(public reason: string, public meep: string) {
    super(`Transaction failed with reason: ${reason}\n${meep}`);
  }
}

export class FailedRequireError extends FailedTransactionError {}
export class FailedTimeCheckError extends FailedTransactionError {}
export class FailedSigCheckError extends FailedTransactionError {}

// TODO: Expand these reasons with non-script failures (like tx-mempool-conflict)
export enum Reason {
  EVAL_FALSE = 'Script evaluated without error but finished with a false/empty top stack element',
  VERIFY = 'Script failed an OP_VERIFY operation',
  EQUALVERIFY = 'Script failed an OP_EQUALVERIFY operation',
  CHECKMULTISIGVERIFY = 'Script failed an OP_CHECKMULTISIGVERIFY operation',
  CHECKSIGVERIFY = 'Script failed an OP_CHECKSIGVERIFY operation',
  CHECKDATASIGVERIFY = 'Script failed an OP_CHECKDATASIGVERIFY operation',
  NUMEQUALVERIFY = 'Script failed an OP_NUMEQUALVERIFY operation',
  SCRIPT_SIZE = 'Script is too big',
  PUSH_SIZE = 'Push value size limit exceeded',
  OP_COUNT = 'Operation limit exceeded',
  STACK_SIZE = 'Stack size limit exceeded',
  SIG_COUNT = 'Signature count negative or greater than pubkey count',
  PUBKEY_COUNT = 'Pubkey count negative or limit exceeded',
  INVALID_OPERAND_SIZE = 'Invalid operand size',
  INVALID_NUMBER_RANGE = 'Given operand is not a number within the valid range [-2^31...2^31]',
  IMPOSSIBLE_ENCODING = 'The requested encoding is impossible to satisfy',
  INVALID_SPLIT_RANGE = 'Invalid OP_SPLIT range',
  INVALID_BIT_COUNT = 'Invalid number of bit set in OP_CHECKMULTISIG',
  BAD_OPCODE = 'Opcode missing or not understood',
  DISABLED_OPCODE = 'Attempted to use a disabled opcode',
  INVALID_STACK_OPERATION = 'Operation not valid with the current stack size',
  INVALID_ALTSTACK_OPERATION = 'Operation not valid with the current altstack size',
  OP_RETURN = 'OP_RETURN was encountered',
  UNBALANCED_CONDITIONAL = 'Invalid OP_IF construction',
  DIV_BY_ZERO = 'Division by zero error',
  MOD_BY_ZERO = 'Modulo by zero error',
  INVALID_BITFIELD_SIZE = 'Bitfield of unexpected size error',
  INVALID_BIT_RANGE = 'Bitfield\'s bit out of the expected range',
  NEGATIVE_LOCKTIME = 'Negative locktime',
  UNSATISFIED_LOCKTIME = 'Locktime requirement not satisfied',
  SIG_HASHTYPE = 'Signature hash type missing or not understood',
  SIG_DER = 'Non-canonical DER signature',
  MINIMALDATA = 'Data push larger than necessary',
  SIG_PUSHONLY = 'Only push operators allowed in signature scripts',
  SIG_HIGH_S = 'Non-canonical signature: S value is unnecessarily high',
  MINIMALIF = 'OP_IF/NOTIF argument must be minimal',
  SIG_NULLFAIL = 'Signature must be zero for failed CHECK(MULTI)SIG operation',
  SIG_BADLENGTH = 'Signature cannot be 65 bytes in CHECKMULTISIG',
  SIG_NONSCHNORR = 'Only Schnorr signatures allowed in this operation',
  DISCOURAGE_UPGRADABLE_NOPS = 'NOPx reserved for soft-fork upgrades',
  PUBKEYTYPE = 'Public key is neither compressed or uncompressed',
  CLEANSTACK = 'Script did not clean its stack',
  NONCOMPRESSED_PUBKEY = 'Using non-compressed public key',
  ILLEGAL_FORKID = 'Illegal use of SIGHASH_FORKID',
  MUST_USE_FORKID = 'Signature must use SIGHASH_FORKID',
}
