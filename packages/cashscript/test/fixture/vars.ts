import {
  deriveHdPath,
  deriveHdPrivateNodeFromSeed,
  encodeCashAddress,
  secp256k1,
} from '@bitauth/libauth';
import { hash160 } from '@cashscript/utils';
import bip39 from 'bip39';
import { PriceOracle } from './PriceOracle.js';
import { Network } from '../../src/interfaces.js';

export const network = Network.CHIPNET;

const seed = await bip39.mnemonicToSeed('CashScript Tests');

const rootNode = deriveHdPrivateNodeFromSeed(seed, true);
const baseDerivationPath = "m/44'/145'/0'/0";

const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);
const bobNode = deriveHdPath(rootNode, `${baseDerivationPath}/1`);
const carolNode = deriveHdPath(rootNode, `${baseDerivationPath}/2`);
if (typeof aliceNode === 'string') throw new Error();
if (typeof bobNode === 'string') throw new Error();
if (typeof carolNode === 'string') throw new Error();

export const alicePriv = aliceNode.privateKey;
export const alicePub = secp256k1.derivePublicKeyCompressed(alicePriv) as Uint8Array;
export const alicePkh = hash160(alicePub);
export const aliceAddress = encodeCashAddress('bchtest', 'p2pkh', alicePkh);

export const bobPriv = bobNode.privateKey;
export const bobPub = secp256k1.derivePublicKeyCompressed(bobPriv) as Uint8Array;
export const bobPkh = hash160(bobPub);
export const bobAddress = encodeCashAddress('bchtest', 'p2pkh', bobPkh);

export const carolPriv = carolNode.privateKey;
export const carolPub = secp256k1.derivePublicKeyCompressed(carolPriv) as Uint8Array;
export const carolPkh = hash160(carolPub);
export const carolAddress = encodeCashAddress('bchtest', 'p2pkh', carolPkh);

export const oracle = new PriceOracle(bobPriv);
export const oraclePub = bobPub;

console.log(aliceAddress, bobAddress, carolAddress);
