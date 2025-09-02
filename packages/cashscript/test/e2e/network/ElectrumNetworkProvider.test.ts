import { ElectrumNetworkProvider, Network } from '../../../src/index.js';
import { ElectrumClient } from '@electrum-cash/network';

describe.runIf(Boolean(process.env.TESTS_USE_CHIPNET))('ElectrumNetworkProvider', () => {
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

  it('should be able to pass in a custom electrum client', async () => {
    const electrum = new ElectrumClient('CashScript Application', '1.4.1', 'chipnet.bch.ninja');
    const provider = new ElectrumNetworkProvider(Network.CHIPNET, { electrum });
    const blockHeight = await provider.getBlockHeight();
    expect(blockHeight).toBeDefined();
  });

  it('should be able to pass in a custom host name', async () => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET, { hostname: 'chipnet.bch.ninja' });
    const blockHeight = await provider.getBlockHeight();
    expect(blockHeight).toBeDefined();
  });

  describe('manual connection management', () => {
    it('should throw an error if trying to use connect/disconnect without specifying manualConnectionManagement', async () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      expect(provider.connect()).rejects.toThrow('Manual connection management is disabled');
    });

    it('should throw an error if client is not connected', async () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET, { manualConnectionManagement: true });
      expect(provider.getBlockHeight()).rejects.toThrow('Unable to send request to a disconnected server');
    });

    it('should be able to send requests after connecting', async () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET, { manualConnectionManagement: true });

      await provider.connect();
      const blockHeight = await provider.getBlockHeight();
      await provider.disconnect();

      expect(blockHeight).toBeDefined();
    });
  });
});

