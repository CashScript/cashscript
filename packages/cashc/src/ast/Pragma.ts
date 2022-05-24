import { VersionOperatorContext } from '../grammar/CashScriptParser.js';

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
  return <VersionOp>(ctx ? ctx.text : '=');
}
