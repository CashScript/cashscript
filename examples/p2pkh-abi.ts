import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import * as path from 'path';
import { Contract, Instance, Sig } from '..';

(async (): Promise<any> => {
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair: ECPair = bitbox.HDNode.toKeyPair(hdNode);
  const pk: Buffer = bitbox.ECPair.toPublicKey(keypair);

  // Import / export ABI from file, including deployed contract details
  const P2PKH: Contract = Contract.fromAbiFile(path.join(__dirname, 'p2pkh.json'), network);
  P2PKH.export(path.join(__dirname, 'p2pkh.json'));

  // Retrieve deployed contract details from ABI
  const instance: Instance = P2PKH.deployed();
  const contractBalance: number = await instance.getBalance();

  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  const tx: TxnDetailsResult = await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .send(instance.address, 10000);

  console.log('transaction details:', tx);
})();
