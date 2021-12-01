import { Contract, ElectrumNetworkProvider } from '../../../src';
import { getTxOutputs } from '../../test-util';

describe('Simple Covenant', () => {
  let covenant: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/simple_covenant.json');
    const provider = new ElectrumNetworkProvider('staging');
    covenant = new Contract(artifact, [], provider);
    console.log(covenant.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const to = covenant.address;
      const amount = 1000;

      // when
      const tx = await covenant.functions.spend().to(to, amount).send();

      // then
      const txOutputs = getTxOutputs(tx, 'staging');
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
