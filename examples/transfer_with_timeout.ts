import { stringify } from '@bitauth/libauth';
import { BITBOX } from 'bitbox-sdk';
import {
  Contract,
  SignatureTemplate,
  CashCompiler,
  ElectrumNetworkProvider,
  Network,
} from 'cashscript';
import path from 'path';

run();
async function run(): Promise<void> {
  // Initialise BITBOX
  const bitbox = new BITBOX();

  // Initialise HD node
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed);

  // Create bob and alice's key pairs
  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

  // Derive their public keys
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const bobPk = bitbox.ECPair.toPublicKey(bob);

  // Compile the TransferWithTimeout contract
  const artifact = CashCompiler.compileFile(path.join(__dirname, 'transfer_with_timeout.cash'));

  // Initialise a network provider for network operations on TESTNET
  const provider = new ElectrumNetworkProvider(Network.TESTNET);

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters:
  // { sender: alicePk, recipient: bobPk, timeout: 1000000 } - timeout is a past block
  const contract = new Contract(artifact, [alicePk, bobPk, 1000000], provider);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Call the transfer function with bob's signature
  // Allows bob to claim the money that alice sent him
  const transferTx = await contract.functions
    .transfer(new SignatureTemplate(bob))
    .to(contract.address, 10000)
    .send();

  console.log('transfer transaction details:', stringify(transferTx));

  // Call the timeout function with alice's signature
  // Allows alice to reclaim the money she sent as the timeout is in the past
  const timeoutTx = await contract.functions
    .timeout(new SignatureTemplate(alice))
    .to(contract.address, 10000)
    .send();

  console.log('timeout transaction details:', stringify(timeoutTx));
}
