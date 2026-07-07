import semver from 'semver';
import type { VersionOperatorContext } from '../grammar/CashScriptParser.js';
import { version } from '../index.js';
import { VersionError } from '../Errors.js';

export enum PragmaName {
  CASHSCRIPT = 'cashscript',
}

export enum VersionOp {
  CARET = '^',
  TILDE = '~',
  GE = '>=',
  GT = '>',
  LT = '<',
  LE = '<=',
  EQ = '=',
}

export function getPragmaName(name: string): PragmaName {
  return PragmaName[name.toUpperCase() as keyof typeof PragmaName];
}

export function getVersionOpFromCtx(ctx?: VersionOperatorContext): VersionOp {
  return <VersionOp>(ctx ? ctx.getText() : '=');
}

export function checkVersionConstraints(constraints: string[], sourceFile?: string): void {
  // Strip any prerelease tags
  const actualVersion = version.replace(/-.*/g, '');

  constraints.forEach((constraint) => {
    if (!semver.satisfies(actualVersion, constraint)) {
      throw new VersionError(actualVersion, constraint, sourceFile);
    }
  });
}
