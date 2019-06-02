import {
  BITBOX,
  Script,
  Crypto,
  Address,
  BitcoinCash,
} from 'bitbox-sdk';

export const NETWORKS: { [index: string]: string } = {
  // mainnet: 'https://rest.bitcoin.com/v2/',
  testnet: 'https://trest.bitcoin.com/v2/',
};

export const bitbox: { [index: string]: BITBOX } = {
  mainnet: new BITBOX({ restURL: NETWORKS.mainnet }),
  testnet: new BITBOX({ restURL: NETWORKS.testnet }),
  bchtest: new BITBOX({ restURL: NETWORKS.bchtest }),
};

export const ScriptUtil: Script = new Script();
export const CryptoUtil: Crypto = new Crypto();
export const AddressUtil: Address = new Address();
export const BitcoinCashUtil: BitcoinCash = new BitcoinCash();
