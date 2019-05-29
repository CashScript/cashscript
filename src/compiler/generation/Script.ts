import { Script } from 'bitbox-sdk';

export const Op = new Script().opcodes;

export type Op = number;
export type OpOrData = Op | Buffer;
export type Script = OpOrData[];
