import { BITBOX } from 'bitbox-sdk';
import { Contract, Sig } from 'cashscript';
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

  // Compile the P2PKH Cash Contract
  const P2PKH = Contract.compile(path.join(__dirname, 'p2pkh.cash'), network);

  // Instantiate a new P2PKH contract with constructor arguments: { pkh: alicePkh }
  const instance = P2PKH.new(alicePkh);

  // Call .meep instead of .send, which prints the meep command that can be
  // executed to debug the transaction
  const meepStr = await instance.functions
    .spend(alicePk, new Sig(alice))
    .to(instance.address, 10000)
    .meep();
  console.log(meepStr);
}
