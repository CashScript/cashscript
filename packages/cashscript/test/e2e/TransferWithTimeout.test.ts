import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
  MockNetworkProvider,
  FailedRequireError,
  TransactionBuilder,
} from '../../src/index.js';
import {
  alicePriv, alicePub, bobPriv, bobPub,
} from '../fixture/vars.js';
import { gatherUtxos, getTxOutputs } from '../test-util.js';
import twtArtifact from '../fixture/transfer_with_timeout.artifact.js';
import { randomUtxo } from '../../src/utils.js';

describe('TransferWithTimeout', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);
  const twtInstancePast = new Contract(twtArtifact, [alicePub, bobPub, 100000n], { provider });
  const twtInstanceFuture = new Contract(twtArtifact, [alicePub, bobPub, 2000000n], { provider });

  beforeAll(() => {
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
      const { utxos, changeAmount } = gatherUtxos(await twtInstancePast.getUtxos(), { amount, fee: 2000n });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, twtInstancePast.unlock.transfer(new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
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
      const { utxos, changeAmount } = gatherUtxos(await twtInstancePast.getUtxos(), { amount, fee: 2000n });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, twtInstancePast.unlock.timeout(new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
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
      const { utxos, changeAmount } = gatherUtxos(await twtInstanceFuture.getUtxos(), { amount, fee: 2000n });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, twtInstanceFuture.unlock.timeout(new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
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
      const { utxos, changeAmount } = gatherUtxos(await twtInstancePast.getUtxos(), { amount, fee: 2000n });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, twtInstancePast.unlock.transfer(new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when transfer is called before timeout block', async () => {
      // given
      const to = twtInstanceFuture.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await twtInstanceFuture.getUtxos(), { amount, fee: 2000n });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, twtInstanceFuture.unlock.transfer(new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when timeout is called after timeout block', async () => {
      // given
      const to = twtInstancePast.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await twtInstancePast.getUtxos(), { amount, fee: 2000n });
      const blockHeight = await provider.getBlockHeight();

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, twtInstancePast.unlock.timeout(new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .setLocktime(blockHeight)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
