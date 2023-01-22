import {
  Contract,
  ElectrumNetworkProvider,
  FailedRequireError,
  FailedTransactionError,
  Reason,
} from '../../src/index.js';
import { getTxOutputs } from '../test-util.js';

describe('BigInt', () => {
  let bigintContract: Contract;
  const MAX_INT32 = BigInt('2147483647');
  const MAX_INT64 = BigInt('9223372036854775807');

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/bigint.json');
    const provider = new ElectrumNetworkProvider();
    bigintContract = new Contract(artifact, [], provider);
    console.log(bigintContract.address);
  });

  describe('proofOfBigInt', () => {
    it('should fail when providing a number that fits within 32 bits', async () => {
      // given
      const to = bigintContract.address;
      const amount = BigInt(1000);

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(MAX_INT32, BigInt(10))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.VERIFY);
    });

    it('should fail when providing numbers that overflow 64 bits when multiplied', async () => {
      // given
      const to = bigintContract.address;
      const amount = BigInt(1000);

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(MAX_INT64 / BigInt(9), BigInt(10))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTransactionError);
      await expect(txPromise).rejects.toThrow(Reason.INVALID_NUMBER_RANGE);
    });

    it('should fail when providing a number that does not fit within 64 bits', async () => {
      // given
      const to = bigintContract.address;
      const amount = BigInt(1000);

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(MAX_INT64 + BigInt(1), BigInt(10))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTransactionError);
      await expect(txPromise).rejects.toThrow(Reason.INVALID_NUMBER_RANGE);
    });

    it('should succeed when providing a number within 32b < x < 64b', async () => {
      // given
      const to = bigintContract.address;
      const amount = BigInt(1000);

      // when
      const tx = await bigintContract.functions
        .proofOfBigInt(MAX_INT32 + BigInt(1), BigInt(10))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
