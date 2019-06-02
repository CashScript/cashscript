import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest'
import { ECPair, HDNode } from 'bitcoincashjs-lib'
import * as path from 'path';
import { Abi } from '../src/sdk/ABI'
import { compileFile, Contract, Sig } from '../src/sdk/cashscript-sdk';
import { Instance } from '../src/sdk/Contract'

(async (): Promise<any> => {
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);

  const alice: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const bob: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

  const alicePk: Buffer = bitbox.ECPair.toPublicKey(alice);
  const bobPk: Buffer = bitbox.ECPair.toPublicKey(bob);

  const abi: Abi = compileFile(path.join(__dirname, 'transfer_with_timeout.cash'));
  const TransferWithTimeout: Contract = new Contract(abi, network);

  // timeout value can only be block number, not timestamp
  const instance: Instance = TransferWithTimeout.new(alicePk, bobPk, 1000000);
  const contractBalance: number = await instance.getBalance();

  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  const transferTx: TxnDetailsResult = await instance.functions.transfer(new Sig(bob, 0x01))
    .send(instance.address, 10000);

  console.log('transfer transaction details:', transferTx);

  const timeoutTx: TxnDetailsResult = await instance.functions.timeout(new Sig(alice, 0x01))
    .send(instance.address, 10000);

  console.log('timeout transaction details:', timeoutTx);
})();
