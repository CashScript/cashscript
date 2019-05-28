import { BITBOX } from 'bitbox-sdk';
import * as path from 'path';
import { compileFile, Contract, Sig } from '../src/sdk/cashscript-sdk';

(async () => {
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair = bitbox.HDNode.toKeyPair(hdNode);

  const pk = bitbox.ECPair.toPublicKey(keypair);
  const pkh = bitbox.Crypto.hash160(pk);

  const abi = compileFile(path.join(__dirname, 'p2pkh.cash'));
  const P2PKH = new Contract(abi, network);
  const instance = P2PKH.new(pkh);
  const contractBalance = await instance.getBalance();

  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  const tx = await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .send(instance.address, 10000);

  console.log('transaction details:', tx);
})();
