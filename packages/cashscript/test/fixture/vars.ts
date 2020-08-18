import { BITBOX } from 'bitbox-sdk';
import { PriceOracle } from '../../../../examples/PriceOracle';
import { Network } from '../../src/interfaces';

export const network = Network.MAINNET;
export const bitbox = new BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

const rootSeed = bitbox.Mnemonic.toSeed('CashScript Tests');
const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);

export const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
export const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

export const oracle = new PriceOracle(bob);

export const alicePk = bitbox.ECPair.toPublicKey(alice);
export const bobPk = bitbox.ECPair.toPublicKey(bob);
export const oraclePk = bitbox.ECPair.toPublicKey(oracle.keypair);

export const alicePkh = bitbox.Crypto.hash160(alicePk);
export const bobPkh = bitbox.Crypto.hash160(bobPk);

export const aliceAddress = bitbox.ECPair.toCashAddress(alice);
export const bobAddress = bitbox.ECPair.toCashAddress(bob);
