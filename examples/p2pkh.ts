import { stringify } from '@bitauth/libauth';
import { compileFile } from 'cashc';
import { ElectrumNetworkProvider, SignatureTemplate, Contract } from 'cashscript';
import { URL } from 'url';

// Import Alice's keys from common.ts
import { alicePkh, alicePriv, alicePub } from './common.js';

// Compile the P2PKH contract to an artifact object
const artifact = compileFile(new URL('p2pkh.cash', import.meta.url));

// Initialise a network provider for network operations on TESTNET$
const provider = new ElectrumNetworkProvider('testnet4');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters (pkh: alicePkh)
const contract = new Contract(artifact, [alicePkh], provider);

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
console.log('contract balance:', await contract.getBalance());

// Call the spend() function with alice's signature + pk
// And use it to send 0. 000 100 00 BCH back to the contract's address
const tx = await contract.functions
  .spend(alicePub, new SignatureTemplate(alicePriv))
  .to(contract.address, 10000n)
  .send();

console.log('transaction details:', stringify(tx));

// Call the spend() function with alice's signature + pk
// And use it to send two outputs of 0. 000 150 00 BCH back to the contract's address
const tx2 = await contract.functions
  .spend(alicePub, new SignatureTemplate(alicePriv))
  .to(contract.address, 15000n)
  .to(contract.address, 15000n)
  .send();

console.log('transaction details:', stringify(tx2));
