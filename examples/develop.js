import { URL } from 'url';
import { compileFile } from '../packages/cashc/dist/index.js';
import { MockNetworkProvider, Contract, SignatureTemplate, TransactionBuilder, Builder, randomUtxo } from '../packages/cashscript/dist/index.js';
import { stringify } from '@bitauth/libauth';

// Import Alice's keys from common-js.js
import { alicePkh, alicePriv, alicePub, aliceAddress } from './common-js.js';
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

provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());

const aliceTemplate = new SignatureTemplate(alicePriv);
console.log('aliceTemplate', aliceTemplate);
const utxos = await provider.getUtxos(aliceAddress);
console.log('User utxos:', utxos);

const contractUtxos = await fooContract.getUtxos();
console.log('Contract utxos:', contractUtxos);
// Get contract balance & output address + balance
// console.log('contract address:', fooContract.address);
// console.log('contract balance:', await fooContract.getBalance());


// console.log(contract.unlock)

// Call the spend function with alice's signature + pk
// And use it to send 0. 000 100 00 BCH back to the contract's address
// const tx = await fooContract.functions
//   .execute(alicePub, new SignatureTemplate(alicePriv))
//   .from(contractUtxos[0])
//   .fromP2PKH(utxos[0], new SignatureTemplate(alicePriv))
//   .fromP2PKH(utxos[1], new SignatureTemplate(alicePriv))
//   .to(aliceAddress, 10000n)
//   .withoutChange()
//   .bitauthUri();

// console.log('transaction details:', stringify(tx));

// console.log('--------------------------------');

// const advancedTransaction = await new TransactionBuilder({ provider })
//   .addInput(
//     utxos[0],
//     aliceTemplate.unlockP2PKH(),
//     { template: new SignatureTemplate(alicePriv) },
//   )
//   .addInput(
//     contractUtxos[0],
//     fooContract.unlock.execute(alicePub, new SignatureTemplate(alicePriv)),
//     { contract: fooContract, params: [alicePub, new SignatureTemplate(alicePriv)], selector: 0 },
//   )
//   .addInput(
//     contractUtxos[1],
//     barContract.unlock.execute(alicePub, new SignatureTemplate(alicePriv)),
//     { contract: barContract, params: [alicePub, new SignatureTemplate(alicePriv)], selector: 2 },
//   )
//   .addOutput({ to: fooContract.address, amount: 8000n })
//   .bitauthUri();


// console.log('transaction details:', stringify(advancedTransaction));



const newBuilderTransaction = await new Builder({ provider })
  .addInput({
    utxo: utxos[0],
    unlocker: aliceTemplate.unlockP2PKH(),
    options: { template: new SignatureTemplate(alicePriv) },
  })
  .addInput({
    utxo: utxos[1],
    unlocker: aliceTemplate.unlockP2PKH(),
    options: { template: new SignatureTemplate(alicePriv) },
  })
  .addInput({
    utxo: contractUtxos[1],
    unlocker: barContract.unlock.execute,
    options: { contract: barContract, params: [alicePub, new SignatureTemplate(alicePriv)] },
  })
  .addInput({
    utxo: contractUtxos[0],
    unlocker: fooContract.unlock.execute,
    options: { contract: fooContract, params: [alicePub, new SignatureTemplate(alicePriv)] },
  })
  .addOutput({ to: fooContract.address, amount: 8000n })
  // .addOpReturnOutput(['hello', 'world'])
  // .build();
  .bitauthUri();

console.log('transaction details:', stringify(newBuilderTransaction));