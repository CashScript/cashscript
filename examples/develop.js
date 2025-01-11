import { URL } from 'url';
import { compileFile } from '../packages/cashc/dist/index.js';
import { MockNetworkProvider, Contract, SignatureTemplate, AdvancedTransactionBuilder, randomUtxo } from '../packages/cashscript/dist/index.js';
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
provider.addUtxo(fooContract.address, randomUtxo());
provider.addUtxo(fooContract.address, randomUtxo());

const barContract = new Contract(artifactBar, [alicePkh], { provider });
provider.addUtxo(barContract.address, randomUtxo());
provider.addUtxo(barContract.address, randomUtxo());
provider.addUtxo(barContract.address, randomUtxo());

provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());

const aliceTemplate = new SignatureTemplate(alicePriv);
const utxos = await provider.getUtxos(aliceAddress);
const contractUtxos = await fooContract.getUtxos();

const newBuilderTransaction = await new AdvancedTransactionBuilder({ provider })
  .addInputs(
    [utxos[0], utxos[1]],
    aliceTemplate.unlockP2PKH.bind(aliceTemplate),
    { template: new SignatureTemplate(alicePriv) },
  )
  .addInput(
    contractUtxos[1],
    barContract.unlock.funcA,
    { contract: barContract, params: [] },
  )
  .addInput(
    contractUtxos[2],
    barContract.unlock.execute,
    { contract: barContract, params: [alicePub, new SignatureTemplate(alicePriv)] },
  )
  .addInput(
    contractUtxos[0],
    fooContract.unlock.execute,
    { contract: fooContract, params: [alicePub, new SignatureTemplate(alicePriv)] },
  )
  .addInput(
    contractUtxos[3],
    barContract.unlock.execute,
    { contract: barContract, params: [alicePub, new SignatureTemplate(alicePriv)] },
  )
  .addOutput({ to: fooContract.address, amount: 8000n })
  .addOpReturnOutput(['hello', 'world'])
  // .build();
  // .debug();
  .bitauthUri();

  console.log('transaction details:', stringify(newBuilderTransaction));
  