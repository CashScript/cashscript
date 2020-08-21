import { stringify } from '@bitauth/libauth';
import { BITBOX } from 'bitbox-sdk';
import {
  Contract,
  SignatureTemplate,
  CashCompiler,
  Network,
  ElectrumNetworkProvider,
} from 'cashscript';
import path from 'path';

run();
export async function run(): Promise<void> {
  // Initialise BITBOX
  const bitbox = new BITBOX();

  // Initialise HD node
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed);

  // Create bob and alice's key pairs
  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

  // Derive their public key (hash)
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const bobPk = bitbox.ECPair.toPublicKey(bob);
  const alicePkh = bitbox.Crypto.hash160(alicePk);
  const bobPkh = bitbox.Crypto.hash160(bobPk);

  // Derive alice's address
  const aliceAddress = bitbox.ECPair.toCashAddress(alice);

  // Compile the Mecenas contract to an artifact object
  const artifact = CashCompiler.compileFile(path.join(__dirname, 'mecenas.cash'));

  // Initialise a network provider for network operations on TESTNET
  const provider = new ElectrumNetworkProvider(Network.TESTNET);

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters:
  // (recipient: alicePkh, funder: bobPkh, pledge: 10000)
  const contract = new Contract(artifact, [alicePkh, bobPkh, 10000], provider);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());
  console.log('contract opcount:', contract.opcount);
  console.log('contract bytesize:', contract.bytesize);

  // Call the transfer function with any signature
  // Will send one pledge amount to alice, and send change back to the contract
  // Manually set fee to 1000 because this is hardcoded in the contract
  const tx = await contract.functions
    .receive(alicePk, new SignatureTemplate(alice))
    .to(aliceAddress, 10000)
    .withHardcodedFee(1000)
    .send();

  console.log('transaction details:', stringify(tx));
}
