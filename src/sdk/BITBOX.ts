import {
  BITBOX,
  Script,
  Crypto,
  Address,
} from 'bitbox-sdk';

export const NETWORKS: { [index: string]: string } = {
  mainnet: 'https://rest.bitcoin.com/v2/',
  testnet: 'https://trest.bitcoin.com/v2/',
};

export const bitbox: { [index: string]: BITBOX } = {
  mainnet: new BITBOX({ restURL: NETWORKS.mainnet }),
  testnet: new BITBOX({ restURL: NETWORKS.testnet }),
};

export const ScriptUtil = new Script();
export const CryptoUtil = new Crypto();
export const AddressUtil = new Address();
