import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
  MockNetworkProvider,
  randomUtxo,
} from '../../src/index.js';
import {
  alicePriv, alicePub, bobPriv, bobPub,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { FailedSigCheckError, Reason, FailedTimeCheckError } from '../../src/Errors.js';
import artifact from '../fixture/transfer_with_timeout.json' assert { type: "json" };
import { toRegExp } from '../../src/utils.js';
import { AuthenticationErrorCommon } from '@bitauth/libauth';

describe('TransferWithTimeout', () => {
  let twtInstancePast: Contract;
  let twtInstanceFuture: Contract;

  beforeAll(() => {
    const provider = process.env.TESTS_USE_MOCKNET ? new MockNetworkProvider() : new ElectrumNetworkProvider(Network.CHIPNET);
    twtInstancePast = new Contract(artifact, [alicePub, bobPub, 100000n], { provider });
    twtInstanceFuture = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
    console.log(twtInstancePast.address);
    console.log(twtInstanceFuture.address);

    (provider as any).addUtxo?.(twtInstancePast.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstanceFuture.address, randomUtxo());
  });

  describe('send', () => {
    it('should fail when using incorrect function arguments to transfer', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const txPromise = twtInstancePast.functions
        .transfer(new SignatureTemplate(alicePriv))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(toRegExp([
        Reason.SIG_NULLFAIL,
        AuthenticationErrorCommon.nonNullSignatureFailure
      ]));
    });

    it('should fail when using incorrect function arguments to timeout', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const txPromise = twtInstancePast.functions
        .timeout(new SignatureTemplate(bobPriv))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(toRegExp([
        Reason.SIG_NULLFAIL,
        AuthenticationErrorCommon.nonNullSignatureFailure
      ]));
    });

    it('should fail when timeout is called before timeout block', async () => {
      // given
      const to = twtInstanceFuture.address;
      const amount = 10000n;

      // when
      const txPromise = twtInstanceFuture.functions
        .timeout(new SignatureTemplate(alicePriv))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedTimeCheckError);
      await expect(txPromise).rejects.toThrow(toRegExp([
        Reason.UNSATISFIED_LOCKTIME,
        AuthenticationErrorCommon.unsatisfiedLocktime
      ]));
    });

    it('should succeed when transfer is called after timeout block', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const tx = await twtInstancePast.functions
        .transfer(new SignatureTemplate(bobPriv))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when transfer is called before timeout block', async () => {
      // given
      const to = twtInstanceFuture.address;
      const amount = 10000n;

      // when
      const tx = await twtInstanceFuture.functions
        .transfer(new SignatureTemplate(bobPriv))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when timeout is called after timeout block', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const tx = await twtInstancePast.functions
        .timeout(new SignatureTemplate(alicePriv))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
