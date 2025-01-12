import { URL } from 'url';
import { compileFile } from '../packages/cashc/dist/index.js';
import {
  MockNetworkProvider,
  ElectrumNetworkProvider,
  Contract,
  SignatureTemplate,
  AdvancedTransactionBuilder,
  randomUtxo,
  randomToken,
  randomNFT
} from '../packages/cashscript/dist/index.js';
import { stringify } from '@bitauth/libauth';

// Import Alice's keys from common-js.js
import { alicePkh, alicePriv, alicePub, aliceAddress, aliceTokenAddress } from './common-js.js';


const artifactFoo = compileFile(new URL('Foo.cash', import.meta.url));
const artifactBar = compileFile(new URL('Bar.cash', import.meta.url));

const runMock = async () => {
  const provider = new MockNetworkProvider();

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: alicePkh)
  const fooContract = new Contract(artifactFoo, [alicePkh], { provider });
  provider.addUtxo(fooContract.address, randomUtxo());
  provider.addUtxo(fooContract.address, randomUtxo());
  provider.addUtxo(fooContract.address, randomUtxo());
  provider.addUtxo(fooContract.address, randomUtxo());

  const tokenA = randomToken({
    amount: 100000000n,
  })
  const nftA = randomNFT({
    nft: {
      capability: 'minting',
      commitment: '00'
    }
  })

  const barContract = new Contract(artifactBar, [alicePkh], { provider });
  provider.addUtxo(barContract.address, randomUtxo());
  provider.addUtxo(barContract.address, randomUtxo());
  provider.addUtxo(barContract.address, randomUtxo());

  provider.addUtxo(aliceAddress, randomUtxo());
  provider.addUtxo(aliceAddress, randomUtxo({ token: tokenA }));
  provider.addUtxo(aliceAddress, randomUtxo({ token: nftA }));

  const aliceTemplate = new SignatureTemplate(alicePriv);
  const utxos = await provider.getUtxos(aliceAddress);
  const contractUtxos = await fooContract.getUtxos();

  const transaction = await new AdvancedTransactionBuilder({ provider })
    .addInputs(
      [utxos[0], utxos[1], utxos[2]],
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
      barContract.unlock.funcB,
      { contract: barContract, params: [] },
    )
    .addOutput({ to: fooContract.address, amount: 8000n })
    .addOutput({ to: aliceTokenAddress, amount: 800n, token: tokenA })
    .addOutput({ to: aliceTokenAddress, amount: 1000n, token: nftA })
    .addOpReturnOutput(['hello', 'world'])
    // .build();
    // .debug();
    .bitauthUri();

    console.log('transaction details:', stringify(transaction));
}

const runMainnet = async () => {
  const provider = new ElectrumNetworkProvider();
  const fooContract = new Contract(artifactFoo, [alicePkh], { provider });
  const barContract = new Contract(artifactBar, [alicePkh], { provider });

  const aliceTemplate = new SignatureTemplate(alicePriv);
  const utxos = (await provider.getUtxos(aliceAddress)).filter(utxo => utxo.token === undefined);
  
  const fooContractUtxos = await fooContract.getUtxos();
  const barContractUtxos = await barContract.getUtxos();

  const transaction = await new AdvancedTransactionBuilder({ provider })
  .addInputs(
    [utxos[0]],
    aliceTemplate.unlockP2PKH.bind(aliceTemplate),
    { template: new SignatureTemplate(alicePriv) },
  )
  .addInput(
    barContractUtxos[0],
    barContract.unlock.funcA,
    { contract: barContract, params: [] },
  )
  .addInput(
    fooContractUtxos[0],
    fooContract.unlock.execute,
    { contract: fooContract, params: [alicePub, new SignatureTemplate(alicePriv)] },
  )
  .addOutput({ to: aliceAddress, amount: 3500n })
  .addOpReturnOutput(['Advanced', 'Transaction', 'Builder', 'in', 'CashScript'])
  .build();

  console.log('transaction details:', stringify(transaction));
}

runMock();
// runMainnet();