import { Artifact, RequireStatement, sourceMapToLocationData, Type } from '@cashscript/utils';

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

export class TokensToNonTokenAddressError extends Error {
  constructor(address: string) {
    super(`Tried to send tokens to an address without token support, ${address}.`);
  }
}

export class NoDebugInformationInArtifactError extends Error {
  constructor() {
    super('No debug information found in artifact, please recompile with cashc version 0.10.0 or newer.');
  }
}

export class FailedTransactionError extends Error {
  constructor(public reason: string, public bitauthUri?: string) {
    super(`${reason}${bitauthUri ? `\n\nBitauth URI: ${bitauthUri}` : ''}`);
  }
}

export class FailedTransactionEvaluationError extends FailedTransactionError {
  constructor(
    public artifact: Artifact,
    public failingInstructionPointer: number,
    public inputIndex: number,
    public bitauthUri: string,
    public libauthErrorMessage: string,
  ) {
    let message = `${artifact.contractName}.cash Error in transaction at input ${inputIndex} in contract ${artifact.contractName}.cash.\nReason: ${libauthErrorMessage}`;

    if (artifact.debug) {
      const { statement, lineNumber } = getLocationDataForInstructionPointer(artifact, failingInstructionPointer);
      message = `${artifact.contractName}.cash:${lineNumber} Error in transaction at input ${inputIndex} in contract ${artifact.contractName}.cash at line ${lineNumber}.\nReason: ${libauthErrorMessage}\nFailing statement: ${statement}`;
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
  ) {
    let { statement, lineNumber } = getLocationDataForInstructionPointer(artifact, failingInstructionPointer);

    if (!statement.includes('require')) {
      statement = requireStatement.message
        ? `require(${statement}, "${requireStatement.message}")`
        : `require(${statement})`;

      // Sometimes in reconstructed multiline require statements, we get double commas
      statement = statement.replace(/,,/g, ',');
    }

    const baseMessage = `${artifact.contractName}.cash:${lineNumber} Require statement failed at input ${inputIndex} in contract ${artifact.contractName}.cash at line ${lineNumber}`;
    const baseMessageWithRequireMessage = `${baseMessage} with the following message: ${requireStatement.message}`;
    const fullMessage = `${requireStatement.message ? baseMessageWithRequireMessage : baseMessage}.\nFailing statement: ${statement}`;

    super(fullMessage, bitauthUri);
  }
}

const getLocationDataForInstructionPointer = (
  artifact: Artifact,
  instructionPointer: number,
): { lineNumber: number, statement: string } => {
  const locationData = sourceMapToLocationData(artifact.debug!.sourceMap);

  // We subtract the constructor inputs because these are present in the evaluation (and thus the instruction pointer)
  // but they are not present in the source code (and thus the location data)
  const modifiedInstructionPointer = instructionPointer - artifact.constructorInputs.length;

  const { location } = locationData[modifiedInstructionPointer];

  const failingLines = artifact.source.split('\n').slice(location.start.line - 1, location.end.line);

  // Slice off the start and end of the statement's start and end lines to only return the failing part
  // Note that we first slice off the end, to avoid shifting the end column index
  failingLines[failingLines.length - 1] = failingLines[failingLines.length - 1].slice(0, location.end.column);
  failingLines[0] = failingLines[0].slice(location.start.column);

  const statement = failingLines.join('\n');
  const lineNumber = location.start.line;

  return { statement, lineNumber };
};
