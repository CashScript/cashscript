import {
  Contract,
  ElectrumNetworkProvider,
  FailedRequireError,
  FailedTransactionError,
  Reason,
} from '../../../src';
import { getTxOutputs } from '../../test-util';

describe('BigInt', () => {
  let bigintContract: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/bigint.json');
    const provider = new ElectrumNetworkProvider('staging');
    bigintContract = new Contract(artifact, [], provider);
    console.log(bigintContract.address);
  });

  describe('proofOfBigInt', () => {
    it('should fail when providing a too small numbers', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000;

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(BigInt('2147483640'), 10)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.VERIFY);
    });

    it('should fail when providing a too large numbers (but still within the 64bit limit)', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000;

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(BigInt('9223372036854775800'), 10)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTransactionError);
      await expect(txPromise).rejects.toThrow(Reason.INVALID_NUMBER_RANGE);
    });

    it('should fail when providing too large numbers (outside the 64bit limit)', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000;

      // when
      const txPromise = bigintContract.functions
        .proofOfBigInt(BigInt('9223372036854775808'), 10)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTransactionError);

      // TODO: This call currently returns this error:
      // "mandatory-script-verify-flag-failed (unknown error) (code 16)"
      // I'm assuming it will start returning a different error in the future at which point
      // we'll need to update this test
      // await expect(txPromise).rejects.toThrow(Reason.INVALID_NUMBER_RANGE);
    });

    it('should succeed when providing the right numbers', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000;

      // when
      const tx = await bigintContract.functions
        .proofOfBigInt(BigInt('2147483648'), 10)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx, 'staging');
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
