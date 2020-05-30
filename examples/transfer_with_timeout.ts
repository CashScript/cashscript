import { BITBOX } from 'bitbox-sdk';
import { Contract, SignatureTemplate } from 'cashscript';
import path from 'path';

run();
async function run(): Promise<void> {
  // Initialise BITBOX
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);

  // Create bob and alice's key pairs
  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

  // Derive their public keys
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const bobPk = bitbox.ECPair.toPublicKey(bob);

  // Compile the TransferWithTimeout Cash Contract
  const TransferWithTimeout = Contract.compile(
    path.join(__dirname, 'transfer_with_timeout.cash'), network,
  );

  // Instantiate a new TransferWithTimeout contract with constructor arguments:
  // { sender: alicePk, recipient: bobPk, timeout: 1000000 } // timeout in the past
  // timeout value can only be block number, not timestamp
  const instance = TransferWithTimeout.new(alicePk, bobPk, 1000000);

  // Get contract balance & output address + balance
  const contractBalance = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the transfer function with bob's signature
  // Allows bob to claim the money that alice sent him
  const transferTx = await instance.functions
    .transfer(new SignatureTemplate(bob))
    .to(instance.address, 10000)
    .send();
  console.log('transfer transaction details:', transferTx);

  // Call the timeout function with alice's signature
  // Allows alice to reclaim the money she sent as the timeout is in the past
  const timeoutTx = await instance.functions
    .timeout(new SignatureTemplate(alice))
    .to(instance.address, 10000)
    .send();
  console.log('timeout transaction details:', timeoutTx);
}
