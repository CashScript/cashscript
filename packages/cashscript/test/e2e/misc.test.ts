import path from 'path';
import { Contract, Instance, Sig } from '../../src';
import {
  alicePk,
  alice,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';

describe('BoundedBytes', () => {
  let bbInstance: Instance;
  beforeAll(() => {
    const BoundedBytes = Contract.import(path.join(__dirname, '..', 'fixture', 'bounded_bytes.json'), 'testnet');
    bbInstance = BoundedBytes.new();
    console.log(bbInstance.address);
  });

  describe('send (to one)', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const to = bbInstance.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        bbInstance.functions
          .spend(Buffer.from('12345678', 'hex'), 1000)
          .send(to, amount),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EVAL_FALSE);

      // when
      const expectPromise2 = expect(
        bbInstance.functions
          .spend(Buffer.from('000003e8', 'hex'), 1000)
          .send(to, amount),
      );

      // then
      await expectPromise2.rejects.toThrow(FailedRequireError);
      await expectPromise2.rejects.toThrow(Reason.EVAL_FALSE);
    });

    it('should succeed when using correct function parameters', async () => {
      // given
      const to = bbInstance.address;
      const amount = 10000;

      // when
      const tx = await bbInstance.functions
        .spend(Buffer.from('e8030000', 'hex'), 1000)
        .send(to, amount);

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

describe('Simple Covenant', () => {
  let covenant: Instance;
  beforeAll(() => {
    const Covenant = Contract.import(path.join(__dirname, '..', 'fixture', 'simple_covenant.json'), 'testnet');
    covenant = Covenant.new();
    console.log(covenant.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const to = covenant.address;
      const amount = 1000;

      // when
      const tx = await covenant.functions
        .spend(alicePk, new Sig(alice))
        .send(to, amount);

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
