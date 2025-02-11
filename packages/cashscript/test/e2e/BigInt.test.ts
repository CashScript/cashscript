import {
  Contract,
  MockNetworkProvider,
  FailedRequireError,
  ElectrumNetworkProvider,
  Network,
  Utxo,
  TransactionBuilder,
} from '../../src/index.js';
import artifact from '../fixture/bigint.artifact.js';
import { randomUtxo } from '../../src/utils.js';

describe('BigInt', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);
  const bigintContract = new Contract(artifact, [], { provider });
  const MAX_INT64 = BigInt('9223372036854775807');
  let contractUtxo: Utxo;

  beforeAll(() => {
    console.log(bigintContract.address);
    contractUtxo = randomUtxo();
    (provider as any).addUtxo?.(bigintContract.address, contractUtxo);
  });

  describe('proofOfBigInt', () => {
    it('should fail require statement when providing a number that fits within 64 bits', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000n;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, bigintContract.unlock.proofOfBigInt(MAX_INT64, 10n))
        .addOutput({ to, amount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('BigInt.cash:4 Require statement failed at input 0 in contract BigInt.cash at line 4');
      await expect(txPromise).rejects.toThrow('Failing statement: require(x >= maxInt64PlusOne)');
    });

    it('should succeed when providing numbers that are larger than 64 bits when multiplied', async () => {
      // given
      const to = bigintContract.address;
      const amount = 1000n;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, bigintContract.unlock.proofOfBigInt(MAX_INT64 * 2n, MAX_INT64 + 2n))
        .addOutput({ to, amount })
        .send();

      // then
      await expect(txPromise).resolves.not.toThrow();
    });

    it.todo('should fail when contract exceeds the maximum compute budget');
  });
});
