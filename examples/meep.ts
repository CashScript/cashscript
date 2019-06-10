import { BITBOX } from 'bitbox-sdk';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import * as path from 'path';
import { Contract, Instance, Sig } from 'cashscript';

(async () => {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and owner's keypair
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair: ECPair = bitbox.HDNode.toKeyPair(hdNode);

  // Derive the owner's public key and public key hash
  const pk: Buffer = bitbox.ECPair.toPublicKey(keypair);
  const pkh: Buffer = bitbox.Crypto.hash160(pk);

  // Compile the P2PKH Cash Contract
  const P2PKH: Contract = Contract.fromCashFile(path.join(__dirname, 'p2pkh.cash'), network);

  // Instantiate a new P2PKH contract with constructor arguments: { pkh: pkh }
  const instance: Instance = P2PKH.new(pkh);

  // Call .meep instead of .send, which prints the meep command that can be
  // executed to debug the transaction
  await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .meep(instance.address, 10000);
})();
