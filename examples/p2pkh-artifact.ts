import { BITBOX } from 'bitbox-sdk';
import { Contract, SignatureTemplate } from 'cashscript';
import path from 'path';

run();
async function run(): Promise<void> {
  // Initialise BITBOX
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and alice's keypair
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Derive alice's public key and public key hash
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const alicePkh = bitbox.Crypto.hash160(alicePk);

  // Import the P2PKH Cash Contract from Artifact file, including deployed contract details
  const P2PKH = Contract.import(path.join(__dirname, 'p2pkh.json'), network);

  // Instantiate a new P2PKH contract with constructor arguments: { pkh: alicePkh }
  let instance = P2PKH.new(alicePkh);

  // Export the P2PKH Cash Contract's details again (just for demo purposes)
  P2PKH.export(path.join(__dirname, 'p2pkh.json'));

  // Retrieve the deployed contract details from Artifact
  instance = P2PKH.deployed();

  // Get contract balance & output address + balance
  const contractBalance = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the spend function with alice's pk + signature
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const tx = await instance.functions
    .spend(alicePk, new SignatureTemplate(alice))
    .to(instance.address, 10000)
    .send();
  console.log('transaction details:', tx);
}
