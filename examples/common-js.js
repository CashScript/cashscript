import { hash160 } from '@cashscript/utils';
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPath,
  secp256k1,
  encodeCashAddress,
  deriveSeedFromBip39Mnemonic,
} from '@bitauth/libauth';

// This is duplicated from common.ts because it is not possible to import from a .ts file in p2pkh.js

// Generate entropy from BIP39 mnemonic phrase and initialise a root HD-wallet node
const seed = deriveSeedFromBip39Mnemonic('CashScript Examples');
const rootNode = deriveHdPrivateNodeFromSeed(seed, { assumeValidity: true, throwErrors: true });
const baseDerivationPath = "m/44'/145'/0'/0";

// Derive Alice's private key, public key, public key hash and address
const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);
if (typeof aliceNode === 'string') throw new Error();
export const alicePub = secp256k1.derivePublicKeyCompressed(aliceNode.privateKey);
export const alicePriv = aliceNode.privateKey;
export const alicePkh = hash160(alicePub);
export const aliceAddress = encodeCashAddress({ prefix: 'bchtest', type: 'p2pkh', payload: alicePkh, throwErrors: true }).address;
export const aliceTokenAddress = encodeCashAddress({ prefix: 'bchtest', type: 'p2pkhWithTokens', payload: alicePkh, throwErrors: true }).address;
