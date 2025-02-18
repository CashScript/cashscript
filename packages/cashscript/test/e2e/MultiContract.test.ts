import {
  Contract,
  ElectrumNetworkProvider,
  FailedRequireError,
  MockNetworkProvider,
  SignatureTemplate,
  TransactionBuilder,
} from '../../src/index.js';
import {
  bobAddress,
  bobPkh,
  bobPriv,
  bobPub,
  carolPkh,
  carolPriv,
  carolPub,
} from '../fixture/vars.js';
import { Network } from '../../src/interfaces.js';
import { randomUtxo } from '../../src/utils.js';
import p2pkhArtifact from '../fixture/p2pkh.artifact.js';
import twtArtifact from '../fixture/transfer_with_timeout.artifact.js';
import { getTxOutputs } from '../test-util.js';

describe('Multi Contract', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);

  const bobSignatureTemplate = new SignatureTemplate(bobPriv);
  const carolSignatureTemplate = new SignatureTemplate(carolPriv);

  describe('Different instances of the same contract', () => {
    const p2pkhInstance1 = new Contract(p2pkhArtifact, [bobPkh], { provider });
    const p2pkhInstance2 = new Contract(p2pkhArtifact, [carolPkh], { provider });

    beforeAll(() => {
      // Note: We instantiate the contract with carolPkh to avoid mempool conflicts with other (P2PKH) tests
      console.log(p2pkhInstance1.tokenAddress);
      console.log(p2pkhInstance2.tokenAddress);
      (provider as any).addUtxo?.(p2pkhInstance1.address, randomUtxo());
      (provider as any).addUtxo?.(p2pkhInstance1.address, randomUtxo());
      (provider as any).addUtxo?.(p2pkhInstance2.address, randomUtxo());
      (provider as any).addUtxo?.(p2pkhInstance2.address, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());
    });

    it('should fail with correct errors when using incorrect unlocker for p2pkhInstance1', async () => {
      // given
      const to = p2pkhInstance1.address;
      const amount = 10000n;
      const p2pkhInstance1Utxos = await p2pkhInstance1.getUtxos();
      const p2pkhInstance2Utxos = await p2pkhInstance2.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(p2pkhInstance1Utxos[0], p2pkhInstance1.unlock.spend(carolPub, bobSignatureTemplate))
        .addInput(p2pkhInstance2Utxos[0], p2pkhInstance2.unlock.spend(carolPub, carolSignatureTemplate))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('P2PKH.cash:4 Require statement failed at input 0 in contract P2PKH.cash at line 4.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(hash160(pk) == pkh)');
    });

    it('should fail with correct errors when using incorrect unlocker for p2pkhInstance2', async () => {
      // given
      const to = p2pkhInstance1.address;
      const amount = 10000n;
      const p2pkhInstance1Utxos = await p2pkhInstance1.getUtxos();
      const p2pkhInstance2Utxos = await p2pkhInstance2.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        .addInput(p2pkhInstance1Utxos[0], p2pkhInstance1.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(p2pkhInstance2Utxos[0], p2pkhInstance2.unlock.spend(bobPub, carolSignatureTemplate))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      console.log(transaction.bitauthUri());

      const txPromise = transaction.send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('P2PKH.cash:4 Require statement failed at input 0 in contract P2PKH.cash at line 4.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(hash160(pk) == pkh)');
    });

    it.todo('should fail with correct errors when using incorrect unlocker for p2pkhInstance 1 and 2');

    it.todo('should fail with correct error when using incorrect unlocker for bobAddress');

    it('should succeed for correct unlockers (p2pkhInstance1 + p2pkhInstance2 + bobAddress)', async () => {
      // given
      const to = p2pkhInstance1.address;
      const amount = 10000n;
      const outputs = [{ to, amount }];
      const p2pkhInstance1Utxos = await p2pkhInstance1.getUtxos();
      const p2pkhInstance2Utxos = await p2pkhInstance2.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(p2pkhInstance1Utxos[0], p2pkhInstance1.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(p2pkhInstance2Utxos[0], p2pkhInstance2.unlock.spend(carolPub, carolSignatureTemplate))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });
  });

  describe('Different contracts', () => {
    const p2pkhContract = new Contract(p2pkhArtifact, [bobPkh], { provider });
    const twtContract = new Contract(twtArtifact, [bobPub, carolPub, 100000n], { provider });

    beforeAll(() => {
      console.log(p2pkhContract.tokenAddress);
      console.log(twtContract.tokenAddress);

      (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo());
      (provider as any).addUtxo?.(twtContract.address, randomUtxo());
    });

    it('should fail with correct errors when using incorrect unlocker for p2pkhContract', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const twtContractUtxos = await twtContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(carolPub, bobSignatureTemplate))
        .addInput(twtContractUtxos[0], twtContract.unlock.transfer(bobSignatureTemplate))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('P2PKH.cash:4 Require statement failed at input 0 in contract P2PKH.cash at line 4.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(hash160(pk) == pkh)');
    });

    it('should fail with correct errors when using incorrect unlocker for twtContract', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const twtContractUtxos = await twtContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(twtContractUtxos[0], twtContract.unlock.transfer(carolSignatureTemplate))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      console.log(transaction.bitauthUri());

      const txPromise = transaction.send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('TransferWithTimeout.cash:8 Require statement failed at input 1 in contract TransferWithTimeout.cash at line 8.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(checkSig(recipientSig, recipient))');
    });

  });
});

// TODO: Add test that introspects "sibling" UTXOs
