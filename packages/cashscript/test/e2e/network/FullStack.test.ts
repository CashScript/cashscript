import BCHJS from '@psf/bch-js';
import { Contract, SignatureTemplate, FullStackNetworkProvider } from '../../../src/index.js';
import {
  alicePriv,
  bobPkh,
  bobPriv,
  bobPub,
} from '../../fixture/vars.js';
import { getTxOutputs } from '../../test-util.js';
import { FailedRequireError } from '../../../src/Errors.js';
import artifact from '../../fixture/p2pkh.json' with { type: 'json' };

if (!process.env.TESTS_USE_MOCKNET) {
  describe('test FullStackNetworkProvider', () => {
    const provider = new FullStackNetworkProvider('mainnet', new BCHJS({ restURL: 'https://api.fullstack.cash/v5/' }));

    describe('get utxos using FullStackNetworkProvider', () => {
      it('should get the utxos for a p2sh20 contract', async () => {
        // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
        const p2pkhInstance = new Contract(artifact, [bobPkh], { provider, addressType: 'p2sh20' });
        console.log(p2pkhInstance.address);

        const utxos = await p2pkhInstance.getUtxos();
        expect(Array.isArray(utxos)).toBe(true);
      });
      // Note: does not currently support p2sh32
      it.skip('should get the utxos for a p2sh32 contract', async () => {
        // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
        const p2pkhInstance = new Contract(artifact, [bobPkh], { provider, addressType: 'p2sh32' });
        console.log(p2pkhInstance.address);

        const utxos = await p2pkhInstance.getUtxos();
        expect(Array.isArray(utxos)).toBe(true);
      });
    });

    describe('send using FullStackNetworkProvider', () => {
      // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
      const p2pkhInstance = new Contract(artifact, [bobPkh], { provider, addressType: 'p2sh20' });
      console.log(p2pkhInstance.address);

      it('should fail when using incorrect function arguments', async () => {
        // given
        const to = p2pkhInstance.address;
        const amount = 10000n;

        // when
        const txPromise = p2pkhInstance.functions
          .spend(bobPub, new SignatureTemplate(alicePriv))
          .to(to, amount)
          .send();

        // then
        await expect(txPromise).rejects.toThrow(FailedRequireError);
        await expect(txPromise).rejects.toThrow('P2PKH.cash:5 Require statement failed at input 0 in contract P2PKH.cash at line 5.');
      });

      it('should succeed when using correct function arguments', async () => {
        // given
        const to = p2pkhInstance.address;
        const amount = 10000n;

        // when
        const tx = await p2pkhInstance.functions
          .spend(bobPub, new SignatureTemplate(bobPriv))
          .to(to, amount)
          .send();

        // then
        const txOutputs = getTxOutputs(tx, 'mainnet');
        expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
        expect(tx.txid).toBeDefined();
      });
    });
  });
}
