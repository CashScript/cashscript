import path from 'path';
import { Contract, Instance, Sig } from '../../src';
import {
  alicePk,
  alice,
  bob,
  bobPk,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedSigCheckError, Reason, FailedTimeCheckError } from '../../src/Errors';

describe('TransferWithTimeout', () => {
  let twtInstancePast: Instance;
  let twtInstanceFuture: Instance;
  beforeAll(() => {
    const TWT = Contract.import(path.join(__dirname, '..', 'fixture', 'transfer_with_timeout.json'), 'testnet');
    twtInstancePast = TWT.new(alicePk, bobPk, 1000000);
    twtInstanceFuture = TWT.new(alicePk, bobPk, 2000000);
    console.log(twtInstancePast.address);
    console.log(twtInstanceFuture.address);
  });

  describe('send (to one)', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        twtInstancePast.functions
          .transfer(new Sig(alice))
          .send(to, amount),
      );

      // then
      await expectPromise.rejects.toThrow(FailedSigCheckError);
      await expectPromise.rejects.toThrow(Reason.SIG_NULLFAIL);

      // when
      const expectPromise2 = expect(
        twtInstancePast.functions
          .timeout(new Sig(bob))
          .send(to, amount),
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
          .timeout(new Sig(alice))
          .send(to, amount),
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
        .transfer(new Sig(bob))
        .send(toPast, amount);

      const tx2 = await twtInstanceFuture.functions
        .transfer(new Sig(bob))
        .send(toFuture, amount);

      const tx3 = await twtInstancePast.functions
        .timeout(new Sig(alice))
        .send(toPast, amount);

      // then
      const tx1Outputs = getTxOutputs(tx1);
      const tx2Outputs = getTxOutputs(tx2);
      const tx3Outputs = getTxOutputs(tx3);
      expect(tx1Outputs).toEqual(expect.arrayContaining([{ to: toPast, amount }]));
      expect(tx2Outputs).toEqual(expect.arrayContaining([{ to: toFuture, amount }]));
      expect(tx3Outputs).toEqual(expect.arrayContaining([{ to: toPast, amount }]));
    });
  });

  describe('send (to many)', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const outputs = [
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 20000 },
      ];

      // then
      const expectPromise = expect(
        twtInstancePast.functions
          .transfer(new Sig(alice))
          .send(outputs),
      );

      // then
      await expectPromise.rejects.toThrow(FailedSigCheckError);
      await expectPromise.rejects.toThrow(Reason.SIG_NULLFAIL);

      // when
      const expectPromise2 = expect(
        twtInstancePast.functions
          .timeout(new Sig(bob))
          .send(outputs),
      );

      // then
      await expectPromise2.rejects.toThrow(FailedSigCheckError);
      await expectPromise2.rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should fail when called before timeout', async () => {
      // given
      const outputs = [
        { to: twtInstanceFuture.address, amount: 10000 },
        { to: twtInstanceFuture.address, amount: 20000 },
      ];

      // when
      const expectPromise = expect(
        twtInstanceFuture.functions
          .timeout(new Sig(alice))
          .send(outputs),
      );

      // then
      await expectPromise.rejects.toThrow(FailedTimeCheckError);
      await expectPromise.rejects.toThrow(Reason.UNSATISFIED_LOCKTIME);
    });

    it('should succeed when using correct function parameters', async () => {
      // given
      const outputsPast = [
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 20000 },
      ];

      const outputsFuture = [
        { to: twtInstanceFuture.address, amount: 10000 },
        { to: twtInstanceFuture.address, amount: 20000 },
      ];

      // when
      const tx1 = await twtInstancePast.functions
        .transfer(new Sig(bob))
        .send(outputsPast);

      const tx2 = await twtInstanceFuture.functions
        .transfer(new Sig(bob))
        .send(outputsFuture);

      const tx3 = await twtInstancePast.functions
        .timeout(new Sig(alice))
        .send(outputsPast);

      // then
      const tx1Outputs = getTxOutputs(tx1);
      const tx2Outputs = getTxOutputs(tx2);
      const tx3Outputs = getTxOutputs(tx3);
      expect(tx1Outputs).toEqual(expect.arrayContaining(outputsPast));
      expect(tx2Outputs).toEqual(expect.arrayContaining(outputsFuture));
      expect(tx3Outputs).toEqual(expect.arrayContaining(outputsPast));
    });
  });

  describe.skip('meep (to one)', () => {
    it('should succeed when using incorrect function parameters', async () => {
      await twtInstancePast.functions
        .transfer(new Sig(alice))
        .meep(twtInstancePast.address, 10000);

      await twtInstancePast.functions
        .timeout(new Sig(bob))
        .meep(twtInstancePast.address, 10000);
    });

    it('should succeed when called before timeout', async () => {
      await twtInstanceFuture.functions
        .timeout(new Sig(alice))
        .meep(twtInstancePast.address, 10000);
    });

    it('should succeed when using correct function parameters', async () => {
      await twtInstancePast.functions
        .transfer(new Sig(bob))
        .meep(twtInstancePast.address, 10000);

      await twtInstanceFuture.functions
        .transfer(new Sig(bob))
        .meep(twtInstanceFuture.address, 10000);

      await twtInstancePast.functions
        .timeout(new Sig(alice))
        .meep(twtInstancePast.address, 10000);
    });
  });

  describe.skip('meep (to many)', () => {
    it('should succeed when using incorrect function parameters', async () => {
      await twtInstancePast.functions.transfer(new Sig(alice)).meep([
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 10000 },
      ]);

      await twtInstancePast.functions.timeout(new Sig(bob)).meep([
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 10000 },
      ]);
    });

    it('should succeed when called before timeout', async () => {
      await twtInstanceFuture.functions.timeout(new Sig(alice)).meep([
        { to: twtInstanceFuture.address, amount: 10000 },
        { to: twtInstanceFuture.address, amount: 10000 },
      ]);
    });

    it('should succeed when using correct function parameters', async () => {
      await twtInstancePast.functions.transfer(new Sig(bob)).meep([
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 10000 },
      ]);

      await twtInstanceFuture.functions.transfer(new Sig(bob)).meep([
        { to: twtInstanceFuture.address, amount: 10000 },
        { to: twtInstanceFuture.address, amount: 10000 },
      ]);

      await twtInstancePast.functions.timeout(new Sig(alice)).meep([
        { to: twtInstancePast.address, amount: 10000 },
        { to: twtInstancePast.address, amount: 10000 },
      ]);
    });
  });
});
