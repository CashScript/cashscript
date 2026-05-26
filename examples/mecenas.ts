import { stringify } from '@bitauth/libauth';
import { Contract, MockNetworkProvider, Output, randomUtxo, TransactionBuilder } from 'cashscript';
import { compileFile } from 'cashc';
import { URL } from 'url';

// Import Alice and Bob's pkh and Alice's address from common.ts
import { aliceAddress, alicePkh, bobPkh } from './common.js';

// Compile the Mecenas contract to an artifact object
const artifact = compileFile(new URL('mecenas.cash', import.meta.url));

// Once you're ready to send transactions on a real network (like chipnet or mainnet), use the ElectrumNetworkProvider
// const provider = new ElectrumNetworkProvider();
const provider = new MockNetworkProvider();

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters:
// (recipient: alicePkh, funder: bobPkh, pledge: 10000)
const pledgeAmount = 10_000n;
const contract = new Contract(artifact, [alicePkh, bobPkh, pledgeAmount], { provider });

// Add a mock UTXO to the mock network provider
provider.addUtxo(contract.address, randomUtxo());

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
const contractUtxos = await contract.getUtxos();
console.log('contract utxos:', contractUtxos);
console.log('contract balance:', await contract.getBalance());
console.log('contract opcount:', contract.opcount);
console.log('contract bytesize:', contract.bytesize);

// Select a contract UTXO to spend from
const contractInputUtxo = contractUtxos.find(utxo => utxo.satoshis > 10_000n);
if (!contractInputUtxo) throw new Error('No contract UTXO with enough satoshis found');
const inputAmount = contractInputUtxo.satoshis;

const receiverOutput: Output = {
  amount: 10_000n,
  to: aliceAddress,
};

// Construct the changeOutput
const minerFee = 1000n;
const changeAmount = inputAmount - pledgeAmount - minerFee;
const contractChangeOutput: Output = {
  amount: changeAmount,
  to: contract.address,
};

// Call the transfer function with any signature
// Will send one pledge amount to alice, and send change back to the contract
// Manually set fee to 1000 because this is hardcoded in the contract
const transactionBuilder = new TransactionBuilder({ provider });

transactionBuilder.addInput(contractInputUtxo, contract.unlock.receive());
transactionBuilder.addOutput(receiverOutput);
if (changeAmount > pledgeAmount + minerFee) transactionBuilder.addOutput(contractChangeOutput);

const tx = await transactionBuilder.send();

console.log('transaction details:', stringify(tx));
