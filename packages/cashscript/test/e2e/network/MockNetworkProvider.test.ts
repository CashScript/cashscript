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
import { itOrSkip } from '../../test-util.js';

describe('Transaction Builder', () => {
  const provider = new MockNetworkProvider();

  let p2pkhInstance: Contract<typeof p2pkhArtifact>;

  beforeAll(() => {
    p2pkhInstance = new Contract(p2pkhArtifact, [alicePkh], { provider });
  });

  beforeEach(() => {
    provider.reset();
  });

  itOrSkip(!process.env.TESTS_USE_MOCKNET, 'MockNetworkProvider should keep track of utxo set - remove spent utxos and add newly created', async () => {
    expect(await provider.getUtxos(aliceAddress)).toHaveLength(0);
    expect(await provider.getUtxos(p2pkhInstance.address)).toHaveLength(0);

    // add by address
    provider.addUtxo(aliceAddress, randomUtxo());
    // add by locking bytecode
    provider.addUtxo(binToHex(addressToLockScript(p2pkhInstance.address)), randomUtxo());

    const aliceUtxos = await provider.getUtxos(aliceAddress);
    const p2pkhUtxos = await provider.getUtxos(p2pkhInstance.address);

    expect(aliceUtxos).toHaveLength(1);
    expect(p2pkhUtxos).toHaveLength(1);

    const sigTemplate = new SignatureTemplate(alicePriv);

    // spend both utxos to bob
    new TransactionBuilder({provider})
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(alicePub, sigTemplate))
      .addInput(aliceUtxos[0], sigTemplate.unlockP2PKH())
      .addOutput({ to: bobAddress, amount: 1000n })
      .send();

    // utxos should be removed from the provider
    expect(await provider.getUtxos(aliceAddress)).toHaveLength(0);
    expect(await provider.getUtxos(p2pkhInstance.address)).toHaveLength(0);

    // utxo should be added to bob
    expect(await provider.getUtxos(bobAddress)).toHaveLength(1);
  });
});
