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
