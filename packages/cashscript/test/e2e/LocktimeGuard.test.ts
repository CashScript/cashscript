import { Contract, MockNetworkProvider, ElectrumNetworkProvider, TransactionBuilder } from '../../src/index.js';
import { bobAddress } from '../fixture/vars.js';
import { addUtxo } from '../test-util.js';
import { Network } from '../../src/interfaces.js';
import { randomUtxo } from '../../src/utils.js';
import artifact from '../fixture/tx_locktime_guard.artifact.js';

describe('Locktime Guard', () => {
  const provider = process.env.TESTS_USE_CHIPNET
    ? new ElectrumNetworkProvider(Network.CHIPNET)
    : new MockNetworkProvider();

  // define contract in the describe block so artifact typings aren't lost
  const locktimeGuardContract = new Contract(artifact, [], { provider });

  beforeAll(async () => {
    console.log(locktimeGuardContract.tokenAddress);
    await addUtxo(provider, locktimeGuardContract.address, randomUtxo());
    await addUtxo(provider, locktimeGuardContract.address, randomUtxo());
    await addUtxo(provider, bobAddress, randomUtxo());
    await addUtxo(provider, bobAddress, randomUtxo());
  });

  describe('send', () => {
    it('should fail with the user require error (not the injected guard) when locktime is too low', async () => {
      const [utxo] = await locktimeGuardContract.getUtxos();
      const transaction = new TransactionBuilder({ provider })
        .setLocktime(0)
        .addInput(utxo, locktimeGuardContract.unlock.send())
        .addBchChangeOutputIfNeeded({ to: locktimeGuardContract.address, feeRate: 1.0 });

      expect(transaction).toFailRequireWith(
        'LocktimeGuard.cash:5 Require statement failed at input 0 in contract LocktimeGuard.cash at line 5.',
      );
      expect(transaction).toFailRequireWith('Failing statement: require(tx.locktime >= 1)');
    });

    it('should fail with the injected guard error when sequence is not non-final', async () => {
      const [utxo] = await locktimeGuardContract.getUtxos();
      const transaction = new TransactionBuilder({ provider })
        .addInput(utxo, locktimeGuardContract.unlock.send(), { sequence: 0xffffffff })
        .addBchChangeOutputIfNeeded({ to: locktimeGuardContract.address, feeRate: 1.0 });

      expect(transaction).toFailRequireWith(
        'LocktimeGuard.cash:4 Require statement failed at input 0 in contract LocktimeGuard.cash at line 4'
        + ' with the following message: Using tx.locktime requires a non-final sequence number on the spending input.',
      );
      // The guard is compiler-injected and has no user source, so there must be no (empty) failing statement line
      expect(transaction).not.toFailRequireWith('Failing statement:');
    });
  });
});
