import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../../dist/main/index.js';
import {
  alicePk,
  alice,
  alicePkh,
  bobPkh,
  aliceAddress,
  bobAddress,
} from '../../fixture/vars';
import { getTxOutputs } from '../../test-util';
import { FailedRequireError, Reason } from '../../../dist/main/Errors.js';

// Mecenas has tx.age check omitted for testing
describe('v0.6.0 - Mecenas', () => {
  let mecenas: Contract;
  const pledge = 10000;
  const minerFee = 1000;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../../fixture/old/mecenas.json');
    const provider = new ElectrumNetworkProvider();
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
        .receive(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .withHardcodedFee(minerFee)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should fail when trying to send to wrong person', async () => {
      // given
      const to = bobAddress;
      const amount = pledge;

      // when
      const txPromise = mecenas.functions
        .receive(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .withHardcodedFee(minerFee)
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
        .receive(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .to(to, amount)
        .withHardcodedFee(minerFee)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.EQUALVERIFY);
    });

    it('should succeed when sending pledge to receiver', async () => {
      // given
      const to = aliceAddress;
      const amount = pledge;

      // when
      const tx = await mecenas.functions
        .receive(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .withHardcodedFee(minerFee)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
