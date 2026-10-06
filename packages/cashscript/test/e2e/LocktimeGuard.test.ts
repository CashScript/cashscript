import { hexToBin } from '@bitauth/libauth';
import { compileString } from 'cashc';
import { Contract, MockNetworkProvider, ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } from '../../src/index.js';
import { bobAddress, bobPriv } from '../fixture/vars.js';
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

// Regression test to ensure that synthetically added parameter checks and locktime guards
// are properly ordered in the source map
describe('Locktime Guard with function parameters', () => {
  const provider = new MockNetworkProvider();

  const artifactWithParameter = compileString(`
    pragma cashscript ^0.14.0;

    contract ParameterizedLocktimeGuard() {
        function spend(
            bytes8 tag,
        ) {
            require(tag.length == 8);
            require(tx.locktime >= 1);
        }
    }
  `);
  const contract = new Contract(artifactWithParameter, [], { provider });

  beforeAll(async () => {
    await addUtxo(provider, contract.address, randomUtxo({ satoshis: 100_000n }));
    await addUtxo(provider, bobAddress, randomUtxo({ satoshis: 100_000n }));
  });

  it('should not false-fail debug() when the guarded function has a parameter', async () => {
    const [contractUtxo] = await provider.getUtxos(contract.address);
    const [funderUtxo] = await provider.getUtxos(bobAddress);

    const builder = new TransactionBuilder({ provider })
      .setLocktime(1_000_000)
      .addInput(contractUtxo, contract.unlock.spend(hexToBin('0000000000000000')))
      .addInput(funderUtxo, new SignatureTemplate(bobPriv).unlockP2PKH())
      .addBchChangeOutputIfNeeded({ to: bobAddress, feeRate: 1.0 });

    expect(() => builder.build()).not.toThrow();
    expect(() => builder.debug()).not.toThrow();
  });
});
