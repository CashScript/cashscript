import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../../src/index.js';
import {
  alicePk,
  alice,
  alicePkh,
  bobPkh,
  aliceAddress,
} from '../../fixture/vars.js';
import { getTxOutputs } from '../../test-util.js';

describe('v0.6.0 - Simple Covenant', () => {
  let covenant: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/old/simple_covenant.json');
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

describe('v0.6.0 - Bytecode VarInt Border Mecenas', () => {
  let mecenas: Contract;
  const pledge = 10000;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/old/mecenas_border.json');
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
