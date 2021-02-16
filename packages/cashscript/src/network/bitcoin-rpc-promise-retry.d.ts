/* eslint-disable */
declare module 'bitcoin-rpc-promise-retry';

interface ListUnspentItem {
  txid: string;
  vout: number;
  address: string;
  label: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  redeemScript: string;
  spendable: boolean;
  solvable: boolean;
  safe: boolean;
}

interface RpcClientRetry {
  constructor(url: string, opts?: object): void;
  listUnspent(minconf?: number, maxconf?: number, addresses?: string[], include_unsafe?: boolean, query_options?: object): Promise<ListUnspentItem[]>;
  getBlockCount(): Promise<number>;
  getRawTransaction(txid: string, verbose?: boolean, blockhash?: string): Promise<string>;
  sendRawTransaction(hexstring: string, allowhighfees?: boolean): Promise<string>;

  // below are not required for NetworkProvider interface, but very useful
  generate(nblocks: number, maxtries?: number): Promise<string[]>;
  generateToAddress(nblocks: number, address: string, maxtries?: number): Promise<string[]>;
  getNewAddress(label?: string): Promise<string>;
  dumpPrivKey(address: string): Promise<string>;
  getBalance(dummy?: string, minconf?: number, include_watchonly?: boolean): Promise<number>;
  getBlock(blockhash: string, verbosity?: number): Promise<string>;
  importAddress(address: string, label?: string, rescan?: boolean, p2sh?: boolean): Promise<void>;
}
