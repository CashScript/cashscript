import { Contract, SignatureTemplate, FullStackNetworkProvider } from '../../src';
import {
  alicePkh,
  alicePk,
  alice,
  bob,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { Network } from '../../src/interfaces';
import { FailedSigCheckError, Reason } from '../../src/Errors';

const BCHJS = require('@psf/bch-js');

describe('P2PKH (using FullStackNetworkProvider)', () => {
  let p2pkhInstance: Contract;
  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/p2pkh.json');
    const provider = new FullStackNetworkProvider(Network.MAINNET, new BCHJS({ restURL: 'https://free-main.fullstack.cash/v3/' }));
    p2pkhInstance = new Contract(artifact, [alicePkh], provider);
    console.log(p2pkhInstance.address);
  });

  describe('send', () => {
    it('should fail when using incorrect function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        p2pkhInstance.functions
          .spend(alicePk, new SignatureTemplate(bob))
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedSigCheckError);
      await expectPromise.rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should succeed when using correct function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000;

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
