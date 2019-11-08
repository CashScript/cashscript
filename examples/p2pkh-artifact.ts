import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import { Contract, Instance, Sig } from 'cashscript';
import * as path from 'path';

run();
export async function run(): Promise<void> {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and alice's keypair
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const alice: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Derive alice's public key and public key hash
  const alicePk: Buffer = bitbox.ECPair.toPublicKey(alice);
  const alicePkh: Buffer = bitbox.Crypto.hash160(alicePk);

  // Import the P2PKH Cash Contract from Artifact file, including deployed contract details
  const P2PKH: Contract = Contract.import(path.join(__dirname, 'p2pkh.json'), network);

  // Instantiate a new P2PKH contract with constructor arguments: { pkh: alicePkh }
  let instance: Instance = P2PKH.new(alicePkh);

  // Export the P2PKH Cash Contract's details again (just for demo purposes)
  P2PKH.export(path.join(__dirname, 'p2pkh.json'));

  // Retrieve the deployed contract details from Artifact
  instance = P2PKH.deployed();

  // Get contract balance & output address + balance
  const contractBalance: number = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the spend function with alice's pk + signature
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const tx: TxnDetailsResult = await instance.functions.spend(alicePk, new Sig(alice))
    .send(instance.address, 10000);
  console.log('transaction details:', tx);
}
