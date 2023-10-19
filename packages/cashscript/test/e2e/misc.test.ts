import { Contract, ElectrumNetworkProvider, Network } from '../../src/index.js';
import { getTxOutputs } from '../test-util.js';
import artifact from '../fixture/simple_covenant.json' assert { type: "json" };

describe('Simple Covenant', () => {
  const provider = new ElectrumNetworkProvider(Network.CHIPNET);
  let covenant: Contract;

  beforeAll(() => {
    covenant = new Contract(artifact, [], { provider });
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

    it('should succeed with bip68 relative timelock', async () => {
      // given
      const to = covenant.address;
      const amount = 1000n;

      const utxos = await covenant.getUtxos();

      const utxo0Info: any = await provider.performRequest('blockchain.utxo.get_info', utxos[0].txid, utxos[0].vout);
      const utxo1Info: any = await provider.performRequest('blockchain.utxo.get_info', utxos[1].txid, utxos[1].vout);
      const currentBlockHeight = await provider.getBlockHeight();

      const age = Math.max(utxo0Info.confirmed_height, utxo1Info.confirmed_height) - currentBlockHeight;

      // when
      const tx = await covenant.functions.spend()
        .from(utxos[0])
        .from(utxos[1])
        .to(to, amount)
        .withAge(age)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
