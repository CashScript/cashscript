import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import * as path from 'path';
import { Contract, Instance, Sig } from 'cashscript';

(async (): Promise<any> => {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and owner's keypair
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair: ECPair = bitbox.HDNode.toKeyPair(hdNode);

  // Derive the owner's public key
  const pk: Buffer = bitbox.ECPair.toPublicKey(keypair);

  // Import the P2PKH Cash Contract from Artifact file, including deployed contract details
  const P2PKH: Contract = Contract.fromArtifact(path.join(__dirname, 'p2pkh.json'), network);

  // Export the P2PKH Cash Contract's details again (just for demo purposes)
  P2PKH.export(path.join(__dirname, 'p2pkh.json'));

  // Retrieve the deployed contract details from Artifact
  const instance: Instance = P2PKH.deployed();

  // Get contract balance & output address + balance
  const contractBalance: number = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the spend function with the owner's signature
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const tx: TxnDetailsResult = await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .send(instance.address, 10000);
  console.log('transaction details:', tx);
})();
