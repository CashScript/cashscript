import { randomUtxo, randomToken } from '../../src/utils.js';
import {
  Contract, ElectrumNetworkProvider, FailedRequireError, MockNetworkProvider,
  TransactionBuilder,
} from '../../src/index.js';
import { Network, Utxo } from '../../src/interfaces.js';
import artifact from '../fixture/token_category_comparison.json' with { type: 'json' };

describe('TokenCategoryCheck', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);
  const checkTokenCategoryContract = new Contract(artifact, [], { provider });
  let contractTokenUtxo: Utxo;
  let contractBchUtxo0: Utxo;
  let contractBchUtxo1: Utxo;

  beforeAll(() => {
    console.log(checkTokenCategoryContract.tokenAddress);
    contractTokenUtxo = randomUtxo({
      satoshis: 1000n,
      token: randomToken(),
    });
    contractBchUtxo0 = randomUtxo();
    contractBchUtxo1 = randomUtxo();

    (provider as any).addUtxo?.(checkTokenCategoryContract.address, contractTokenUtxo);
    (provider as any).addUtxo?.(checkTokenCategoryContract.address, contractBchUtxo0);
    (provider as any).addUtxo?.(checkTokenCategoryContract.address, contractBchUtxo1);
  });

  describe('send', () => {
    it('cannot send if the input at index 1 contains tokens', async () => {
      const to = checkTokenCategoryContract.tokenAddress;
      const amount = 1000n;
      const { token } = contractTokenUtxo;

      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractBchUtxo0, checkTokenCategoryContract.unlock.send())
        .addInput(contractTokenUtxo, checkTokenCategoryContract.unlock.send())
        .addOutput({ to, amount, token })
        .send();

      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Test.cash:3 Require statement failed at input 0 in contract Test.cash at line 3.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.inputs[1].tokenCategory == 0x)');
    });

    it('can send if the input at index 1 does not contain tokens', async () => {
      const to = checkTokenCategoryContract.tokenAddress;
      const amount = 1000n;

      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractBchUtxo0, checkTokenCategoryContract.unlock.send())
        .addInput(contractBchUtxo1, checkTokenCategoryContract.unlock.send())
        .addOutput({ to, amount })
        .send();

      await expect(txPromise).resolves.toBeTruthy();
    });
  });
});

