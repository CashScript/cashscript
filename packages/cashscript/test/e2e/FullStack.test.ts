import BCHJS from '@psf/bch-js';
import { Contract, SignatureTemplate, FullStackNetworkProvider } from '../../src/index.js';
import {
  alicePriv,
  bobPkh,
  bobPriv,
  bobPub,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { FailedSigCheckError, Reason } from '../../src/Errors.js';
import artifact from '../fixture/p2pkh.json' assert { type: "json" };

describe.skip('P2PKH (using FullStackNetworkProvider)', () => {
  let p2pkhInstance: Contract;

  beforeAll(() => {
    const provider = new FullStackNetworkProvider('mainnet', new BCHJS({ restURL: 'https://free-main.fullstack.cash/v5/' }));
    // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other tests
    p2pkhInstance = new Contract(artifact, [bobPkh], { provider });
    console.log(p2pkhInstance.address);
  });

  describe('send', () => {
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
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(Reason.SIG_NULLFAIL);
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
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
      expect(tx.txid).toBeDefined();
    });
  });
});
