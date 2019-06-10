import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import * as path from 'path';
import { Contract, Instance, Sig } from 'cashscript';

(async (): Promise<any> => {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);

  // Create bob and alice's key pairs
  const alice: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const bob: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

  // Derive their public keys
  const alicePk: Buffer = bitbox.ECPair.toPublicKey(alice);
  const bobPk: Buffer = bitbox.ECPair.toPublicKey(bob);

  // Compile the TransferWithTimeout Cash Contract
  const TransferWithTimeout: Contract = Contract.fromCashFile(
    path.join(__dirname, 'transfer_with_timeout.cash'), network,
  );

  // Instantiate a new TransferWithTimeout contract with constructor arguments:
  // { sender: alicePk, recipient: bobPk, timeout: 1000000 } // timeout in the past
  // timeout value can only be block number, not timestamp
  const instance: Instance = TransferWithTimeout.new(alicePk, bobPk, 1000000);

  // Get contract balance & output address + balance
  const contractBalance: number = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the transfer function with bob's signature
  // Allows bob to claim the money that alice sent him
  const transferTx: TxnDetailsResult = await instance.functions.transfer(new Sig(bob, 0x01))
    .send(instance.address, 10000);
  console.log('transfer transaction details:', transferTx);

  // Call the timeout function with alice's signature
  // Allows alice to reclaim the money she sent as the timeout is in the past
  const timeoutTx: TxnDetailsResult = await instance.functions.timeout(new Sig(alice, 0x01))
    .send(instance.address, 10000);
  console.log('timeout transaction details:', timeoutTx);
})();
