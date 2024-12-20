import { AuthenticationErrorCommon } from '@bitauth/libauth';
import {
  Contract,
  MockNetworkProvider,
  FailedRequireError,
  FailedTransactionError,
  ElectrumNetworkProvider,
  Network,
} from '../../src/index.js';
import { getTxOutputs } from '../test-util.js';
import artifact from '../fixture/bigint.json' with { type: 'json' };
import { randomUtxo } from '../../src/utils.js';

describe('BigInt', () => {
  let bigintContract: Contract;
  const MAX_INT32 = BigInt('2147483647');
  const MAX_INT64 = BigInt('9223372036854775807');

  beforeAll(() => {
    const provider = process.env.TESTS_USE_MOCKNET
      ? new MockNetworkProvider()
      : new ElectrumNetworkProvider(Network.CHIPNET);
    bigintContract = new Contract(artifact, [], { provider });
    console.log(bigintContract.address);
    (provider as any).addUtxo?.(bigintContract.address, randomUtxo());
  });

  describe('proofOfBigInt', () => {
    it('should fail when providing a number that fits within 32 bits', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000n;

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(MAX_INT32, 10n)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('BigInt.cash:4 Require statement failed at input 0 in contract BigInt.cash at line 4');
      await expect(txPromise).rejects.toThrow('Failing statement: require(x >= maxInt32PlusOne)');
    });

    it('should fail when providing numbers that overflow 64 bits when multiplied', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000n;

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(MAX_INT64 / 9n, 10n)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTransactionError);
      await expect(txPromise).rejects.toThrow(AuthenticationErrorCommon.overflowsVmNumberRange);
    });

    it('should fail when providing a number that does not fit within 64 bits', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000n;

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(MAX_INT64 + 1n, 10n)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTransactionError);
      await expect(txPromise).rejects.toThrow(AuthenticationErrorCommon.invalidVmNumber);
    });

    it('should succeed when providing a number within 32b < x < 64b', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000n;

      // when
      const tx = await bigintContract.functions
        .proofOfBigInt(MAX_INT32 + 1n, 10n)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
