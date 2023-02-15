import { stringify } from '@bitauth/libauth';
import { compileFile } from 'cashc';
import { Contract, ElectrumNetworkProvider, SignatureTemplate } from 'cashscript';
import { URL } from 'url';

// Import Bob and Alice's keys from common.ts
import {
  alicePriv,
  alicePub,
  bobPriv,
  bobPub,
} from './common.js';

// Compile the TransferWithTimeout contract
const artifact = compileFile(new URL('transfer_with_timeout.cash', import.meta.url));

// Initialise a network provider for network operations on TESTNET4
const provider = new ElectrumNetworkProvider('testnet4');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters:
// { sender: alicePk, recipient: bobPk, timeout: 1000000 } - timeout is a past block
const contract = new Contract(artifact, [alicePub, bobPub, 100000n], provider);

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
console.log('contract balance:', await contract.getBalance());

// Call the transfer function with bob's signature
// Allows bob to claim the money that alice sent him
const transferTx = await contract.functions
  .transfer(new SignatureTemplate(bobPriv))
  .to(contract.address, 10000n)
  .send();

console.log('transfer transaction details:', stringify(transferTx));

// Call the timeout function with alice's signature
// Allows alice to reclaim the money she sent as the timeout is in the past
const timeoutTx = await contract.functions
  .timeout(new SignatureTemplate(alicePriv))
  .to(contract.address, 10000n)
  .send();

console.log('timeout transaction details:', stringify(timeoutTx));
