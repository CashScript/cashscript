import { URL } from 'url';
import { compileFile } from '../packages/cashc/dist/index.js';
import { MockNetworkProvider, Contract, SignatureTemplate, TransactionBuilder, randomUtxo } from '../packages/cashscript/dist/index.js';
import { stringify } from '@bitauth/libauth';

// Import Alice's keys from common-js.js
import { alicePkh, alicePriv, alicePub } from './common-js.js';
const provider = new MockNetworkProvider();

const artifactFoo = compileFile(new URL('Foo.cash', import.meta.url));
const artifactBar = compileFile(new URL('Bar.cash', import.meta.url));

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters (pkh: alicePkh)
const fooContract = new Contract(artifactFoo, [alicePkh], { provider });
provider.addUtxo(fooContract.address, randomUtxo());
provider.addUtxo(fooContract.address, randomUtxo());

const barContract = new Contract(artifactBar, [alicePkh], { provider });
provider.addUtxo(barContract.address, randomUtxo());
provider.addUtxo(barContract.address, randomUtxo());
// Get contract balance & output address + balance
// console.log('contract address:', fooContract.address);
// console.log('contract balance:', await fooContract.getBalance());


// console.log(contract.unlock)

// Call the spend function with alice's signature + pk
// And use it to send 0. 000 100 00 BCH back to the contract's address
// const tx = await fooContract.functions
//   .foo(alicePub, new SignatureTemplate(alicePriv))
//   .to(fooContract.address, 10000n)
//   .withoutChange()
//   .bitauthUri();

// console.log('transaction details:', stringify(tx));


const contractUtxos = await fooContract.getUtxos();
const advancedTransaction = await new TransactionBuilder({ provider })
  .addInput(
    contractUtxos[0],
    fooContract.unlock.execute(alicePub, new SignatureTemplate(alicePriv)),
    { contract: fooContract, params: [alicePub, new SignatureTemplate(alicePriv)], selector: 0 },
  )
  .addInput(
    contractUtxos[1],
    barContract.unlock.execute(alicePub, new SignatureTemplate(alicePriv)),
    { contract: barContract, params: [alicePub, new SignatureTemplate(alicePriv)], selector: 2 },
  )
  .addOutput({ to: fooContract.address, amount: 8000n })
  .bitauthUri();

console.log('transaction details:', stringify(advancedTransaction));
