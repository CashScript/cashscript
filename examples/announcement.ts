import { BITBOX } from 'bitbox-sdk';
import {
  Contract,
  SignatureTemplate,
  CashCompiler,
  Network,
  ElectrumNetworkProvider,
} from 'cashscript';
import path from 'path';
import { stringify } from '@bitauth/libauth';

run();
export async function run(): Promise<void> {
  try {
    // Initialise BITBOX ---- ATTENTION: Set to mainnet
    const bitbox = new BITBOX();

    // Initialise HD node and alice's keypair
    const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
    const hdNode = bitbox.HDNode.fromSeed(rootSeed);
    const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

    // Derive alice's public key
    const alicePk = bitbox.ECPair.toPublicKey(alice);

    // Compile the Announcement contract to an artifact object
    const artifact = CashCompiler.compileFile(path.join(__dirname, 'announcement.cash'));

    // Initialise a network provider for network operations on MAINNET
    const provider = new ElectrumNetworkProvider(Network.MAINNET);

    // Instantiate a new contract using the compiled artifact and network provider
    // AND providing the constructor parameters (none)
    const contract = new Contract(artifact, [], provider);

    // Get contract balance & output address + balance
    console.log('contract address:', contract.address);
    console.log('contract balance:', await contract.getBalance());
    console.log('contract opcount:', contract.opcount);
    console.log('contract bytesize:', contract.bytesize);

    // Send the announcement. Trying to send any other announcement will fail because
    // the contract's covenant logic. Uses a hardcoded fee and minChange so that
    // change is only sent back to the contract if there's enough leftover
    // for another announcement.
    const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
    const tx = await contract.functions
      .announce(alicePk, new SignatureTemplate(alice))
      .withOpReturn(['0x6d02', str])
      .withHardcodedFee(2000)
      .withMinChange(1000)
      .send();

    console.log('transaction details:', stringify(tx));
  } catch (e) {
    console.log(e);
  }
}
