import { stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import { URL } from 'url';

// Import keys and price oracle from common.ts
import {
  alicePriv,
  alicePub,
  oracle,
  oraclePub,
} from './common.js';

// Compile the HodlVault contract to an artifact object
const artifact = compileFile(new URL('hodl_vault.cash', import.meta.url));

// Initialise a network provider for network operations on TESTNET4
const provider = new ElectrumNetworkProvider('testnet4');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters
const parameters = [alicePub, oraclePub, 100000n, 30000n];
const contract = new Contract(artifact, parameters, provider);

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
console.log('contract balance:', await contract.getBalance());

// Produce new oracle message and signature
const oracleMessage = oracle.createMessage(100000n, 30000n);
const oracleSignature = oracle.signMessage(oracleMessage);

// Spend from the vault
const tx = await contract.functions
  .spend(new SignatureTemplate(alicePriv), oracleSignature, oracleMessage)
  .to(contract.address, 1000n)
  .send();

console.log(stringify(tx));
