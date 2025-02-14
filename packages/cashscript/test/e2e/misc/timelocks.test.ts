import { Contract, SignatureTemplate, ElectrumNetworkProvider, MockNetworkProvider } from '../../../src/index.js';
import {
  bobAddress,
  bobPub,
  carolPkh,
  carolPub,
  carolAddress,
  carolPriv,
} from '../../fixture/vars.js';
import { Network } from '../../../src/interfaces.js';
import { utxoComparator, calculateDust, randomUtxo, isNonTokenUtxo } from '../../../src/utils.js';
import p2pkhArtifact from '../../fixture/p2pkh.json' with { type: 'json' };
import twtArtifact from '../../fixture/transfer_with_timeout.json' with { type: 'json' };
import { TransactionBuilder } from '../../../src/TransactionBuilder.js';
import { getTxOutputs } from '../../test-util.js';

const describeOrSkip = process.env.TESTS_USE_MOCKNET ? describe.skip : describe;

describe('Timelocks', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);

  let p2pkhInstance: Contract;
  let twtInstance: Contract;

  beforeAll(() => {
    // Note: We instantiate the contract with carolPkh to avoid mempool conflicts with other (P2PKH) tests
    p2pkhInstance = new Contract(p2pkhArtifact, [carolPkh], { provider });
    twtInstance = new Contract(twtArtifact, [bobPub, carolPub, 100000n], { provider });
    console.log(p2pkhInstance.tokenAddress);
    console.log(twtInstance.tokenAddress);
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstance.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstance.address, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(carolAddress, randomUtxo());
    (provider as any).addUtxo?.(carolAddress, randomUtxo());
  });

  describeOrSkip('Locktime', () => {
    it('should fail when locktime is higher than current block height', async () => {
      const fee = 1000n;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      const blockHeight = await provider.getBlockHeight();

      const txPromise = new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .setLocktime(blockHeight + 100)
        .send();

      await expect(txPromise).rejects.toThrow(/non-final transaction/);
    });

    it('should succeed when locktime is lower than current block height', async () => {
      const fee = 1000n;
      const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

      const amount = p2pkhUtxos[0].satoshis - fee;
      const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

      if (amount < dustAmount) {
        throw new Error('Not enough funds to send transaction');
      }

      const blockHeight = await provider.getBlockHeight();

      const tx = await new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .setLocktime(blockHeight - 100)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to: p2pkhInstance.address, amount }]));
    });
  });

  // bip68 relative timelock
  it.todo('test sequence numbers');
  // Get utxo age on chipnet with provider.performRequest('blockchain.utxo.get_info', utxo.txid, utxo.vout);
});
