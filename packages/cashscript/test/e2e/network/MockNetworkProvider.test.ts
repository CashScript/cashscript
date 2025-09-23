import { binToHex } from '@bitauth/libauth';
import { Contract, MockNetworkProvider, SignatureTemplate } from '../../../src/index.js';
import { TransactionBuilder } from '../../../src/TransactionBuilder.js';
import { addressToLockScript, randomUtxo } from '../../../src/utils.js';
import p2pkhArtifact from '../../fixture/p2pkh.artifact.js';
import {
  aliceAddress,
  alicePkh,
  alicePriv,
  alicePub,
  bobAddress,
} from '../../fixture/vars.js';
import { describeOrSkip } from '../../test-util.js';

describeOrSkip(!process.env.TESTS_USE_CHIPNET, 'MockNetworkProvider', () => {
  describe('when updateUtxoSet is default (true)', () => {
    const provider = new MockNetworkProvider();

    let p2pkhInstance: Contract<typeof p2pkhArtifact>;

    beforeAll(() => {
      p2pkhInstance = new Contract(p2pkhArtifact, [alicePkh], { provider });
    });

    beforeEach(() => {
      provider.reset();
    });

    it('should keep track of utxo set changes', async () => {
      expect(await provider.getUtxos(aliceAddress)).toHaveLength(0);
      expect(await provider.getUtxos(p2pkhInstance.address)).toHaveLength(0);

      // add by address & locking bytecode
      provider.addUtxo(aliceAddress, randomUtxo({ satoshis: 1100n }));
      provider.addUtxo(binToHex(addressToLockScript(p2pkhInstance.address)), randomUtxo({ satoshis: 1100n }));

      const aliceUtxos = await provider.getUtxos(aliceAddress);
      const bobUtxos = await provider.getUtxos(bobAddress);
      const p2pkhUtxos = await provider.getUtxos(p2pkhInstance.address);

      expect(aliceUtxos).toHaveLength(1);
      expect(bobUtxos).toHaveLength(0);
      expect(p2pkhUtxos).toHaveLength(1);

      const sigTemplate = new SignatureTemplate(alicePriv);

      // spend both utxos to bob
      const builder = new TransactionBuilder({ provider })
        .addInputs(p2pkhUtxos, p2pkhInstance.unlock.spend(alicePub, sigTemplate))
        .addInputs(aliceUtxos, sigTemplate.unlockP2PKH())
        .addOutput({ to: bobAddress, amount: 2000n });

      const tx = builder.build();

      // try to send invalid transaction
      await expect(provider.sendRawTransaction(tx.slice(0, -2))).rejects.toThrow('Error reading transaction.');

      // send valid transaction
      await expect(provider.sendRawTransaction(tx)).resolves.not.toThrow();

      // utxos should be removed from the provider
      expect(await provider.getUtxos(aliceAddress)).toHaveLength(0);
      expect(await provider.getUtxos(p2pkhInstance.address)).toHaveLength(0);

      // utxo should be added to bob
      expect(await provider.getUtxos(bobAddress)).toHaveLength(1);

      await expect(provider.sendRawTransaction(tx)).rejects.toThrow('already submitted');
    });
  });

  describe('when updateUtxoSet is set to false', () => {
    const provider = new MockNetworkProvider({ updateUtxoSet: false });

    let p2pkhInstance: Contract<typeof p2pkhArtifact>;

    beforeAll(() => {
      p2pkhInstance = new Contract(p2pkhArtifact, [alicePkh], { provider });
    });

    beforeEach(() => {
      provider.reset();
    });

    it('should not keep track of utxo set changes', async () => {
      expect(await provider.getUtxos(aliceAddress)).toHaveLength(0);
      expect(await provider.getUtxos(p2pkhInstance.address)).toHaveLength(0);

      // add by address & locking bytecode
      provider.addUtxo(aliceAddress, randomUtxo({ satoshis: 1100n }));
      provider.addUtxo(binToHex(addressToLockScript(p2pkhInstance.address)), randomUtxo({ satoshis: 1100n }));

      const aliceUtxos = await provider.getUtxos(aliceAddress);
      const bobUtxos = await provider.getUtxos(bobAddress);
      const p2pkhUtxos = await provider.getUtxos(p2pkhInstance.address);

      expect(aliceUtxos).toHaveLength(1);
      expect(bobUtxos).toHaveLength(0);
      expect(p2pkhUtxos).toHaveLength(1);

      const sigTemplate = new SignatureTemplate(alicePriv);

      // spend both utxos to bob
      const builder = new TransactionBuilder({ provider })
        .addInputs(p2pkhUtxos, p2pkhInstance.unlock.spend(alicePub, sigTemplate))
        .addInputs(aliceUtxos, sigTemplate.unlockP2PKH())
        .addOutput({ to: bobAddress, amount: 2000n });

      const tx = builder.build();

      await expect(provider.sendRawTransaction(tx)).resolves.not.toThrow();

      // utxos should not be removed from the provider
      expect(await provider.getUtxos(aliceAddress)).toHaveLength(1);
      expect(await provider.getUtxos(bobAddress)).toHaveLength(0);
      expect(await provider.getUtxos(p2pkhInstance.address)).toHaveLength(1);
    });
  });
});
