import { Contract, ElectrumNetworkProvider, MockNetworkProvider } from '../../src/index.js';
import {
  bobAddress,
  bobPub,
  carolPkh,
  carolPub,
  carolAddress,
} from '../fixture/vars.js';
import { Network } from '../../src/interfaces.js';
import { randomUtxo } from '../../src/utils.js';
import p2pkhArtifact from '../fixture/p2pkh.json' with { type: 'json' };
import twtArtifact from '../fixture/transfer_with_timeout.json' with { type: 'json' };

describe('Multi Contract', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);

  let p2pkhInstance: Contract;
  let twtInstance: Contract;

  beforeAll(() => {
    // Note: We instantiate the contract with carolPkh to avoid mempool conflicts with other (P2PKH) tests
    p2pkhInstance = new Contract(p2pkhArtifact, [carolPkh], { provider });
    twtInstance = new Contract(twtArtifact, [bobPub, carolPub, 100000n], { provider });
    console.log(p2pkhInstance.tokenAddress);
    console.log(twtInstance.tokenAddress);
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstance.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstance.address, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(carolAddress, randomUtxo());
    (provider as any).addUtxo?.(carolAddress, randomUtxo());
  });

  it.todo('Add some tests for smart contract failures');
});
