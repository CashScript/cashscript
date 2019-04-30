export enum GlobalFunction {
  REQUIRE = 'require',
  ABS = 'abs',
  MIN = 'min',
  MAX = 'max',
  WITHIN = 'within',
  RIPEMD160 = 'ripemd160',
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  SIGCHECK = 'sigCheck'
}

export enum GlobalVariable {
  TX = 'tx'
}

export const NumberUnit: { [index:string] : number } = {
  SATOSHIS: 1,
  SATS: 1,
  FINNEY: 10,
  BITS: 100,
  BITCOIN: 100000000,
  SECONDS: 1,
  MINUTES: 60,
  HOURS: 3600,
  DAYS: 86400,
  WEEKS: 604800,
};
