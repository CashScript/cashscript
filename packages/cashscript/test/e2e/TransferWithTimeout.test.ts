import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src';
import {
  alicePk,
  alice,
  bob,
  bobPk,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedSigCheckError, Reason, FailedTimeCheckError } from '../../src/Errors';

describe('TransferWithTimeout', () => {
  let twtInstancePast: Contract;
  let twtInstanceFuture: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/transfer_with_timeout.json');
    const provider = new ElectrumNetworkProvider();
    twtInstancePast = new Contract(artifact, [alicePk, bobPk, 500000], provider);
    twtInstanceFuture = new Contract(artifact, [alicePk, bobPk, 2000000], provider);
    console.log(twtInstancePast.address);
    console.log(twtInstanceFuture.address);
  });

  describe('send', () => {
    it('should fail when using incorrect function arguments to transfer', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000;

      // when
      const txPromise = twtInstancePast.functions
        .transfer(new SignatureTemplate(alice))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should fail when using incorrect function arguments to timeout', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000;

      // when
      const txPromise = twtInstancePast.functions
        .timeout(new SignatureTemplate(bob))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should fail when timeout is called before timeout block', async () => {
      // given
      const to = twtInstanceFuture.address;
      const amount = 10000;

      // when
      const txPromise = twtInstanceFuture.functions
        .timeout(new SignatureTemplate(alice))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTimeCheckError);
      await expect(txPromise).rejects.toThrow(Reason.UNSATISFIED_LOCKTIME);
    });

    it('should succeed when transfer is called after timeout block', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000;

      // when
      const tx = await twtInstancePast.functions
        .transfer(new SignatureTemplate(bob))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when transfer is called before timeout block', async () => {
      // given
      const to = twtInstanceFuture.address;
      const amount = 10000;

      // when
      const tx = await twtInstanceFuture.functions
        .transfer(new SignatureTemplate(bob))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when timeout is called after timeout block', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000;

      // when
      const tx = await twtInstancePast.functions
        .timeout(new SignatureTemplate(alice))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
