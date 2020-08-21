import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';
import { createOpReturnOutput } from '../../src/util';
import { alicePk, alice } from '../fixture/vars';

describe('Announcement', () => {
  let announcement: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/announcement.json');
    const provider = new ElectrumNetworkProvider();
    announcement = new Contract(artifact, [], provider);
    console.log(announcement.address);
  });

  describe('send', () => {
    it('should fail when trying to send money', async () => {
      // given
      const to = announcement.address;
      const amount = 1000;

      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);

      // when
      const expectPromise = expect(
        announcement.functions
          .announce(alicePk, new SignatureTemplate(alice))
          .from(largestUtxo)
          .to(to, amount)
          .withHardcodedFee(2000)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when trying to announce incorrect announcement', async () => {
      // given
      const str = 'A contract may injure a human being and, through inaction, allow a human being to come to harm.';
      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);

      // when
      const expectPromise = expect(
        announcement.functions
          .announce(alicePk, new SignatureTemplate(alice))
          .from(largestUtxo)
          .withOpReturn(['0x6d02', str])
          .withHardcodedFee(2000)
          .withMinChange(1000)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should succeed when announcing correct announcement', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);

      // when
      const tx = await announcement.functions
        .announce(alicePk, new SignatureTemplate(alice))
        .from(largestUtxo)
        .withOpReturn(['0x6d02', str])
        .withHardcodedFee(2000)
        .withMinChange(1000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([createOpReturnOutput(['0x6d02', str])]));
    });
  });
});
