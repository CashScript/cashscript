import { Type } from 'cashc';

export class TypeError extends Error {
  constructor(actual: string, expected: Type) {
    super(`Found type '${actual}' where type '${expected.toString()}' was expected`);
  }
}
