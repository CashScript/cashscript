import { TypeNameContext } from "../grammar/CashScriptParser";

export enum Type {
    INT,
    BOOL,
    STRING,
    ADDRESS,
    PUBKEY,
    SIG,
    BYTES,
    BYTES20,
    BYTES32
}

export function getTypeFromCtx(ctx: TypeNameContext): Type {
    return getType(ctx.text || ctx.Bytes().text);
}

export function getType(name: string): Type {
    return Type[name.toUpperCase() as keyof typeof Type];
}
