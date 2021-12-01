import { Contract, ElectrumNetworkProvider } from '../../../src';
import { getTxOutputs } from '../../test-util';
import { FailedRequireError, Reason } from '../../../src/Errors';
import { createOpReturnOutput } from '../../../src/utils';
import { aliceAddress } from '../../fixture/vars';

describe('Announcement', () => {
  let announcement: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/announcement.json');
    const provider = new ElectrumNetworkProvider('staging');
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
      const txPromise = announcement.functions
        .announce()
        .from(largestUtxo)
        .to(to, amount)
        .withHardcodedFee(1000)
        .withMinChange(1000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.NUMEQUALVERIFY);
    });

    it('should fail when trying to announce incorrect announcement', async () => {
      // given
      const str = 'A contract may injure a human being and, through inaction, allow a human being to come to harm.';
      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);

      // when
      const txPromise = announcement.functions
        .announce()
        .from(largestUtxo)
        .withOpReturn(['0x6d02', str])
        .withHardcodedFee(1000)
        .withMinChange(1000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when sending incorrect amount of change', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);

      // when
      const txPromise = announcement.functions
        .announce()
        .from(largestUtxo)
        .withOpReturn(['0x6d02', str])
        .withHardcodedFee(2000)
        .withMinChange(1000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.NUMEQUALVERIFY);
    });

    it('should fail when sending the correct change amount to an incorrect address', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);
      const changeAmount = (await announcement.getBalance()) - 1000;

      // when
      const txPromise = announcement.functions
        .announce()
        .from(largestUtxo)
        .withOpReturn(['0x6d02', str])
        .to(aliceAddress, changeAmount)
        .withHardcodedFee(1000)
        .withoutChange()
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should succeed when announcing correct announcement', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const largestUtxo = (await announcement.getUtxos())
        .sort((a, b) => b.satoshis - a.satoshis)
        .slice(0, 1);

      // when
      const tx = await announcement.functions
        .announce()
        .from(largestUtxo)
        .withOpReturn(['0x6d02', str])
        .withHardcodedFee(1000)
        .withMinChange(1000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([createOpReturnOutput(['0x6d02', str])]));
    });
  });
});
