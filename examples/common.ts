import { hash160 } from '@cashscript/utils';
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPath,
  secp256k1,
  encodeCashAddress,
} from '@bitauth/libauth';
import bip39 from 'bip39';
import { PriceOracle } from './PriceOracle.js';

// Generate entropy from BIP39 mnemonic phrase and initialise a root HD-wallet node
const seed = await bip39.mnemonicToSeed('CashScript Examples');
const rootNode = deriveHdPrivateNodeFromSeed(seed, true);
const baseDerivationPath = "m/44'/145'/0'/0";

// Derive Alice's private key, public key, public key hash and address
const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);
if (typeof aliceNode === 'string') throw new Error();
export const alicePub = secp256k1.derivePublicKeyCompressed(aliceNode.privateKey) as Uint8Array;
export const alicePriv = aliceNode.privateKey;
export const alicePkh = hash160(alicePub);
export const aliceAddress = encodeCashAddress('bchtest', 'p2pkhWithTokens', alicePkh);

// Derive Bob's private key, public key, public key hash and address
const bobNode = deriveHdPath(rootNode, `${baseDerivationPath}/1`);
if (typeof bobNode === 'string') throw new Error();
export const bobPub = secp256k1.derivePublicKeyCompressed(bobNode.privateKey) as Uint8Array;
export const bobPriv = bobNode.privateKey;
export const bobPkh = hash160(bobPub);
export const bobAddress = encodeCashAddress('bchtest', 'p2pkhWithTokens', bobPkh);

// Initialise a price oracle with a private key
const oracleNode = deriveHdPath(rootNode, `${baseDerivationPath}/2`);
if (typeof oracleNode === 'string') throw new Error();
export const oraclePub = secp256k1.derivePublicKeyCompressed(oracleNode.privateKey) as Uint8Array;
export const oraclePriv = oracleNode.privateKey;
export const oracle = new PriceOracle(oracleNode.privateKey);
export const oraclePkh = hash160(oraclePub);
export const oracleAddress = encodeCashAddress('bchtest', 'p2pkhWithTokens', oraclePkh);
