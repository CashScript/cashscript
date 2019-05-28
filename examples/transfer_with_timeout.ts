import { BITBOX } from 'bitbox-sdk';
import * as path from 'path';
import { compileFile, Contract, Sig } from '../src/sdk/cashscript-sdk';

(async () => {
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);

  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const bobPk = bitbox.ECPair.toPublicKey(bob);

  const abi = compileFile(path.join(__dirname, 'transfer_with_timeout.cash'));
  const TransferWithTimeout = new Contract(abi, network);

  // timeout value can only be block number, not timestamp
  const instance = TransferWithTimeout.new(alicePk, bobPk, 1000000);
  const contractBalance = await instance.getBalance();

  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  const transferTx = await instance.functions.transfer(new Sig(bob, 0x01))
    .send(instance.address, 10000);

  console.log('transfer transaction details:', transferTx);

  const timeoutTx = await instance.functions.timeout(new Sig(alice, 0x01))
    .send(instance.address, 10000);

  console.log('timeout transaction details:', timeoutTx);
})();
