import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
  MockNetworkProvider,
  FailedRequireError,
  Utxo,
  TransactionBuilder,
} from '../../src/index.js';
import {
  alicePriv, alicePub, bobPriv, bobPub,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import twtArtifact from '../fixture/transfer_with_timeout.artifact.js';
import { randomUtxo } from '../../src/utils.js';

describe('TransferWithTimeout', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);
  const twtInstancePast = new Contract(twtArtifact, [alicePub, bobPub, 100000n], { provider });
  const twtInstanceFuture = new Contract(twtArtifact, [alicePub, bobPub, 2000000n], { provider });
  let twtPastUtxo: Utxo;
  let twtFutureUtxo: Utxo;

  beforeAll(() => {
    console.log(twtInstancePast.address);
    console.log(twtInstanceFuture.address);

    twtPastUtxo = randomUtxo();
    twtFutureUtxo = randomUtxo();
    (provider as any).addUtxo?.(twtInstancePast.address, twtPastUtxo);
    (provider as any).addUtxo?.(twtInstanceFuture.address, twtFutureUtxo);
  });

  describe('send', () => {
    it('should fail when signing transfer with incorrect private key', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(twtPastUtxo, twtInstancePast.unlock.transfer(new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
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
      const txPromise = new TransactionBuilder({ provider })
        .addInput(twtPastUtxo, twtInstancePast.unlock.timeout(new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
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
      const txPromise = new TransactionBuilder({ provider })
        .addInput(twtFutureUtxo, twtInstanceFuture.unlock.timeout(new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
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
      const tx = await new TransactionBuilder({ provider })
        .addInput(twtPastUtxo, twtInstancePast.unlock.transfer(new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
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
      const tx = await new TransactionBuilder({ provider })
        .addInput(twtFutureUtxo, twtInstanceFuture.unlock.transfer(new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
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
      const tx = await new TransactionBuilder({ provider })
        .addInput(twtPastUtxo, twtInstancePast.unlock.timeout(new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
        .setLocktime(1_000_000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
