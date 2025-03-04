import { describeOrSkip } from '../../../test/test-util.js';
import { ElectrumNetworkProvider, Network } from '../../../src/index.js';

describeOrSkip(!process.env.TESTS_USE_MOCKNET, 'ElectrumNetworkProvider', () => {
  // TODO: Test more of the API
  it('should be able to request data', async () => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    const blockHeight = await provider.getBlockHeight();
    expect(blockHeight).toBeDefined();
  });

  it('should be able to handle multiple concurrent requests', async () => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);

    const transactionPromise = provider.getRawTransaction('d72923b7cf345d2a90f951d66f437d4fbb941fcbd87bb54d8d88e51ecb3e3b9f');
    const blockHeightPromise = provider.getBlockHeight();

    const transaction = await transactionPromise;
    const blockHeight = await blockHeightPromise;

    expect(blockHeight).toBeDefined();
    expect(transaction).toBeDefined();
  });
});

