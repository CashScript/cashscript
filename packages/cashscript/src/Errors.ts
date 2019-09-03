export class TypeError extends Error {
  constructor(actual: string, expected: string) {
    super(`Found type '${actual}' where type '${expected}' was expected`);
  }
}
