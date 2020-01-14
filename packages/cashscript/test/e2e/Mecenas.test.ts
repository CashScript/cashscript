import * as path from 'path';
import { Contract, Instance, Sig } from '../../src';
import {
  alicePk,
  alice,
  alicePkh,
  bobPkh,
  aliceAddress,
  bobAddress,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';

// Mecenas has tx.age check omitted for testing
describe('Mecenas v1', () => {
  let mecenas: Instance;
  const pledge = 10000;
  beforeAll(() => {
    const Mecenas = Contract.import(path.join(__dirname, '..', 'fixture', 'mecenas_v1.json'), 'testnet');
    mecenas = Mecenas.new(alicePkh, bobPkh, pledge);
  });

  describe('send', () => {
    it('should fail when trying to send more than pledge', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge + 10;

      // when
      const expectPromise = expect(
        mecenas.functions
          .receive(alicePk, new Sig(alice))
          .send(to, amount, { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EVAL_FALSE);
    });

    it('should fail when trying to send to wrong person', async () => {
      // given
      const to = bobAddress;
      const amount = pledge;

      // when
      const expectPromise = expect(
        mecenas.functions
          .receive(alicePk, new Sig(alice))
          .send(to, amount, { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EVAL_FALSE);
    });

    it('should fail when trying to send to multiple people', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const expectPromise = expect(
        mecenas.functions
          .receive(alicePk, new Sig(alice))
          .send([{ to, amount }, { to, amount }], { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EVAL_FALSE);
    });

    it('should succeed when sending pledge to receiver', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const tx = await mecenas.functions
        .receive(alicePk, new Sig(alice))
        .send(to, amount, { fee: 1000 });

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

// Mecenas has tx.age check omitted for testing
describe('Mecenas', () => {
  let mecenas: Instance;
  const pledge = 10000;
  beforeAll(() => {
    const Mecenas = Contract.import(path.join(__dirname, '..', 'fixture', 'mecenas.json'), 'testnet');
    mecenas = Mecenas.new(alicePkh, bobPkh, pledge);
  });

  describe('send', () => {
    it('should fail when trying to send more than pledge', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge + 10;

      // when
      const expectPromise = expect(
        mecenas.functions
          .receive(alicePk, new Sig(alice))
          .send(to, amount, { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when trying to send to wrong person', async () => {
      // given
      const to = bobAddress;
      const amount = pledge;

      // when
      const expectPromise = expect(
        mecenas.functions
          .receive(alicePk, new Sig(alice))
          .send(to, amount, { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when trying to send to multiple people', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const expectPromise = expect(
        mecenas.functions
          .receive(alicePk, new Sig(alice))
          .send([{ to, amount }, { to, amount }], { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should succeed when sending pledge to receiver', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const tx = await mecenas.functions
        .receive(alicePk, new Sig(alice))
        .send(to, amount, { fee: 1000 });

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
