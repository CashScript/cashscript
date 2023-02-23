import { Contract, ElectrumNetworkProvider, Network } from '../../src/index.js';
import { getTxOutputs } from '../test-util.js';
import artifact from '../fixture/simple_covenant.json' assert { type: "json" };

describe('Simple Covenant', () => {
  let covenant: Contract;

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    covenant = new Contract(artifact, [], provider);
    console.log(covenant.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const to = covenant.address;
      const amount = 1000n;

      // when
      const tx = await covenant.functions.spend().to(to, amount).send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
