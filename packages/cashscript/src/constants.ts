export const VERSION_SIZE = 4;
export const LOCKTIME_SIZE = 4;
// Size of a placeholder P2PKH unlocking script using Schnorr signatures: push(signature) push(pk).
export const PLACEHOLDER_P2PKH_UNLOCKING_SIZE = 1 + 65 + 1 + 33;
