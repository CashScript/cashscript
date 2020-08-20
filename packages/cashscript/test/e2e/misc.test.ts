import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src';
import { alicePk, alice } from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { createOpReturnOutput } from '../../src/util';

describe('Simple Covenant', () => {
  let covenant: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/simple_covenant.json');
    const provider = new ElectrumNetworkProvider();
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
    const provider = new ElectrumNetworkProvider();
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
