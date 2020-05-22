import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { Contract, Sig } from 'cashscript';
import path from 'path';

run();
async function run(): Promise<void> {
  // Initialise BITBOX ---- ATTENTION: Set to mainnet
  const network = 'mainnet';
  const bitbox = new BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

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

  // Get contract balance & output address + balance
  const contractBalance = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the spend function with alice's signature + pk
  // And use it to post to memo
  try {
    const tx2: TxnDetailsResult = await instance.functions
      .spend(alicePk, new Sig(alice))
      .withOpReturn([
        '0x534c5000', // Lokad ID
        '0x01', // Token type
        'GENESIS', // Action
        'CSS', // Symbol
        'CashScriptSLP', // Name
        'https://cashscript.org/', // Document URI
        '', // Document hash
        '0x08', // Decimals
        '0x02', // Minting baton vout
        '0x0000000000000001', // Initial quantity
      ])
      .to(instance.address, 546)
      .to(instance.address, 1000)
      .send();
    console.log('transaction details:', tx2);
  } catch (e) {
    console.log(e);
  }
}
