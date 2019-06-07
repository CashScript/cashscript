const { BITBOX } = require('bitbox-sdk');
const path = require('path');
const { Contract, Sig } = require('..');

(async () => {
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const keypair = bitbox.HDNode.toKeyPair(hdNode);

  const pk = bitbox.ECPair.toPublicKey(keypair);
  const pkh = bitbox.Crypto.hash160(pk);

  const P2PKH = Contract.fromCashFile(path.join(__dirname, 'p2pkh.cash'), network);
  const instance = P2PKH.new(pkh);
  const contractBalance = await instance.getBalance();

  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Send to one output
  const tx = await instance.functions.spend(pk, new Sig(keypair, 0x01))
    .send(instance.address, 10000);

  console.log('transaction details:', tx);

  // Send to multiple outputs
  const tx2 = await instance.functions.spend(pk, new Sig(keypair, 0x01)).send([
    { to: instance.address, amount: 10000 },
    { to: instance.address, amount: 20000 },
  ]);

  console.log('transaction details:', tx2);
})();
