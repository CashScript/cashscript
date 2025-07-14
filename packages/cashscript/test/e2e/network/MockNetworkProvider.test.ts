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
    provider.addUtxo(aliceAddress, randomUtxo({
      satoshis: 1100n,
    }));
    // add by locking bytecode
    provider.addUtxo(binToHex(addressToLockScript(p2pkhInstance.address)), randomUtxo({
      satoshis: 1100n,
    }));

    const aliceUtxos = await provider.getUtxos(aliceAddress);
    const p2pkhUtxos = await provider.getUtxos(p2pkhInstance.address);

    expect(aliceUtxos).toHaveLength(1);
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

    await expect(provider.sendRawTransaction(tx)).rejects.toThrow('txn-mempool-conflict');
  });
});
