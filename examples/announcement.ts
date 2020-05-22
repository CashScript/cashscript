import { BITBOX } from 'bitbox-sdk';
import { Contract, Sig } from 'cashscript';
import path from 'path';

run();
export async function run(): Promise<void> {
  try {
    // Initialise BITBOX ---- ATTENTION: Set to mainnet
    const network = 'mainnet';
    const bitbox = new BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

    // Initialise HD node and alice's keypair
    const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
    const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
    const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

    // Derive alice's public key
    const alicePk = bitbox.ECPair.toPublicKey(alice);

    // Compile the Announcement contract
    const Announcement = Contract.compile(path.join(__dirname, 'announcement.cash'), network);

    // Instantiate a new Announcement contract
    const instance = Announcement.new();

    // Get contract balance & output address + balance
    const contractBalance = await instance.getBalance();
    console.log('contract address:', instance.address);
    console.log('contract balance:', contractBalance);
    console.log('contract opcount:', instance.opcount);
    console.log('contract bytesize:', instance.bytesize);

    // Send the announcement. Trying to send any other announcement will fail because
    // the contract's covenant logic. Uses a hardcoded fee and minChange so that
    // change is only sent back to the contract if there's enough leftover
    // for another announcement.
    const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
    const tx = await instance.functions
      .announce(alicePk, new Sig(alice))
      .withOpReturn(['0x6d02', str])
      .withHardcodedFee(1000)
      .withMinChange(1000)
      .send();
    console.log('transaction details:', tx);
  } catch (e) {
    console.log(e);
  }
}
