import { Artifact, DebugFrame, RequireStatement, sourceMapToLocationData, Type } from '@cashscript/utils';

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
    public frameId?: string,
    public frameBytecode?: string,
  ) {
    let message = `${artifact.contractName}.cash Error in transaction at input ${inputIndex} in contract ${artifact.contractName}.cash.\nReason: ${libauthErrorMessage}`;

    if (artifact.debug) {
      const { statement, lineNumber, sourceName } = getLocationDataForInstructionPointer(
        artifact,
        failingInstructionPointer,
        frameId,
        frameBytecode,
      );
      message = `${sourceName}:${lineNumber} Error in transaction at input ${inputIndex} in contract ${artifact.contractName}.cash at line ${lineNumber}.\nReason: ${libauthErrorMessage}\nFailing statement: ${statement}`;
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
    const { statement, lineNumber, sourceName } = requireStatement.location
      ? getLocationDataForLocation(
        artifact,
        requireStatement.location,
        requireStatement.frameId,
        requireStatement.frameBytecode,
        requireStatement.sourceFile,
      )
      : getLocationDataForInstructionPointer(
        artifact,
        failingInstructionPointer,
        requireStatement.frameId,
        requireStatement.frameBytecode,
      );

    const baseMessage = `${sourceName}:${lineNumber} Require statement failed at input ${inputIndex} in contract ${artifact.contractName}.cash at line ${lineNumber}`;
    const baseMessageWithRequireMessage = `${baseMessage} with the following message: ${requireStatement.message}`;
    const headline = `${requireStatement.message ? baseMessageWithRequireMessage : baseMessage}.`;

    // Compiler-injected guards (e.g. the tx.locktime guard) have no user-written source, so the
    // extracted statement is empty — the require message fully describes the failure on its own.
    const fullMessage = statement.trim() ? `${headline}\nFailing statement: ${statement}` : headline;

    super(fullMessage, bitauthUri);
  }
}

const getLocationDataForInstructionPointer = (
  artifact: Artifact,
  instructionPointer: number,
  frameId?: string,
  frameBytecode?: string,
): { lineNumber: number; statement: string; sourceName: string } => {
  const frame = getDebugFrame(artifact, frameId, frameBytecode);
  const locationData = sourceMapToLocationData(frame.sourceMap);
  const modifiedInstructionPointer = instructionPointer - (
    frame.id === '__root__' ? artifact.constructorInputs.length : 0
  );

  const { location } = locationData[modifiedInstructionPointer];
  const source = frame.source;
  const failingLines = source.split('\n').slice(location.start.line - 1, location.end.line);

  failingLines[failingLines.length - 1] = failingLines[failingLines.length - 1].slice(0, location.end.column);
  failingLines[0] = failingLines[0].slice(location.start.column);

  return {
    statement: failingLines.join('\n'),
    lineNumber: location.start.line,
    sourceName: getSourceName(frame.sourceFile, artifact),
  };
};

const getLocationDataForLocation = (
  artifact: Artifact,
  location: NonNullable<RequireStatement['location']>,
  frameId?: string,
  frameBytecode?: string,
  sourceFile?: string,
): { lineNumber: number; statement: string; sourceName: string } => {
  const frame = getDebugFrame(artifact, frameId, frameBytecode, sourceFile);
  const failingLines = frame.source.split('\n').slice(location.start.line - 1, location.end.line);

  failingLines[failingLines.length - 1] = failingLines[failingLines.length - 1].slice(0, location.end.column);
  failingLines[0] = failingLines[0].slice(location.start.column);

  return {
    lineNumber: location.start.line,
    statement: failingLines.join('\n'),
    sourceName: getSourceName(sourceFile ?? frame.sourceFile, artifact),
  };
};

function getDebugFrame(
  artifact: Artifact,
  frameId?: string,
  frameBytecode?: string,
  sourceFile?: string,
): DebugFrame {
  const rootFrame: DebugFrame = {
    id: '__root__',
    bytecode: artifact.debug!.bytecode,
    sourceMap: artifact.debug!.sourceMap,
    source: artifact.source,
  };

  const frames = artifact.debug?.frames ?? [];

  if (frameId) {
    const matchingFrame = frames.find((frame) => frame.id === frameId);
    if (matchingFrame) return matchingFrame;
    if (frameId === '__root__') return rootFrame;
  }

  if (frameBytecode) {
    const matchingFrame = frames.find((frame) => (
      frame.bytecode === frameBytecode || frame.bytecode.endsWith(frameBytecode)
    ));
    if (matchingFrame) return matchingFrame;
    if (rootFrame.bytecode === frameBytecode || rootFrame.bytecode.endsWith(frameBytecode)) return rootFrame;
  }

  if (sourceFile) {
    const matchingFrame = frames.find((frame) => frame.sourceFile === sourceFile);
    if (matchingFrame) return matchingFrame;
  }

  return rootFrame;
}

function getSourceName(sourceFile: string | undefined, artifact: Artifact): string {
  return sourceFile ? basename(sourceFile) : `${artifact.contractName}.cash`;
}

function basename(sourceFile: string): string {
  return sourceFile.split(/[/\\]/).at(-1) ?? sourceFile;
}
