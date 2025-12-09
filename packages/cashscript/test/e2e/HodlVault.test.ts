import {
  Contract,
  SignatureTemplate,
  MockNetworkProvider,
  ElectrumNetworkProvider,
  Network,
  TransactionBuilder,
  SignatureAlgorithm,
  HashType,
} from '../../src/index.js';
import {
  alicePriv,
  alicePub,
  oracle,
  oraclePub,
} from '../fixture/vars.js';
import { gatherUtxos, getTxOutputs, itOrSkip } from '../test-util.js';
import { FailedRequireError } from '../../src/Errors.js';
import artifact from '../fixture/hodl_vault.artifact.js';
import { randomUtxo } from '../../src/utils.js';
import { placeholder } from '@cashscript/utils';


describe('HodlVault', () => {
  const provider = process.env.TESTS_USE_CHIPNET
    ? new ElectrumNetworkProvider(Network.CHIPNET)
    : new MockNetworkProvider();

  const hodlVault = new Contract(artifact, [alicePub, oraclePub, 99000n, 30000n], { provider });

  beforeAll(() => {
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
      const { utxos, changeAmount } = gatherUtxos(await hodlVault.getUtxos(), { amount, fee: 2000n });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(new SignatureTemplate(alicePriv), wrongSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
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
      const { utxos, changeAmount } = gatherUtxos(await hodlVault.getUtxos(), { amount, fee: 2000n });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(new SignatureTemplate(alicePriv), oracleSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
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
      const { utxos, changeAmount } = gatherUtxos(await hodlVault.getUtxos(), { amount, fee: 2000n });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(new SignatureTemplate(alicePriv), oracleSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should succeed when price is high enough, ECDSA sig and datasig', async () => {
      // given
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message, SignatureAlgorithm.ECDSA);
      const to = hodlVault.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await hodlVault.getUtxos(), { amount, fee: 2000n });

      const signatureTemplate = new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL, SignatureAlgorithm.ECDSA);

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(signatureTemplate, oracleSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    itOrSkip(!Boolean(process.env.TESTS_USE_CHIPNET), 'should succeed with precomputed ECDSA signature', async () => {
      // given
      const cleanProvider = new MockNetworkProvider();
      const contract = new Contract(artifact, [alicePub, oraclePub, 99000n, 30000n], { provider: cleanProvider });
      cleanProvider.addUtxo(contract.address, {
        satoshis: 100000n,
        txid: '11'.repeat(32),
        vout: 0,
      });
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message, SignatureAlgorithm.ECDSA);
      const to = contract.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await contract.getUtxos(), { amount, fee: 2000n });
      const signature = '3045022100aa004a425c0c911594c0333164f990c760991b7f84272f35d98c9c6617d9c53602207dfe4729224d4e61496dff11963982cf79f05d623a6e4004b5f50b7cefa7175241';

      // when
      const tx = await new TransactionBuilder({ provider: cleanProvider })
        .addInputs(utxos, contract.unlock.spend(signature, oracleSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should fail to accept wrong signature lengths', async () => {
      // given
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message, SignatureAlgorithm.ECDSA);
      const to = hodlVault.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await hodlVault.getUtxos(), { amount, fee: 2000n });

      // sig: unlocker should throw when given an improper length
      expect(() => hodlVault.unlock.spend(placeholder(100), oracleSig, message)).toThrow("Found type 'bytes100' where type 'sig' was expected");

      // sig: unlocker should not throw when given a proper length, but transaction should fail on invalid sig
      // Note that this fails with "FailedTransactionEvaluationError" because an invalid signature encoding is NOT a failed
      // require statement
      await expect(new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(placeholder(71), oracleSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send()).rejects.toThrow('HodlVault.cash:27 Error in transaction at input 0 in contract HodlVault.cash at line 27');

      // sig: unlocker should not throw when given an empty byte array, but transaction should fail on require statement
      // Note that this fails with "FailedRequireError" because a zero-length signature IS a failed require statement
      await expect(new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(placeholder(0), oracleSig, message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send()).rejects.toThrow('HodlVault.cash:27 Require statement failed at input 0 in contract HodlVault.cash at line 27');

      // datasig: unlocker should throw when given an improper length
      const signatureTemplate = new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL, SignatureAlgorithm.ECDSA);
      expect(() => hodlVault.unlock.spend(signatureTemplate, placeholder(100), message)).toThrow("Found type 'bytes100' where type 'datasig' was expected");

      // datasig: unlocker should not throw when given a proper length, but transaction should fail on invalid sig
      // TODO: This somehow fails with "FailedRequireError" instead of "FailedTransactionEvaluationError", check why
      await expect(new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(signatureTemplate, placeholder(64), message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send()).rejects.toThrow('HodlVault.cash:26 Require statement failed at input 0 in contract HodlVault.cash at line 26');

      // datasig: unlocker should not throw when given an empty byte array, but transaction should fail on require statement
      // Note that this fails with "FailedRequireError" because a zero-length signature IS a failed require statement
      await expect(new TransactionBuilder({ provider })
        .addInputs(utxos, hodlVault.unlock.spend(signatureTemplate, placeholder(0), message))
        .addOutput({ to: to, amount: amount })
        .addOutput({ to: to, amount: changeAmount })
        .setLocktime(100_000)
        .send()).rejects.toThrow('HodlVault.cash:26 Require statement failed at input 0 in contract HodlVault.cash at line 26');
    });
  });
});
