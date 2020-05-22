import path from 'path';
import { Contract, Instance, Sig } from '../../src';
import {
  alicePk,
  alice,
  network,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';
import { createOpReturnOutput } from '../../src/util';

describe('BoundedBytes', () => {
  let bbInstance: Instance;
  beforeAll(() => {
    const BoundedBytes = Contract.import(path.join(__dirname, '..', 'fixture', 'bounded_bytes.json'), network);
    bbInstance = BoundedBytes.new();
    console.log(bbInstance.address);
  });

  describe('send', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const to = bbInstance.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        bbInstance.functions
          .spend(Buffer.from('12345678', 'hex'), 1000)
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EVAL_FALSE);

      // when
      const expectPromise2 = expect(
        bbInstance.functions
          .spend(Buffer.from('000003e8', 'hex'), 1000)
          .to(to, amount)
          .send(),
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
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

describe('Simple Covenant', () => {
  let covenant: Instance;
  beforeAll(() => {
    const Covenant = Contract.import(path.join(__dirname, '..', 'fixture', 'simple_covenant.json'), network);
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
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

describe('P2Palindrome', () => {
  let p2palindrome: Instance;
  beforeAll(() => {
    const P2Palindrome = Contract.import(path.join(__dirname, '..', 'fixture', 'p2palindrome.json'), network);
    p2palindrome = P2Palindrome.new();
    console.log(p2palindrome.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const opReturn = ['0x6d02', 'A man, a plan, a canal, Panama!'];

      // when
      const tx = await p2palindrome.functions
        .spend('amanaplanacanalpanama')
        .withOpReturn(['0x6d02', 'A man, a plan, a canal, Panama!'])
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toContainEqual(createOpReturnOutput(opReturn));
    });
  });
});
