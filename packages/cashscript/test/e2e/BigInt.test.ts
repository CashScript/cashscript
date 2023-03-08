import {
  Contract,
  ElectrumNetworkProvider,
  FailedRequireError,
  FailedTransactionError,
  Network,
  Reason,
} from '../../src/index.js';
import { getTxOutputs } from '../test-util.js';
import artifact from '../fixture/bigint.json' assert { type: "json" };

describe('BigInt', () => {
  let bigintContract: Contract;
  const MAX_INT32 = BigInt('2147483647');
  const MAX_INT64 = BigInt('9223372036854775807');

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    bigintContract = new Contract(artifact, [], { provider });
    console.log(bigintContract.address);
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
      await expect(txPromise).rejects.toThrow(Reason.VERIFY);
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
      await expect(txPromise).rejects.toThrow(Reason.INVALID_NUMBER_RANGE);
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
      await expect(txPromise).rejects.toThrow(Reason.INVALID_NUMBER_RANGE);
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
