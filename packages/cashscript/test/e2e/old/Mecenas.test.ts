import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
  HashType,
} from '../../../src/index.js';
import {
  alicePkh,
  bobPkh,
  aliceAddress,
  bobAddress,
  alicePub,
  alicePriv,
} from '../../fixture/vars.js';
import { getTxOutputs } from '../../test-util.js';
import { FailedTransactionError } from '../../../src/Errors.js';
import artifact from '../../fixture/old/mecenas.json' assert { type: 'json' };

if (!process.env.TESTS_USE_MOCKNET) {
// Mecenas has tx.age check omitted for testing
  describe('v0.6.0 - Mecenas', () => {
    let mecenas: Contract;
    const pledge = 10000n;
    const minerFee = 1000n;

    beforeAll(() => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const addressType = 'p2sh20';
      mecenas = new Contract(artifact, [alicePkh, bobPkh, pledge], { provider, addressType });
      console.log(mecenas.address);
    });

    describe('send', () => {
      it('should fail when trying to send more than pledge', async () => {
      // given
        const to = aliceAddress;
        const amount = pledge + 10n;

        // when
        const txPromise = mecenas.functions
          .receive(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL))
          .to(to, amount)
          .withHardcodedFee(minerFee)
          .send();

        // then
        await expect(txPromise).rejects.toThrow(FailedTransactionError);
        await expect(txPromise).rejects.toThrow('Script failed an OP_EQUALVERIFY operation');
      });

      it('should fail when trying to send to wrong person', async () => {
      // given
        const to = bobAddress;
        const amount = pledge;

        // when
        const txPromise = mecenas.functions
          .receive(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL))
          .to(to, amount)
          .withHardcodedFee(minerFee)
          .send();

        // then
        await expect(txPromise).rejects.toThrow(FailedTransactionError);
        await expect(txPromise).rejects.toThrow('Script failed an OP_EQUALVERIFY operation');
      });

      it('should fail when trying to send to multiple people', async () => {
      // given
        const to = aliceAddress;
        const amount = pledge;

        // when
        const txPromise = mecenas.functions
          .receive(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL))
          .to(to, amount)
          .to(to, amount)
          .withHardcodedFee(minerFee)
          .send();

        // then
        await expect(txPromise).rejects.toThrow(FailedTransactionError);
        await expect(txPromise).rejects.toThrow('Script failed an OP_EQUALVERIFY operation');
      });

      it('should succeed when sending pledge to receiver', async () => {
      // given
        const to = aliceAddress;
        const amount = pledge;

        // when
        const tx = await mecenas.functions
          .receive(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL))
          .to(to, amount)
          .withHardcodedFee(minerFee)
          .send();

        // then
        const txOutputs = getTxOutputs(tx);
        expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
      });
    });
  });
} else {
  test.skip('skip', () => {});
}
