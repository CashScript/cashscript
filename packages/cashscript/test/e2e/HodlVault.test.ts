import {
  Contract,
  SignatureTemplate,
  MockNetworkProvider,
  ElectrumNetworkProvider,
  Network,
} from '../../src/index.js';
import {
  alicePriv,
  alicePub,
  oracle,
  oraclePub,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { FailedRequireError } from '../../src/Errors.js';
import artifact from '../fixture/hodl_vault.json' assert { type: 'json' };
import { randomUtxo } from '../../src/utils.js';

describe('HodlVault', () => {
  let hodlVault: Contract;

  beforeAll(() => {
    const provider = process.env.TESTS_USE_MOCKNET
      ? new MockNetworkProvider()
      : new ElectrumNetworkProvider(Network.CHIPNET);
    hodlVault = new Contract(artifact, [alicePub, oraclePub, 99000n, 30000n], { provider });
    console.log(hodlVault.address);
    (provider as any).addUtxo?.(hodlVault.address, randomUtxo());
  });

  describe('send', () => {
    it('should fail when oracle sig is incorrect', async () => {
      // given
      const message = oracle.createMessage(100000n, 30000n);
      const wrongMessage = oracle.createMessage(100000n, 30001n);
      const wrongSig = oracle.signMessage(wrongMessage);
      const to = hodlVault.address;
      const amount = 10000n;

      // when
      const txPromise = hodlVault.functions
        .spend(new SignatureTemplate(alicePriv), wrongSig, message)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('HodlVault.cash:26 Require statement failed at input 0 in contract HodlVault.cash at line 26.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(checkDataSig(oracleSig, oracleMessage, oraclePk))');
    });

    it('should fail when price is too low', async () => {
      // given
      const message = oracle.createMessage(100000n, 29900n);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000n;

      // when
      const txPromise = hodlVault.functions
        .spend(new SignatureTemplate(alicePriv), oracleSig, message)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('HodlVault.cash:23 Require statement failed at input 0 in contract HodlVault.cash at line 23.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(price >= priceTarget)');
    });

    it('should succeed when price is high enough', async () => {
      // given
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000n;

      // when
      const tx = await hodlVault.functions
        .spend(new SignatureTemplate(alicePriv), oracleSig, message)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
