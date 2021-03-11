import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src';
import {
  alicePk,
  alice,
  alicePkh,
  bobPkh,
  aliceAddress,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { createOpReturnOutput } from '../../src/utils';

describe('Simple Covenant', () => {
  let covenant: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/simple_covenant.json');
    const provider = new ElectrumNetworkProvider();
    covenant = new Contract(artifact, [], provider);
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

describe('Bytecode VarInt Border Mecenas', () => {
  let mecenas: Contract;
  const pledge = 10000;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/mecenas_border.json');
    const provider = new ElectrumNetworkProvider();
    mecenas = new Contract(artifact, [alicePkh, bobPkh, pledge], provider);
    console.log(mecenas.address);
  });

  it('should succeed when sending pledge to receiver', async () => {
    // given
    const to = aliceAddress;
    const amount = pledge;

    // when
    const tx = await mecenas.functions
      .receive(alicePk, new SignatureTemplate(alice))
      .to(to, amount)
      .withHardcodedFee(1000)
      .send();

    // then
    const txOutputs = getTxOutputs(tx);
    expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
  });
});

describe.skip('P2Palindrome', () => {
  let p2palindrome: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/p2palindrome.json');
    const provider = new ElectrumNetworkProvider();
    p2palindrome = new Contract(artifact, [], provider);
    console.log(p2palindrome.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const opReturn = ['0x6d02', 'A man, a plan, a canal, Panama!'];

      // when
      const tx = await p2palindrome.functions
        // cspell:disable-next-line
        .spend('amanaplanacanalpanama')
        .withOpReturn(opReturn)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toContainEqual(createOpReturnOutput(opReturn));
    });
  });
});
