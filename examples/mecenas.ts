import { stringify } from '@bitauth/libauth';
import { Contract, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import { URL } from 'url';

// Import Alice and Bob's pkh and Alice's address from common.ts
import { aliceAddress, alicePkh, bobPkh } from './common.js';

// Compile the Mecenas contract to an artifact object
const artifact = compileFile(new URL('mecenas.cash', import.meta.url));

// Initialise a network provider for network operations on CHIPNET
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters:
// (recipient: alicePkh, funder: bobPkh, pledge: 10000)
const contract = new Contract(artifact, [alicePkh, bobPkh, 10000n], { provider });

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
console.log('contract balance:', await contract.getBalance());
console.log('contract opcount:', contract.opcount);
console.log('contract bytesize:', contract.bytesize);

// Call the transfer function with any signature
// Will send one pledge amount to alice, and send change back to the contract
// Manually set fee to 1000 because this is hardcoded in the contract
const tx = await contract.functions
  .receive()
  .to(aliceAddress, 10000n)
  .withHardcodedFee(1000n)
  .send();

console.log('transaction details:', stringify(tx));
