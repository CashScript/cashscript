import { Contract, SignatureTemplate, BitboxNetworkProvider } from '../../src';
import { alicePk, alice } from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';
import { createOpReturnOutput } from '../../src/util';

describe('BoundedBytes', () => {
  let bbInstance: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/bounded_bytes.json');
    const provider = new BitboxNetworkProvider();
    bbInstance = new Contract(artifact, provider, []);
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
  let covenant: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/simple_covenant.json');
    const provider = new BitboxNetworkProvider();
    covenant = new Contract(artifact, provider, []);
    console.log(covenant.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const to = covenant.address;
      const amount = 1000;

      // when
      const tx = await covenant.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

describe.skip('P2Palindrome', () => {
  let p2palindrome: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/p2palindrome.json');
    const provider = new BitboxNetworkProvider();
    p2palindrome = new Contract(artifact, provider, []);
    console.log(p2palindrome.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const opReturn = ['0x6d02', 'A man, a plan, a canal, Panama!'];

      // when
      const tx = await p2palindrome.functions
        .spend('amanaplanacanalpanama')
        .withOpReturn(opReturn)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toContainEqual(createOpReturnOutput(opReturn));
    });
  });
});
