import { decodeTransactionUnsafe, hexToBin, stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider, MockNetworkProvider, placeholderP2PKHUnlocker, placeholderPublicKey, placeholderSignature } from '../src/index.js';
import {
  bobAddress,
  bobPub,
  bobPriv,
  carolPkh,
  carolPub,
  carolAddress,
  carolPriv,
  bobTokenAddress,
  aliceAddress,
  aliceTokenAddress,
  carolTokenAddress,
  alicePriv,
} from './fixture/vars.js';
import { Network } from '../src/interfaces.js';
import { utxoComparator, calculateDust, randomUtxo, randomToken, isNonTokenUtxo, isFungibleTokenUtxo } from '../src/utils.js';
import p2pkhArtifact from './fixture/p2pkh.artifact.js';
import twtArtifact from './fixture/transfer_with_timeout.artifact.js';
import { TransactionBuilder } from '../src/TransactionBuilder.js';
import { addUtxo, getTxOutputs } from './test-util.js';
import { generateWcTransactionObjectFixture } from './fixture/walletconnect/fixtures.js';
import {
  OutputBchChangeLockedError,
  OutputTokenChangeLockedError,
  TokensToNonTokenAddressError,
} from '../src/Errors.js';

describe('Transaction Builder', () => {
  const provider = process.env.TESTS_USE_CHIPNET
    ? new ElectrumNetworkProvider(Network.CHIPNET)
    : new MockNetworkProvider();

  let p2pkhInstance: Contract<typeof p2pkhArtifact>;
  let twtInstance: Contract<typeof twtArtifact>;

  beforeAll(async () => {
    // Note: We instantiate the contract with carolPkh to avoid mempool conflicts with other (P2PKH) tests
    p2pkhInstance = new Contract(p2pkhArtifact, [carolPkh], { provider });
    twtInstance = new Contract(twtArtifact, [bobPub, carolPub, 100000n], { provider });
    console.log(p2pkhInstance.tokenAddress);
    console.log(twtInstance.tokenAddress);
    await addUtxo(provider, p2pkhInstance.address, randomUtxo());
    await addUtxo(provider, p2pkhInstance.address, randomUtxo());
    await addUtxo(provider, p2pkhInstance.address, randomUtxo({ token: randomToken() }));
    await addUtxo(provider, twtInstance.address, randomUtxo());
    await addUtxo(provider, twtInstance.address, randomUtxo());
    await addUtxo(provider, aliceAddress, randomUtxo());
    await addUtxo(provider, aliceAddress, randomUtxo());
    await addUtxo(provider, bobAddress, randomUtxo());
    await addUtxo(provider, bobAddress, randomUtxo());
    await addUtxo(provider, carolAddress, randomUtxo());
    await addUtxo(provider, carolAddress, randomUtxo());
  });

  describe('test TransactionBuilder.build', () => {
    it('should build a transaction that can spend from 2 different contracts and P2PKH + OP_RETURN', async () => {
      const fee = 1000n;

      const carolUtxos = (await provider.getUtxos(carolAddress)).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
      const twtUtxos = (await twtInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const change = carolUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: carolAddress, amount: change });

      const outputs = [
        { to: p2pkhInstance.address, amount: p2pkhUtxos[0].satoshis },
        { to: twtInstance.address, amount: twtUtxos[0].satoshis },
        ...(change > dustAmount ? [{ to: carolAddress, amount: change }] : []),
      ];

      if (change < 0) {
        throw new Error('Not enough funds to send transaction');
      }

      const tx = new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addInput(twtUtxos[0], twtInstance.unlock.transfer(new SignatureTemplate(carolPriv)))
        .addInput(carolUtxos[0], new SignatureTemplate(carolPriv).unlockP2PKH())
        .addOpReturnOutput(['Hello new transaction builder'])
        .addOutputs(outputs)
        .build();

      const txOutputs = getTxOutputs(decodeTransactionUnsafe(hexToBin(tx)));
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('should fail when fee is higher than maximumFeeSatoshis', async () => {
      const fee = 2000n;
      const maximumFeeSatoshis = 1000n;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      expect(() => {
        new TransactionBuilder({ provider, maximumFeeSatoshis })
          .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: p2pkhInstance.address, amount })
          .build();
      }).toThrow(`Transaction fee of ${fee} is higher than max fee of ${maximumFeeSatoshis}`);
    });

    it('should succeed when fee is lower than maximumFeeSatoshis', async () => {
      const fee = 1000n;
      const maximumFeeSatoshis = 2000n;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      const tx = new TransactionBuilder({ provider, maximumFeeSatoshis })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .build();

      expect(tx).toBeDefined();
    });

    it('should fail when fee per byte is higher than maximumFeeSatsPerByte', async () => {
      const fee = 2000n;
      const maximumFeeSatsPerByte = 1.0;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      expect(() => {
        new TransactionBuilder({ provider, maximumFeeSatsPerByte })
          .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: p2pkhInstance.address, amount })
          .build();
      }).toThrow(`Transaction fee per byte of 9.05 is higher than max fee per byte of ${maximumFeeSatsPerByte}`);
    });

    it('should succeed when fee per byte is lower than maximumFeeSatsPerByte', async () => {
      const fee = 1000n;
      const maximumFeeSatsPerByte = 10.0;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      const tx = new TransactionBuilder({ provider, maximumFeeSatsPerByte })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .build();

      expect(tx).toBeDefined();
    });

    // TODO: Consider improving error messages checked below to also include the input/output index

    it('should fail when trying to send to invalid address', async () => {
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      expect(() => {
        new TransactionBuilder({ provider })
          .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: bobAddress.slice(0, -1), amount: 1000n })
          .build();
      }).toThrow('CashAddress decoding error');
    });

    it('should fail when trying to send tokens to non-token address', async () => {
      const tokenUtxo = (await p2pkhInstance.getUtxos()).find(isFungibleTokenUtxo)!;

      expect(() => {
        new TransactionBuilder({ provider })
          .addInput(tokenUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: bobAddress, amount: 1000n, token: tokenUtxo.token })
          .build();
      }).toThrow('Tried to send tokens to an address without token support');
    });

    it('should fail when trying to send negative BCH amount or token amount', async () => {
      const tokenUtxo = (await p2pkhInstance.getUtxos()).find(isFungibleTokenUtxo)!;

      expect(() => {
        new TransactionBuilder({ provider })
          .addInput(tokenUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: bobTokenAddress, amount: -1000n, token: tokenUtxo.token })
          .build();
      }).toThrow('Tried to add an output with -1000 satoshis, which is less than the required minimum for this output-type');

      expect(() => {
        new TransactionBuilder({ provider })
          .addInput(tokenUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: -1000n, category: tokenUtxo.token!.category } })
          .build();
      }).toThrow('Tried to add an output with -1000 tokens, which is invalid');
    });

    it('should fail when adding undefined input', async () => {
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
      const undefinedUtxo = p2pkhUtxos[1000];

      expect(() => {
        new TransactionBuilder({ provider })
          .addInput(undefinedUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
          .addOutput({ to: bobAddress, amount: 1000n })
          .build();
      }).toThrow('Input is undefined');
    });
  });

  describe('test TransactionBuilder.generateWcTransactionObject', () => {
    it('should match the generateWcTransactionObjectFixture ', async () => {
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
      const contractUtxo = p2pkhUtxos[0];
      const bobUtxos = await provider.getUtxos(bobAddress);

      const placeholderUnlocker = placeholderP2PKHUnlocker(bobAddress);
      const placeholderPubKey = placeholderPublicKey();
      const placeholderSig = placeholderSignature();

      // use the CashScript SDK to construct a transaction
      const transactionBuilder = new TransactionBuilder({ provider })
        .addInput(contractUtxo, p2pkhInstance.unlock.spend(placeholderPubKey, placeholderSig))
        .addInput(bobUtxos[0], placeholderUnlocker)
        .addOutput({ to: bobAddress, amount: 100_000n });

      // Generate WalletConnect transaction object with custom 'broadcast' and 'userPrompt' options
      const wcTransactionObj = transactionBuilder.generateWcTransactionObject({
        broadcast: true,
        userPrompt: 'Example Contract transaction',
      });

      const expectedResult = generateWcTransactionObjectFixture;
      expect(JSON.parse(stringify(wcTransactionObj))).toEqual(expectedResult);
    });
  });

  it('should not fail when validly spending from only P2PKH inputs', async () => {
    const aliceUtxos = (await provider.getUtxos(aliceAddress)).filter(isNonTokenUtxo);
    const sigTemplate = new SignatureTemplate(alicePriv);

    expect(aliceUtxos.length).toBe(2);

    const change = aliceUtxos[0].satoshis + aliceUtxos[1].satoshis - 1000n;

    const transaction = new TransactionBuilder({ provider })
      .addInput(aliceUtxos[0], sigTemplate.unlockP2PKH())
      .addInput(aliceUtxos[1], sigTemplate.unlockP2PKH())
      .addOutput({ to: aliceAddress, amount: change });

    await expect(transaction.send()).resolves.not.toThrow();
  });

  // TODO: Currently, P2PKH inputs are not evaluated at all
  it.skip('should fail when invalidly spending from only P2PKH inputs', async () => {
    const aliceUtxos = (await provider.getUtxos(aliceAddress)).filter(isNonTokenUtxo);
    const incorrectSigTemplate = new SignatureTemplate(bobPriv);

    expect(aliceUtxos.length).toBeGreaterThan(2);

    const change = aliceUtxos[0].satoshis + aliceUtxos[1].satoshis - 1000n;

    const transaction = new TransactionBuilder({ provider })
      .addInput(aliceUtxos[0], incorrectSigTemplate.unlockP2PKH())
      .addInput(aliceUtxos[1], incorrectSigTemplate.unlockP2PKH())
      .addOutput({ to: aliceAddress, amount: change });

    await expect(transaction.send()).rejects.toThrow();
  });

  // TODO: Currently, P2PKH inputs are not evaluated at all
  it.skip('should fail when invalidly spending from P2PKH and correctly from contract inputs', async () => {
    const aliceUtxos = (await provider.getUtxos(aliceAddress)).filter(isNonTokenUtxo);
    const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
    const incorrectSigTemplate = new SignatureTemplate(bobPriv);

    expect(aliceUtxos.length).toBeGreaterThan(2);

    const change = aliceUtxos[0].satoshis + aliceUtxos[1].satoshis - 1000n;

    const transaction = new TransactionBuilder({ provider })
      .addInput(aliceUtxos[0], incorrectSigTemplate.unlockP2PKH())
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addOutput({ to: aliceAddress, amount: change });

    await expect(transaction.send()).rejects.toThrow();
  });

  describe('change output management', () => {
    const carolUnlocker = (): ReturnType<typeof p2pkhInstance.unlock.spend> => (
      p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv))
    );

    describe('BCH change lock', () => {
      it('should prevent further inputs or outputs after a BCH change output was added', () => {
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo(), carolUnlocker())
          .addOutput({ to: bobAddress, amount: 1000n })
          .addBchChangeOutputIfNeeded({ to: aliceAddress, feeRate: 1.0 });

        expect(() => builder.addInput(randomUtxo(), carolUnlocker())).toThrow(OutputBchChangeLockedError);
        expect(() => builder.addOutput({ to: bobAddress, amount: 1000n })).toThrow(OutputBchChangeLockedError);
        expect(() => builder.addOpReturnOutput(['hello'])).toThrow(OutputBchChangeLockedError);
      });

      it('should still lock when no change output was added because the surplus would be dust', () => {
        // Output leaves only a few satoshis of surplus, well below dust — no change output is added
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ satoshis: 2_000n }), carolUnlocker())
          .addOutput({ to: bobAddress, amount: 1_500n });
        const outputCountBefore = builder.outputs.length;
        builder.addBchChangeOutputIfNeeded({ to: aliceAddress, feeRate: 1.0 });

        expect(builder.outputs.length).toBe(outputCountBefore);
        expect(() => builder.addOpReturnOutput(['hello'])).toThrow(OutputBchChangeLockedError);
      });
    });

    describe('token change lock', () => {
      it('should prevent further inputs or outputs of the same category after a token change output was added', () => {
        const token = randomToken();
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token }), carolUnlocker())
          .addTokenChangeOutputIfNeeded({ category: token.category, to: aliceTokenAddress });

        expect(() => builder.addInput(randomUtxo({ token }), carolUnlocker())).toThrow(OutputTokenChangeLockedError);
        expect(() => builder.addOutput({
          to: bobTokenAddress, amount: 1000n, token: { amount: 100n, category: token.category },
        })).toThrow(OutputTokenChangeLockedError);
      });

      it('should leave other categories and non-token inputs/outputs unaffected', () => {
        const tokenA = randomToken();
        const tokenB = randomToken();
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token: tokenA }), carolUnlocker())
          .addTokenChangeOutputIfNeeded({ category: tokenA.category, to: aliceTokenAddress });

        expect(() => {
          builder.addInput(randomUtxo({ token: tokenB }), carolUnlocker());
          builder.addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: 100n, category: tokenB.category } });
          builder.addInput(randomUtxo(), carolUnlocker());
          builder.addOutput({ to: bobAddress, amount: 1000n });
          builder.addOpReturnOutput(['hello']);
        }).not.toThrow();
      });
    });

    describe('addTokenChangeOutputIfNeeded', () => {
      it('should add a token change output for the surplus of a single fungible category', () => {
        const token = randomToken({ amount: 1000n });

        const tx = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token }), carolUnlocker())
          .addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: 400n, category: token.category } })
          .addTokenChangeOutputIfNeeded({ category: token.category, to: aliceTokenAddress })
          .build();

        const txOutputs = getTxOutputs(decodeTransactionUnsafe(hexToBin(tx)));
        const changeOutput = txOutputs.find((o) => o.to === aliceTokenAddress);
        expect(changeOutput).toBeDefined();
        expect(changeOutput!.token).toEqual({ amount: 600n, category: token.category });
        expect(changeOutput!.amount).toBeGreaterThan(0n);
      });

      it('should lock the category without adding an output when no change is needed', () => {
        const token = randomToken({ amount: 1000n });
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token }), carolUnlocker())
          // Match input amount with an explicit output so there's no surplus
          .addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: 1000n, category: token.category } });

        const outputCountBefore = builder.outputs.length;
        builder.addTokenChangeOutputIfNeeded({ category: token.category, to: aliceTokenAddress });
        expect(builder.outputs.length).toBe(outputCountBefore);
        expect(() => builder.addInput(randomUtxo({ token }), carolUnlocker())).toThrow(OutputTokenChangeLockedError);
      });

      it('should scope the change output to the configured category across multiple invocations', () => {
        const tokenA = randomToken({ amount: 1000n });
        const tokenB = randomToken({ amount: 5000n });

        const tx = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token: tokenA }), carolUnlocker())
          .addInput(randomUtxo({ token: tokenB }), carolUnlocker())
          .addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: 700n, category: tokenA.category } })
          .addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: 2000n, category: tokenB.category } })
          .addTokenChangeOutputIfNeeded({ category: tokenA.category, to: aliceTokenAddress })
          .addTokenChangeOutputIfNeeded({ category: tokenB.category, to: carolTokenAddress })
          .build();

        const txOutputs = getTxOutputs(decodeTransactionUnsafe(hexToBin(tx)));
        const aliceChange = txOutputs.find((o) => o.to === aliceTokenAddress);
        const carolChange = txOutputs.find((o) => o.to === carolTokenAddress);
        expect(aliceChange!.token).toEqual({ amount: 300n, category: tokenA.category });
        expect(carolChange!.token).toEqual({ amount: 3000n, category: tokenB.category });
      });

      it('should fail when the change address does not support tokens', () => {
        const token = randomToken();
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token }), carolUnlocker());

        expect(() => {
          builder.addTokenChangeOutputIfNeeded({ category: token.category, to: aliceAddress });
        }).toThrow(TokensToNonTokenAddressError);
      });

      it('should fail when a BCH change output was already added', () => {
        const token = randomToken();
        const builder = new TransactionBuilder({ provider })
          .addInput(randomUtxo({ token }), carolUnlocker())
          .addBchChangeOutputIfNeeded({ to: aliceAddress, feeRate: 1.0 });

        expect(() => {
          builder.addTokenChangeOutputIfNeeded({ category: token.category, to: aliceTokenAddress });
        }).toThrow(OutputBchChangeLockedError);
      });
    });
  });
});
