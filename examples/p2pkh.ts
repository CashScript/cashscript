import { stringify } from '@bitauth/libauth';
import { compileFile } from 'cashc';
import { ElectrumNetworkProvider, SignatureTemplate, Contract, TransactionBuilder, Output } from 'cashscript';
import { URL } from 'url';

// Import Alice's keys from common.ts
import { alicePkh, alicePriv, aliceAddress, alicePub } from './common.js';

// Compile the P2PKH contract to an artifact object
const artifact = compileFile(new URL('p2pkh.cash', import.meta.url));

// Initialise a network provider for network operations on CHIPNET
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters (pkh: alicePkh)
const contract = new Contract(artifact, [alicePkh], { provider });

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
const contractUtxos = await contract.getUtxos();
console.log('contract utxos:', contractUtxos);
console.log('contract balance:', await contract.getBalance());

// Select a contract UTXO to spend from
const contractInputUtxo = contractUtxos.find(utxo => utxo.satoshis > 12_000n);
if (!contractInputUtxo) throw new Error('No contract UTXO with enough satoshis found');
const inputAmount = contractInputUtxo.satoshis;

// construct an output
const outputAmount = 10_000n;
const output: Output = { amount: outputAmount, to: aliceAddress };

// Construct a changeOutput
const minerFee = 1000n;
const changeAmount = inputAmount - outputAmount - minerFee;
const changeOutput: Output = {
  amount: changeAmount,
  to: contract.address,
};

const aliceTemplate = new SignatureTemplate(alicePriv);

// Call the spend() function with alice's signature + pk
// And use it to send 0. 000 100 00 BCH to aliceAddress and the remainder
// back to the contract's address
const transactionBuilder = new TransactionBuilder({ provider });

transactionBuilder.addInput(contractInputUtxo, contract.unlock.spend(alicePub, aliceTemplate));
transactionBuilder.addOutput(output);
if (changeAmount > 1000n) transactionBuilder.addOutput(changeOutput);

const tx = await transactionBuilder.send();

console.log('transaction details:', stringify(tx));
