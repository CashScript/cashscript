import { TypeNameContext } from "../grammar/CashScriptParser";

export enum Type {
    INT = 'int',
    BOOL = 'bool',
    STRING = 'string',
    ADDRESS = 'address',
    PUBKEY = 'pubkey',
    SIG = 'sig',
    BYTES = 'bytes',
    BYTES20 = 'bytes20',
    BYTES32 = 'bytes32'
}

export function getTypeFromCtx(ctx: TypeNameContext): Type {
    return getType(ctx.text || ctx.Bytes().text);
}

export function getType(name: string): Type {
    return Type[name.toUpperCase() as keyof typeof Type];
}
