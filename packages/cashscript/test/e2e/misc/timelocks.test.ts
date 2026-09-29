import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  MockNetworkProvider,
  FailedRequireError,
  InputOptions,
  Unlocker,
} from '../../../src/index.js';
import {
  bobAddress,
  bobPub,
  carolPkh,
  carolPub,
  carolAddress,
  carolPriv,
} from '../../fixture/vars.js';
import { Network } from '../../../src/interfaces.js';
import { utxoComparator, calculateDust, randomUtxo, isNonTokenUtxo } from '../../../src/utils.js';
import p2pkhArtifact from '../../fixture/p2pkh.artifact.js';
import twtArtifact from '../../fixture/transfer_with_timeout.artifact.js';
import relativeTimelockArtifact from '../../fixture/relative_timelock.artifact.js';
import { TransactionBuilder } from '../../../src/TransactionBuilder.js';
import { addUtxo, getTxOutputs } from '../../test-util.js';

describe('Timelocks', () => {
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
    await addUtxo(provider, twtInstance.address, randomUtxo());
    await addUtxo(provider, twtInstance.address, randomUtxo());
    await addUtxo(provider, bobAddress, randomUtxo());
    await addUtxo(provider, bobAddress, randomUtxo());
    await addUtxo(provider, carolAddress, randomUtxo());
    await addUtxo(provider, carolAddress, randomUtxo());
  });

  describe.runIf(Boolean(process.env.TESTS_USE_CHIPNET))('Locktime', () => {
    it('should fail when locktime is higher than current block height', async () => {
      const fee = 1000n;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      const blockHeight = await provider.getBlockHeight();

      const txPromise = new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .setLocktime(blockHeight + 100)
        .send();

      await expect(txPromise).rejects.toThrow(/non-final transaction/);
    });

    it('should succeed when locktime is lower than current block height', async () => {
      const fee = 1000n;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      const blockHeight = await provider.getBlockHeight();

      const tx = await new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .setLocktime(blockHeight - 100)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to: p2pkhInstance.address, amount }]));
    });
  });

  // Note: the mock network does not check the age of the spent UTXO (BIP68), only the contract's this.age checks
  describe.skipIf(Boolean(process.env.TESTS_USE_CHIPNET))('Sequence numbers', () => {
    const mockProvider = new MockNetworkProvider();
    const timelockInstance = new Contract(relativeTimelockArtifact, [10n], { provider: mockProvider });
    const invalidPeriodInstance = new Contract(relativeTimelockArtifact, [70000n], { provider: mockProvider });

    const spend = (instance: Contract, unlocker: Unlocker, sequence?: InputOptions['sequence']): Promise<unknown> => {
      const utxo = mockProvider.addUtxo(instance.address, randomUtxo());
      return new TransactionBuilder({ provider: mockProvider })
        .addInput(utxo, unlocker, { sequence })
        .addOutput({ to: instance.address, amount: utxo.satoshis - 1000n })
        .send();
    };

    it('should succeed when the sequence number satisfies this.age in blocks', async () => {
      await expect(spend(timelockInstance, timelockInstance.unlock.afterBlocks(), { blocks: 10 })).resolves.toBeDefined();
    });

    it('should fail when the sequence number does not satisfy this.age in blocks', async () => {
      const txPromise = spend(timelockInstance, timelockInstance.unlock.afterBlocks(), { blocks: 9 });

      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Reason: Program called an OP_CHECKSEQUENCEVERIFY operation that requires a sequence number greater than the input\'s sequence number.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(this.age >= 10)');
    });

    it('should fail when the input does not enable a relative timelock', async () => {
      const txPromise = spend(timelockInstance, timelockInstance.unlock.afterBlocks());

      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Reason: Program called an OP_CHECKSEQUENCEVERIFY operation requiring the disable flag, but the input\'s sequence number is missing the disable flag.');
    });

    it('should succeed when the sequence number satisfies this.age in seconds', async () => {
      const txPromise = spend(timelockInstance, timelockInstance.unlock.afterDuration(), { seconds: 86400 });
      await expect(txPromise).resolves.toBeDefined();
    });

    it('should fail when this.age in seconds is spent with a sequence number in blocks', async () => {
      const txPromise = spend(timelockInstance, timelockInstance.unlock.afterDuration(), { blocks: 169 });

      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Reason: Program called an OP_CHECKSEQUENCEVERIFY operation with an incompatible sequence type flag.');
    });

    it('should succeed when a runtime this.age value is a valid relative timelock', async () => {
      await expect(spend(timelockInstance, timelockInstance.unlock.afterPeriod(), { blocks: 10 })).resolves.toBeDefined();
    });

    it('should fail when a runtime this.age value is not a valid relative timelock', async () => {
      const txPromise = spend(invalidPeriodInstance, invalidPeriodInstance.unlock.afterPeriod(), { blocks: 65535 });

      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('with the following message: this.age value must be a number of blocks between 0 and 65535 (or a BIP68-encoded relative timelock).');
      await expect(txPromise).rejects.toThrow('Failing statement: require(this.age >= period)');
    });
  });
});
