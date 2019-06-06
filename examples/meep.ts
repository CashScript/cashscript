import { BITBOX } from 'bitbox-sdk';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import * as path from 'path';
import { compileFile, Contract, Sig } from '..';

(async () => {
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair: ECPair = bitbox.HDNode.toKeyPair(hdNode);

  const pk: Buffer = bitbox.ECPair.toPublicKey(keypair);
  const pkh: Buffer = bitbox.Crypto.hash160(pk);

  const abi = compileFile(path.join(__dirname, 'p2pkh.cash'));
  const P2PKH = new Contract(abi, network);
  const instance = P2PKH.new(pkh);

  console.log('debug transaction:');
  await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .meep(instance.address, 10000);
})();
