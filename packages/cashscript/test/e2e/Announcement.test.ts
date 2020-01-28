import path from 'path';
import { Contract, Instance, Sig } from '../../src';
import { getTxOutputs } from '../test-util';
import { FailedRequireError, Reason } from '../../src/Errors';
import { createOpReturnOutput } from '../../src/util';
import { alicePk, alice } from '../fixture/vars';

describe('Announcement', () => {
  let announcement: Instance;
  beforeAll(() => {
    const Announcement = Contract.import(path.join(__dirname, '..', 'fixture', 'announcement.json'), 'testnet');
    announcement = Announcement.new();
    console.log(announcement.address);
  });

  describe('send', () => {
    it('should fail when trying to send money', async () => {
      // given
      const to = announcement.address;
      const amount = 10;

      // when
      const expectPromise = expect(
        announcement.functions
          .announce(alicePk, new Sig(alice))
          .send(to, amount, { fee: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when trying to announce incorrect announcement', async () => {
      // given
      const str = 'A contract may injure a human being and, through inaction, allow a human being to come to harm.';

      // when
      const expectPromise = expect(
        announcement.functions
          .announce(alicePk, new Sig(alice))
          .send([{ opReturn: ['0x6d02', str] }], { fee: 1000, minChange: 1000 }),
      );

      // then
      await expectPromise.rejects.toThrow(FailedRequireError);
      await expectPromise.rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should succeed when announcing correct announcement', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';

      // when
      const tx = await announcement.functions
        .announce(alicePk, new Sig(alice))
        .send([{ opReturn: ['0x6d02', str] }], { fee: 1000, minChange: 1000 });

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([createOpReturnOutput({ opReturn: ['0x6d02', str] })]));
    });
  });
});
