import { Artifact, RequireStatement, Type } from '@cashscript/utils';
import {
  CallStackEntry,
  ResolvedFrame,
  getLocationDataForFrame,
  resolveInlineAttribution,
  rootFrame,
} from './debug-frame.js';

export class TypeError extends Error {
  constructor(actual: string, expected: Type) {
    super(`Found type '${actual}' where type '${expected.toString()}' was expected`);
  }
}

export class UndefinedInputError extends Error {
  constructor() {
    super('Input is undefined');
  }
}

export class OutputSatoshisTooSmallError extends Error {
  constructor(satoshis: bigint, minimumAmount: bigint) {
    super(`Tried to add an output with ${satoshis} satoshis, which is less than the required minimum for this output-type (${minimumAmount})`);
  }
}

export class OutputTokenAmountTooSmallError extends Error {
  constructor(amount: bigint) {
    super(`Tried to add an output with ${amount} tokens, which is invalid`);
  }
}

export class OutputTokenCategoryInvalidError extends Error {
  constructor(category: string) {
    super(`Provided token category ${category} is not a hex string`);
  }
}

export class OutputTokenCommitmentInvalidError extends Error {
  constructor(commitment: string) {
    super(`Provided token commitment ${commitment} is not a hex string`);
  }
}

export class OutputTokenCommitmentTooLongError extends Error {
  constructor(commitment: string, maximumSize: number) {
    super(`Provided token commitment ${commitment} is longer than the maximum size of ${maximumSize} bytes`);
  }
}

export class OpReturnSizeTooLargeError extends Error {
  constructor(size: number, maximumSize: number) {
    super(`OP_RETURN output size of ${size} is greater than the maximum size of ${maximumSize}`);
  }
}

export class OutputBchChangeLockedError extends Error {
  constructor() {
    super('Tried to add a BCH input or output after a BCH change output was already added');
  }
}

export class OutputTokenChangeLockedError extends Error {
  constructor(category: string) {
    super(`Tried to add a token input or output with category ${category} after a change output with the same category was already added`);
  }
}

export class TokensToNonTokenAddressError extends Error {
  constructor(address: string) {
    super(`Tried to send tokens to an address without token support, ${address}.`);
  }
}

export class OutputAddressNetworkMismatchError extends Error {
  constructor(address: string, expectedNetworkPrefix: string) {
    super(`Tried to add an output to an address on the wrong network, ${address}. Expected network prefix: ${expectedNetworkPrefix}.`);
  }
}

export class TransactionInputsRequiredError extends Error {
  constructor() {
    super('Transaction must have at least one input');
  }
}

export class TransactionOutputsRequiredError extends Error {
  constructor() {
    super('Transaction must have at least one output');
  }
}

export class UnlockingBytecodeTooLargeError extends Error {
  constructor(size: number, maximumSize: number) {
    super(`Unlocking bytecode size of ${size} is greater than the maximum size of ${maximumSize}`);
  }
}

export class TransactionTooLargeError extends Error {
  constructor(size: number, maximumSize: number) {
    super(`Transaction size of ${size} is greater than the maximum standard transaction size of ${maximumSize}`);
  }
}

export class TransactionFeeTooHighError extends Error {
  constructor(fee: bigint, maximumFee: bigint) {
    super(`Transaction fee of ${fee} is higher than max fee of ${maximumFee}`);
  }
}

export class TransactionFeePerByteTooHighError extends Error {
  constructor(feePerByte: number, maximumFeePerByte: number) {
    super(`Transaction fee per byte of ${feePerByte} is higher than max fee per byte of ${maximumFeePerByte}`);
  }
}

export class TransactionFeePerByteTooLowError extends Error {
  constructor(feePerByte: number, minimumFeePerByte: number) {
    super(`Transaction fee per byte of ${feePerByte} is lower than the standard minimum fee per byte of ${minimumFeePerByte}`);
  }
}

export class NoDebugInformationInArtifactError extends Error {
  constructor() {
    super('No debug information found in artifact, please recompile with cashc version 0.10.0 or newer.');
  }
}

export class FailedTransactionError extends Error {
  constructor(public reason: string, public bitauthUri: string) {
    const warning = 'WARNING: it is unsafe to use this Bitauth URI when using real private keys as they are included in the transaction template';
    super(`${reason}${bitauthUri ? `\n\n${warning}\n\nBitauth URI: ${bitauthUri}` : ''}`);
  }
}

export class FailedTransactionEvaluationError extends FailedTransactionError {
  constructor(
    public artifact: Artifact,
    public failingInstructionPointer: number,
    public inputIndex: number,
    public bitauthUri: string,
    public libauthErrorMessage: string,
    frame?: ResolvedFrame,
  ) {
    let message = `${artifact.contractName}.cash Error in transaction at input ${inputIndex} in contract ${artifact.contractName}.cash.\nReason: ${libauthErrorMessage}`;

    if (artifact.debug) {
      const resolvedFrame = frame ?? rootFrame(artifact);
      const { statement, lineNumber } = getLocationDataForFrame(resolvedFrame, failingInstructionPointer);
      const context = formatFrameContext(resolvedFrame, artifact.contractName, lineNumber);
      message = `${resolvedFrame.sourceName}:${lineNumber} Error in transaction at input ${inputIndex} ${context}.\nReason: ${libauthErrorMessage}\nFailing statement: ${statement}`;
    }

    super(message, bitauthUri);
  }
}

export class FailedRequireError extends FailedTransactionError {
  constructor(
    public artifact: Artifact,
    public failingInstructionPointer: number,
    public requireStatement: RequireStatement,
    public inputIndex: number,
    public bitauthUri: string,
    public libauthErrorMessage?: string,
    frame?: ResolvedFrame,
    public callStack: CallStackEntry[] = [],
  ) {
    const resolvedFrame = frame ?? rootFrame(artifact);

    const inline = resolveInlineAttribution(artifact, resolvedFrame, requireStatement, 'requires');
    const attributedFrame = inline?.frame ?? resolvedFrame;
    const attributedIp = inline?.entry.ip ?? failingInstructionPointer;

    const { statement, lineNumber } = getLocationDataForFrame(attributedFrame, attributedIp);
    const context = formatFrameContext(attributedFrame, artifact.contractName, lineNumber);

    const baseMessage = `${attributedFrame.sourceName}:${lineNumber} Require statement failed at input ${inputIndex} ${context}`;
    const baseMessageWithRequireMessage = `${baseMessage} with the following message: ${requireStatement.message}`;
    const headline = `${requireStatement.message ? baseMessageWithRequireMessage : baseMessage}.`;

    // Compiler-injected guards (e.g. the tx.locktime guard) have no user-written source, so the
    // extracted statement is empty — the require message fully describes the failure on its own.
    const statementMessage = statement.trim() ? `${headline}\nFailing statement: ${statement}` : headline;

    // A single-entry call stack adds nothing over the headline, so it is only shown for nested calls
    const callStackMessage = callStack.length >= 2 ? `\n${formatCallStack(callStack)}` : '';

    super(statementMessage + callStackMessage, bitauthUri);
  }
}

const formatFrameContext = (frame: ResolvedFrame, contractName: string, lineNumber: number): string => {
  if (frame.functionName) {
    return `in contract ${contractName}, function ${frame.functionName} (${frame.sourceName}, line ${lineNumber})`;
  }

  return `in contract ${contractName}.cash at line ${lineNumber}`;
};

const formatCallStack = (callStack: CallStackEntry[]): string => callStack
  .map(({ functionName, sourceName, line, statement }) => {
    const location = functionName ? `${functionName} (${sourceName}:${line})` : `${sourceName}:${line}`;
    return `  at ${location} — ${statement}`;
  })
  .join('\n');
