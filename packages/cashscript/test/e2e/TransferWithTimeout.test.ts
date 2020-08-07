import { Contract, SignatureTemplate, BitboxNetworkProvider } from '../../src';
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
    const provider = new BitboxNetworkProvider();
    twtInstancePast = new Contract(artifact, provider, [alicePk, bobPk, 500000]);
    twtInstanceFuture = new Contract(artifact, provider, [alicePk, bobPk, 2000000]);
    console.log(twtInstancePast.address);
    console.log(twtInstanceFuture.address);
  });

  describe('send', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        twtInstancePast.functions
          .transfer(new SignatureTemplate(alice))
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedSigCheckError);
      await expectPromise.rejects.toThrow(Reason.SIG_NULLFAIL);

      // when
      const expectPromise2 = expect(
        twtInstancePast.functions
          .timeout(new SignatureTemplate(bob))
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise2.rejects.toThrow(FailedSigCheckError);
      await expectPromise2.rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should fail when called before timeout', async () => {
      // given
      const to = twtInstanceFuture.address;
      const amount = 10000;

      // when
      const expectPromise = await expect(
        twtInstanceFuture.functions
          .timeout(new SignatureTemplate(alice))
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedTimeCheckError);
      await expectPromise.rejects.toThrow(Reason.UNSATISFIED_LOCKTIME);
    });

    it('should succeed when using correct function parameters', async () => {
      // given
      const toFuture = twtInstanceFuture.address;
      const toPast = twtInstancePast.address;
      const amount = 10000;

      // when
      const tx1 = await twtInstancePast.functions
        .transfer(new SignatureTemplate(bob))
        .to(toPast, amount)
        .send();

      const tx2 = await twtInstanceFuture.functions
        .transfer(new SignatureTemplate(bob))
        .to(toFuture, amount)
        .send();

      const tx3 = await twtInstancePast.functions
        .timeout(new SignatureTemplate(alice))
        .to(toPast, amount)
        .send();

      // then
      const tx1Outputs = getTxOutputs(tx1);
      const tx2Outputs = getTxOutputs(tx2);
      const tx3Outputs = getTxOutputs(tx3);
      expect(tx1Outputs).toEqual(expect.arrayContaining([{ to: toPast, amount }]));
      expect(tx2Outputs).toEqual(expect.arrayContaining([{ to: toFuture, amount }]));
      expect(tx3Outputs).toEqual(expect.arrayContaining([{ to: toPast, amount }]));
    });

    it('can send to multiple recipients', async () => {
      // given
      const outputs = [
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 20000 },
      ];

      // when
      const tx1 = await twtInstancePast.functions
        .transfer(new SignatureTemplate(bob))
        .to(outputs)
        .send();

      const tx2 = await twtInstancePast.functions
        .timeout(new SignatureTemplate(alice))
        .to(outputs[0].to, outputs[0].amount)
        .to(outputs[1].to, outputs[1].amount)
        .send();

      // then
      const txOutputs1 = getTxOutputs(tx1);
      const txOutputs2 = getTxOutputs(tx2);
      expect(txOutputs1).toEqual(expect.arrayContaining(outputs));
      expect(txOutputs2).toEqual(expect.arrayContaining(outputs));
    });
  });
});
