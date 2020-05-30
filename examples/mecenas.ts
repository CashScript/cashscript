import { BITBOX } from 'bitbox-sdk';
import { Contract, SignatureTemplate } from 'cashscript';
import path from 'path';

run();
export async function run(): Promise<void> {
  // Initialise BITBOX
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);

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

  // Compile the Mecenas contract
  const Mecenas = Contract.compile(path.join(__dirname, 'mecenas.cash'), network);

  // Instantiate a new Mecenas contract with constructor arguments:
  // { recipient: alicePkh, funder: bobPkh, pledge: 10000 }
  // timeout value can only be block number, not timestamp
  const instance = Mecenas.new(alicePkh, bobPkh, 10000);

  // Get contract balance & output address + balance
  const contractBalance = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);
  console.log('contract opcount:', instance.opcount);
  console.log('contract bytesize:', instance.bytesize);

  // Call the transfer function with any signature
  // Will send one pledge amount to alice, and send change back to the contract
  // Manually set fee to 1000 because this is hardcoded in the contract
  const tx = await instance.functions
    .receive(alicePk, new SignatureTemplate(alice))
    .to(aliceAddress, 10000)
    .withHardcodedFee(1000)
    .send();

  console.log('transaction details:', tx);
}
