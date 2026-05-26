// Base class for errors returned by a network provider when broadcasting a transaction.
export class NetworkProviderError extends Error {
  constructor(message: string, public originalError: string) {
    super(message);
  }
}

// Thrown when one or more inputs reference UTXOs that are missing or already spent.
export class NetworkProviderMissingInputsError extends NetworkProviderError {
  constructor(originalError: string) {
    super(`Transaction inputs are missing or already spent: ${originalError}`, originalError);
  }
}

// Thrown when an input is already being spent by another transaction in the mempool (double-spend).
export class NetworkProviderMempoolConflictError extends NetworkProviderError {
  constructor(originalError: string) {
    super(`Transaction conflicts with an unconfirmed transaction in the mempool: ${originalError}`, originalError);
  }
}

// Thrown when the same transaction has already been submitted (already in mempool or confirmed).
export class NetworkProviderTransactionAlreadySubmittedError extends NetworkProviderError {
  constructor(originalError: string) {
    super(`Transaction has already been submitted: ${originalError}`, originalError);
  }
}

// Thrown when the transaction's nLockTime has not been satisfied (transaction is not yet final).
export class NetworkProviderAbsoluteTimelockError extends NetworkProviderError {
  constructor(originalError: string) {
    super(`Transaction is not yet final (nLockTime not satisfied): ${originalError}`, originalError);
  }
}

// Thrown when a BIP68 relative timelock (sequence lock) on an input has not been satisfied.
export class NetworkProviderRelativeTimelockError extends NetworkProviderError {
  constructor(originalError: string) {
    super(`BIP68 sequence lock not satisfied: ${originalError}`, originalError);
  }
}
