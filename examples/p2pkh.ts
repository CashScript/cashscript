import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from "bitcoin-com-rest"
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import * as path from 'path';
import { Abi } from "../src/sdk/ABI"
import { compileFile, Contract, Sig } from '../src/sdk/cashscript-sdk';
import { Instance } from "../src/sdk/Contract"

(async (): Promise<any> => {
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair: ECPair = bitbox.HDNode.toKeyPair(hdNode);

  const pk: Buffer = bitbox.ECPair.toPublicKey(keypair);
  const pkh: Buffer = bitbox.Crypto.hash160(pk);

  const abi: Abi = compileFile(path.join(__dirname, 'p2pkh.cash'));
  const P2PKH: Contract = new Contract(abi, network);
  const instance: Instance = P2PKH.new(pkh);
  const contractBalance: number = await instance.getBalance();

  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  const tx: TxnDetailsResult = await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .send(instance.address, 10000);

  console.log('transaction details:', tx);
})();
