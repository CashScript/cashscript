export const VERSION_SIZE = 4;
export const LOCKTIME_SIZE = 4;
export const P2PKH_INPUT_SIZE = 32 + 4 + 1 + 1 + 65 + 1 + 33 + 4;
// Unlocking script a wallet produces for a P2PKH input: push(signature) + push(public key).
// Sized for the 73-byte DER upper bound so ECDSA-signing wallets are covered, Schnorr is 8 bytes smaller.
export const PLACEHOLDER_P2PKH_UNLOCKING_SIZE = 1 + 73 + 1 + 33;
