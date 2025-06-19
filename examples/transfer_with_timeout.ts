import { stringify } from '@bitauth/libauth';
import { compileFile } from 'cashc';
import { Contract, ElectrumNetworkProvider, Output, SignatureTemplate, TransactionBuilder } from 'cashscript';
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

// Initialise a network provider for network operations on CHIPNET
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters:
// { sender: alicePk, recipient: bobPk, timeout: 1000000 } - timeout is a past block
const contract = new Contract(artifact, [alicePub, bobPub, 100000n], { provider });

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
const contractUtxos = await contract.getUtxos();
console.log('contract utxos:', contractUtxos);
console.log('contract balance:', await contract.getBalance());

// Select a contract UTXO to spend from
const contractInputUtxo = contractUtxos.find(utxo => utxo.satoshis > 5_000n);
if (!contractInputUtxo) throw new Error('No contract UTXO with enough satoshis found');
const inputAmount = contractInputUtxo.satoshis;

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

// Call the contract's transfer unlock-function with bob's signature
// Allows bob to claim the money that alice sent him
const transactionBuilder = new TransactionBuilder({ provider });

transactionBuilder.addInput(contractInputUtxo, contract.unlock.transfer(new SignatureTemplate(bobPriv)));
transactionBuilder.addOutput(output);
if (changeAmount > 1000n) transactionBuilder.addOutput(changeOutput);

const transferTx = await transactionBuilder.send();

console.log('transfer transaction details:', stringify(transferTx));

// Select a 2nd contract UTXO to spend from
const updateContractUtxos = await contract.getUtxos();
const contractInputUtxo2 = updateContractUtxos.find(utxo => utxo.satoshis > 5_000n);
if (!contractInputUtxo2) throw new Error('No contract UTXO with enough satoshis found');
const inputAmount2 = contractInputUtxo2.satoshis;

const changeAmount2 = inputAmount2 - outputAmount - minerFee;
const changeOutput2: Output = {
  amount: changeAmount2,
  to: contract.address,
};

const currentBlockHeight = await provider.getBlockHeight();
console.log('current block height:', currentBlockHeight);

// Call the contract's timeout unlock-function with alice's signature
// Allows alice to reclaim the money she sent as the timeout is in the past
const transactionBuilder2 = new TransactionBuilder({ provider });

transactionBuilder2.setLocktime(currentBlockHeight);
transactionBuilder2.addInput(contractInputUtxo2, contract.unlock.timeout(new SignatureTemplate(alicePriv)));
transactionBuilder2.addOutput(output);
if (changeAmount2 > 1000n) transactionBuilder2.addOutput(changeOutput2);

const timeoutTx = await transactionBuilder2.send();

console.log('timeout transaction details:', stringify(timeoutTx));
