import { Location } from './ast/Location';
import { Type } from './ast/Type';

export class CashScriptError extends Error {
  constructor(
    public location?: Location,
  ) {
    super();
  }
}

export class TypeError extends CashScriptError {
  constructor(
    public expected: Type,
    public actual: Type,
    public location?: Location,
  ) {
    super(location);
  }
}
