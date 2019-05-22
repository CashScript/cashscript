import { Script as BScript } from 'bitbox-sdk';

export const Script = new BScript();
export const Op = Script.opcodes;

export type Op = number;
export type OpOrData = Op | Buffer;
