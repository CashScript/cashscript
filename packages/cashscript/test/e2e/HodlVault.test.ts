import { Contract, SignatureTemplate, BitboxNetworkProvider } from '../../src';
import {
  alicePk,
  alice,
  oraclePk,
  oracle,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';

describe('HodlVault', () => {
  let hodlVault: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/hodl_vault.json');
    const provider = new BitboxNetworkProvider();
    hodlVault = new Contract(artifact, provider, [alicePk, oraclePk, 597000, 30000]);
    console.log(hodlVault.address);
  });

  describe('send', () => {
    it('should fail when oracle sig is incorrect', async () => {
      // given
      const message = oracle.createMessage(600000, 1000);
      const wrongMessage = oracle.createMessage(600000, 1001);
      const wrongSig = oracle.signMessage(wrongMessage);
      const to = hodlVault.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        hodlVault.functions
          .spend(new SignatureTemplate(alice), wrongSig, message)
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.VERIFY);
    });

    it('should fail when price is too low', async () => {
      // given
      const message = oracle.createMessage(600000, 29900);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        hodlVault.functions
          .spend(new SignatureTemplate(alice), oracleSig, message)
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.VERIFY);
    });

    it('should succeed when price is high enough', async () => {
      // given
      const message = oracle.createMessage(600000, 30000);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000;

      // when
      const tx = await hodlVault.functions
        .spend(new SignatureTemplate(alice), oracleSig, message)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
