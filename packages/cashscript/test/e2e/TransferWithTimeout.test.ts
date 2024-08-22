import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
  MockNetworkProvider,
  FailedRequireError,
} from '../../src/index.js';
import {
  alicePriv, alicePub, bobPriv, bobPub,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import artifact from '../fixture/transfer_with_timeout.json' assert { type: 'json' };
import { randomUtxo } from '../../src/utils.js';

describe('TransferWithTimeout', () => {
  let twtInstancePast: Contract;
  let twtInstanceFuture: Contract;

  beforeAll(() => {
    const provider = process.env.TESTS_USE_MOCKNET
      ? new MockNetworkProvider()
      : new ElectrumNetworkProvider(Network.CHIPNET);
    twtInstancePast = new Contract(artifact, [alicePub, bobPub, 100000n], { provider });
    twtInstanceFuture = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
    console.log(twtInstancePast.address);
    console.log(twtInstanceFuture.address);

    (provider as any).addUtxo?.(twtInstancePast.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstanceFuture.address, randomUtxo());
  });

  describe('send', () => {
    it('should fail when signing transfer with incorrect private key', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const txPromise = twtInstancePast.functions
        .transfer(new SignatureTemplate(alicePriv))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('TransferWithTimeout.cash:8 Require statement failed at input 0 in contract TransferWithTimeout.cash at line 8.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(checkSig(recipientSig, recipient))');
    });

    it('should fail when signing timeout with incorrect private key', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const txPromise = twtInstancePast.functions
        .timeout(new SignatureTemplate(bobPriv))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('TransferWithTimeout.cash:13 Require statement failed at input 0 in contract TransferWithTimeout.cash at line 13.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(checkSig(senderSig, sender))');
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
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('TransferWithTimeout.cash:14 Require statement failed at input 0 in contract TransferWithTimeout.cash at line 14.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.time >= timeout)');
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
