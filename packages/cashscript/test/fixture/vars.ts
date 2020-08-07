import { BITBOX } from 'bitbox-sdk';
import { HDNode, ECPair } from 'bitcoincashjs-lib';
import { PriceOracle } from '../../../../examples/PriceOracle';
import { Network } from '../../src/interfaces';

export const network: Network = Network.MAINNET;
export const bitbox: BITBOX = new BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript Tests');
const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);

export const alice: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
export const bob: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

export const oracle: PriceOracle = new PriceOracle(bob);

export const alicePk: Buffer = bitbox.ECPair.toPublicKey(alice);
export const bobPk: Buffer = bitbox.ECPair.toPublicKey(bob);
export const oraclePk: Buffer = bitbox.ECPair.toPublicKey(oracle.keypair);

export const alicePkh: Buffer = bitbox.Crypto.hash160(alicePk);
export const bobPkh: Buffer = bitbox.Crypto.hash160(bobPk);

export const aliceAddress: string = bitbox.ECPair.toCashAddress(alice);
export const bobAddress: string = bitbox.ECPair.toCashAddress(bob);
