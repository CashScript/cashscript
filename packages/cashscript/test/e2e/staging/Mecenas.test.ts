import { Contract, ElectrumNetworkProvider } from '../../../src';
import {
  alicePkh,
  bobPkh,
  aliceAddress,
  bobAddress,
} from '../../fixture/vars';
import { getTxOutputs } from '../../test-util';
import { FailedRequireError, Reason } from '../../../src/Errors';

// Mecenas has tx.age check omitted for testing
describe('Mecenas', () => {
  let mecenas: Contract;
  const pledge = 10000;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/mecenas.json');
    const provider = new ElectrumNetworkProvider('staging');
    mecenas = new Contract(artifact, [alicePkh, bobPkh, pledge], provider);
    console.log(mecenas.address);
  });

  describe('send', () => {
    it('should fail when trying to send more than pledge', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge + 10;

      // when
      const txPromise = mecenas.functions
        .receive()
        .to(to, amount)
        .withHardcodedFee(1000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.NUMEQUALVERIFY);
    });

    it('should fail when trying to send to wrong person', async () => {
      // given
      const to = bobAddress;
      const amount = pledge;

      // when
      const txPromise = mecenas.functions
        .receive()
        .to(to, amount)
        .withHardcodedFee(1000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when trying to send to multiple people', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const txPromise = mecenas.functions
        .receive()
        .to(to, amount)
        .to(to, amount)
        .withHardcodedFee(1000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.EQUALVERIFY);
    });


    it('should fail when sending incorrect amount of change', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const txPromise = mecenas.functions
        .receive()
        .to(to, amount)
        .withHardcodedFee(2000)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.NUMEQUALVERIFY);
    });

    it('should succeed when sending pledge to receiver', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const tx = await mecenas.functions
        .receive()
        .to(to, amount)
        .withHardcodedFee(1000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
