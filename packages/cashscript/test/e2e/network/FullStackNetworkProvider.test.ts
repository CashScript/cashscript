import BCHJS from '@psf/bch-js';
import { Contract, SignatureTemplate, FullStackNetworkProvider, TransactionBuilder } from '../../../src/index.js';
import {
  alicePriv,
  bobPkh,
  bobPriv,
  bobPub,
} from '../../fixture/vars.js';
import { describeOrSkip, gatherUtxos, getTxOutputs } from '../../test-util.js';
import { FailedRequireError } from '../../../src/Errors.js';
import artifact from '../../fixture/p2pkh.artifact.js';

describeOrSkip(Boolean(process.env.TESTS_USE_CHIPNET), 'FullStackNetworkProvider', () => {
  const provider = new FullStackNetworkProvider('mainnet', new BCHJS({ restURL: 'https://api.fullstack.cash/v5/' }));

  describe('get utxos using FullStackNetworkProvider', () => {
    it('should get the utxos for a p2sh20 contract', async () => {
      // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
      const p2pkhInstance = new Contract(artifact, [bobPkh], { provider, addressType: 'p2sh20' });
      console.log(p2pkhInstance.address);

      const utxos = await p2pkhInstance.getUtxos();
      expect(Array.isArray(utxos)).toBe(true);
    });
    it('should get the utxos for a p2sh32 contract', async () => {
      // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
      const p2pkhInstance = new Contract(artifact, [bobPkh], { provider, addressType: 'p2sh32' });
      console.log(p2pkhInstance.address);

      const utxos = await p2pkhInstance.getUtxos();
      expect(Array.isArray(utxos)).toBe(true);
    });
  });

  describe('send using FullStackNetworkProvider', () => {
    // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
    // Using p2sh20 address because it is funded on mainnet
    const p2pkhInstance = new Contract(artifact, [bobPkh], { provider, addressType: 'p2sh20' });
    console.log(p2pkhInstance.address);

    it('should fail when using incorrect function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhInstance.getUtxos(), { amount });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhInstance.unlock.spend(bobPub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('P2PKH.cash:5 Require statement failed at input 0 in contract P2PKH.cash at line 5.');
    });

    it('should succeed when using correct function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhInstance.getUtxos(), { amount });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhInstance.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx, 'mainnet');
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
      expect(tx.txid).toBeDefined();
    });
  });
});
