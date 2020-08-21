import { BITBOX } from 'bitbox-sdk';
import {
  Contract,
  SignatureTemplate,
  CashCompiler,
  ElectrumNetworkProvider,
  Network,
} from 'cashscript';
import path from 'path';
import { stringify } from '@bitauth/libauth';

run();
async function run(): Promise<void> {
  // Initialise BITBOX
  const bitbox = new BITBOX();

  // Initialise HD node and alice's keypair
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed);
  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Derive alice's public key and public key hash
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const alicePkh = bitbox.Crypto.hash160(alicePk);

  // Compile the P2PKH contract to an artifact object
  const artifact = CashCompiler.compileFile(path.join(__dirname, 'p2pkh.cash'));

  // Initialise a network provider for network operations on MAINNET
  const provider = new ElectrumNetworkProvider(Network.MAINNET);

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: alicePkh)
  const contract = new Contract(artifact, [alicePkh], provider);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Call the spend function with alice's signature + pk
  // And use it to create a new token.
  //    Output #0 - OP RETURN
  //    Output #1 - Mint 0.00000001 tokens
  //    Output #2 - The mint baton
  //    Output #3 - Change output (implicit)
  try {
    const tx = await contract.functions
      .spend(alicePk, new SignatureTemplate(alice))
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
      .to(contract.address, 546)
      .to(contract.address, 1000)
      .send();

    console.log('transaction details:', stringify(tx));
  } catch (e) {
    console.log(e);
  }
}
