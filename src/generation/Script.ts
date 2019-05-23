import { ScriptUtil } from '../sdk/BITBOX';

export const Op = ScriptUtil.opcodes;

export type Op = number;
export type OpOrData = Op | Buffer;
export type Script = OpOrData[];
