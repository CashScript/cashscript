import { randomUtxo, randomToken } from '../../src/utils.js';
import {
  Contract, ElectrumNetworkProvider, FailedRequireError, MockNetworkProvider,
} from '../../src/index.js';
import { Network, Utxo } from '../../src/interfaces.js';
import artifact from '../fixture/token_category_comparison.json' assert { type: 'json' };

describe('TokenCategoryCheck', () => {
  let tokenCategoryCheckInstance: Contract;

  beforeAll(() => {
    const provider = process.env.TESTS_USE_MOCKNET
      ? new MockNetworkProvider()
      : new ElectrumNetworkProvider(Network.CHIPNET);
    tokenCategoryCheckInstance = new Contract(artifact, [], { provider });
    console.log(tokenCategoryCheckInstance.tokenAddress);

    (provider as any).addUtxo?.(tokenCategoryCheckInstance.address, randomUtxo());
    (provider as any).addUtxo?.(tokenCategoryCheckInstance.address, randomUtxo());
    (provider as any).addUtxo?.(tokenCategoryCheckInstance.address, randomUtxo({
      satoshis: 1000n,
      token: randomToken(),
    }));
  });

  describe('send', () => {
    it('cannot send if the input at index 1 contains tokens', async () => {
      const contractUtxos = await tokenCategoryCheckInstance.getUtxos();
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxo = contractUtxos.find(isNonTokenUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      if (!nonTokenUtxo) {
        throw new Error('No non-token UTXOs found');
      }

      const to = tokenCategoryCheckInstance.tokenAddress;
      const amount = 1000n;
      const { token } = tokenUtxo;

      const txPromise = tokenCategoryCheckInstance.functions
        .send()
        .from(nonTokenUtxo)
        .from(tokenUtxo)
        .to(to, amount, token)
        .send();

      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Test.cash:3 Require statement failed at input 0 in contract Test.cash at line 3.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.inputs[1].tokenCategory == 0x)');
    });

    it('can send if the input at index 1 does not contain tokens', async () => {
      const contractUtxos = await tokenCategoryCheckInstance.getUtxos();
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (nonTokenUtxos.length < 2) {
        throw new Error('Less than two non-token UTXOs found');
      }

      const to = tokenCategoryCheckInstance.tokenAddress;
      const amount = 1000n;

      const txPromise = tokenCategoryCheckInstance.functions
        .send()
        .from(nonTokenUtxos[0])
        .from(nonTokenUtxos[1])
        .to(to, amount)
        .send();

      await expect(txPromise).resolves.toBeTruthy();
    });
  });
});

// We don't include UTXOs that contain BOTH fungible and non-fungible tokens
const isFungibleTokenUtxo = (utxo: Utxo): boolean => (
  utxo.token !== undefined && utxo.token.amount > 0n && utxo.token.nft === undefined
);

const isNonTokenUtxo = (utxo: Utxo): boolean => utxo.token === undefined;
