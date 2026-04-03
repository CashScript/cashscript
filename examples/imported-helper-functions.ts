import { stringify } from '@bitauth/libauth';
import { compileFile } from 'cashc';
import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder, VmTarget } from 'cashscript';
import { URL } from 'url';

const artifact = compileFile(new URL('imported-helper-functions.cash', import.meta.url));
const provider = new MockNetworkProvider({ vmTarget: VmTarget.BCH_2026_05 });
const contract = new Contract(artifact, [], { provider });

provider.addUtxo(contract.address, randomUtxo());

const [contractUtxo] = await contract.getUtxos();
if (!contractUtxo) throw new Error('No contract UTXO found');

console.log('contract address:', contract.address);
console.log('public ABI functions:', artifact.abi.map((func) => func.name));
console.log('compiler target:', artifact.compiler.target);

const tx = await new TransactionBuilder({ provider })
  .addInput(contractUtxo, contract.unlock.spend(8n))
  .addOutput({ to: contract.address, amount: 10_000n })
  .send();

console.log('transaction details:', stringify(tx));
