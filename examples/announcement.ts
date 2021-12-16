import { Contract, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import path from 'path';
import { stringify } from '@bitauth/libauth';

run();
export async function run(): Promise<void> {
  try {
    // Compile the Announcement contract to an artifact object
    const artifact = compileFile(path.join(__dirname, 'announcement.cash'));

    // Initialise a network provider for network operations on STAGING
    const provider = new ElectrumNetworkProvider('staging');

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
      .announce()
      .withOpReturn(['0x6d02', str])
      .withHardcodedFee(1000)
      .withMinChange(1000)
      .send();

    console.log('transaction details:', stringify(tx));
  } catch (e) {
    console.log(e);
  }
}
