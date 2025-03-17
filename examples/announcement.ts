import { Contract, ElectrumNetworkProvider, Output, TransactionBuilder } from 'cashscript';
import { compileFile } from 'cashc';
import { stringify } from '@bitauth/libauth';
import { URL } from 'url';

// Compile the Announcement contract to an artifact object
const artifact = compileFile(new URL('announcement.cash', import.meta.url));

// Initialise a network provider for network operations on MAINNET
const addressType = 'p2sh20';
const provider = new ElectrumNetworkProvider();

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters (none)
const contract = new Contract(artifact, [], { provider, addressType });

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

// Announcement string
const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';

// Construct a changeOutput so the leftover BCH can be send back for another announcement
const minerFee = 1000n;
const changeAmount = inputAmount - minerFee;
const contractChangeOutput: Output = {
  amount: changeAmount,
  to: contract.address,
};

// Send the announcement. Trying to send any other announcement or other change output
// will fail because of the contract's covenant logic
const transactionBuilder = new TransactionBuilder({ provider });

transactionBuilder.addInput(contractInputUtxo, contract.unlock.announce());
transactionBuilder.addOpReturnOutput(['0x6d02', str]);
if (changeAmount > 1000n) transactionBuilder.addOutput(contractChangeOutput);

const tx = await transactionBuilder.send();

console.log('transaction details:', stringify(tx));
