import {
  Contract,
  ElectrumNetworkProvider,
  MockNetworkProvider,
  replaceArtifactPlaceholders,
  SignatureTemplate,
  TransactionBuilder
} from '../../src/index.js';
import { Network } from '../../src/interfaces.js';
import Multisig_2of3Artifact from '../fixture/Multisig_2of3.artifact.js';
import { alicePriv, alicePub, bobPriv, bobPub, carolPub } from '../fixture/vars.js';
import { gatherUtxos } from '../test-util.js';

// A 2 of 3 multisig contract compatible with ElectronCash multisig wallets
describe('Multisig_2of3 placeholder artifact tests', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);
  let multisig_2of3: Contract<typeof Multisig_2of3Artifact>;

  beforeEach(() => {
    const artifact = replaceArtifactPlaceholders(Multisig_2of3Artifact, {
      pubkeyA: alicePub,
      pubkeyB: bobPub,
      pubkeyC: carolPub,
    });

    multisig_2of3 = new Contract(artifact, [], { provider, ignoreFunctionSelector: true, addressType: 'p2sh20' });
  });

  it('spend', async () => {
    const to = multisig_2of3.address;
    const amount = 1000n;
    const { utxos, changeAmount } = gatherUtxos(await multisig_2of3.getUtxos(), { amount });

    // when
    const txPromise = new TransactionBuilder({ provider })
      .addInputs(utxos, multisig_2of3.unlock.spend(new SignatureTemplate(alicePriv), new SignatureTemplate(bobPriv), BigInt(0b110)))
      .addOutput({ to, amount: changeAmount })
      .send();

    await expect(txPromise).resolves.not.toThrow();
  });

  it('wrong checkbits', async () => {
    const to = multisig_2of3.address;
    const amount = 1000n;
    const { utxos, changeAmount } = gatherUtxos(await multisig_2of3.getUtxos(), { amount });

    // when
    const txPromise = new TransactionBuilder({ provider })
      .addInputs(utxos, multisig_2of3.unlock.spend(new SignatureTemplate(alicePriv), new SignatureTemplate(bobPriv), BigInt(0b011)))
      .addOutput({ to, amount: changeAmount })
      .send();

    await expect(txPromise).rejects.toThrow();
  });
});
