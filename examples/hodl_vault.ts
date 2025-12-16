import { stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, TransactionBuilder, Output, MockNetworkProvider, randomUtxo } from 'cashscript';
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

// Once you're ready to send transactions on a real network (like chipnet or mainnet), use the ElectrumNetworkProvider
// const provider = new ElectrumNetworkProvider();
const provider = new MockNetworkProvider();

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters
const parameters = [alicePub, oraclePub, 100000n, 30000n];
const contract = new Contract(artifact, parameters, { provider });

// Add a mock UTXO to the mock network provider
provider.addUtxo(contract.address, randomUtxo());

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
const contractUtxos = await contract.getUtxos();
console.log('contract utxos:', contractUtxos);
console.log('contract balance:', await contract.getBalance());

const currentBlockHeight = await provider.getBlockHeight();
console.log('current block height:', currentBlockHeight);

// Select a contract UTXO to spend from
const contractInputUtxo = contractUtxos.find(utxo => utxo.satoshis > 10_000n);
if (!contractInputUtxo) throw new Error('No contract UTXO with enough satoshis found');
const inputAmount = contractInputUtxo.satoshis;

// Produce new oracle message and signature
const oracleMessage = oracle.createMessage(100000n, 30000n);
const oracleSignature = oracle.signMessage(oracleMessage);

// construct an output
const outputAmount = 1000n;
const output: Output = { amount: outputAmount, to: contract.address };

// Construct a changeOutput
const minerFee = 1000n;
const changeAmount = inputAmount - outputAmount - minerFee;
const changeOutput: Output = {
  amount: changeAmount,
  to: contract.address,
};

const aliceTemplate = new SignatureTemplate(alicePriv);

// Spend from the vault
const transactionBuilder = new TransactionBuilder({ provider });

transactionBuilder.setLocktime(currentBlockHeight);
transactionBuilder.addInput(contractInputUtxo, contract.unlock.spend(aliceTemplate, oracleSignature, oracleMessage));
transactionBuilder.addOutput(output);
if (changeAmount > 1000n) transactionBuilder.addOutput(changeOutput);

const tx = await transactionBuilder.send();

console.log(stringify(tx));
