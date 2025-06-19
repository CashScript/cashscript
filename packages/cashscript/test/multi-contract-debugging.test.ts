import {
  Contract,
  MockNetworkProvider,
  randomUtxo,
  SignatureTemplate,
  TransactionBuilder,
} from '../src/index.js';
import {
  alicePkh,
  alicePriv,
  alicePub,
  bobAddress,
  bobPkh,
  bobPriv,
  bobPub,
} from './fixture/vars.js';
import p2pkhArtifact from './fixture/p2pkh.artifact.js';
import bigintArtifact from './fixture/bigint.artifact.js';
import '../src/test/JestExtensions.js';
import { ARTIFACT_FUNCTION_NAME_COLLISION, ARTIFACT_NAME_COLLISION, ARTIFACT_CONTRACT_NAME_COLLISION, ARTIFACT_SAME_NAME_DIFFERENT_PATH } from './fixture/debugging/multi_contract_debugging_contracts.js';
import { addressToLockScript } from '../src/utils.js';
import SiblingIntrospectionArtifact from './fixture/SiblingIntrospection.artifact.js';

const bobSignatureTemplate = new SignatureTemplate(bobPriv);

const provider = new MockNetworkProvider();

describe('Multi-Contract-Debugging tests', () => {
  describe('console.log statements', () => {
    describe('Sibling introspection', () => {
      const sameNameDifferentPathContract = new Contract(ARTIFACT_SAME_NAME_DIFFERENT_PATH, [0n], { provider });

      const expectedLockingBytecode = addressToLockScript(sameNameDifferentPathContract.address);
      const siblingIntrospectionContract = new Contract(
        SiblingIntrospectionArtifact,
        [expectedLockingBytecode],
        { provider },
      );

      const sameNameDifferentPathContractUtxo = randomUtxo();
      const siblingIntrospectionUtxo = randomUtxo();

      (provider as any).addUtxo?.(sameNameDifferentPathContract.address, sameNameDifferentPathContractUtxo);
      (provider as any).addUtxo?.(siblingIntrospectionContract.address, siblingIntrospectionUtxo);

      it('should log correct data in all executed console.log statements across all contracts in the correct order by input index', () => {
        const tx = new TransactionBuilder({ provider })
          .addInput(siblingIntrospectionUtxo, siblingIntrospectionContract.unlock.spend())
          .addInput(sameNameDifferentPathContractUtxo, sameNameDifferentPathContract.unlock.function_1(0n))
          .addOutput({ to: siblingIntrospectionContract.address, amount: siblingIntrospectionUtxo.satoshis })
          .addOutput({
            to: sameNameDifferentPathContract.address,
            amount: sameNameDifferentPathContractUtxo.satoshis - 2000n,
          });

        expect(tx).toLog('SiblingIntrospection.cash:6 outputBytecode: 0xaa2092e16594dd458916b3aa6cae4bf41352d1b3b39658698e8cddbeedd687efec7587\nSiblingIntrospection.cash:10 inputBytecode: 0xaa2092e16594dd458916b3aa6cae4bf41352d1b3b39658698e8cddbeedd687efec7587\nSameNameDifferentPath.cash:5 a is 0');
      });

      it('should log correct data for the reached console.log statements if a require statement fails, and not log unreached console.log statements', () => {
        const tx = new TransactionBuilder({ provider })
          .addInput(siblingIntrospectionUtxo, siblingIntrospectionContract.unlock.spend())
          .addInput(sameNameDifferentPathContractUtxo, sameNameDifferentPathContract.unlock.function_1(1n))
          .addOutput({ to: siblingIntrospectionContract.address, amount: siblingIntrospectionUtxo.satoshis })
          .addOutput({
            to: siblingIntrospectionContract.address,
            amount: sameNameDifferentPathContractUtxo.satoshis - 2000n,
          });

        expect(tx).toLog('SiblingIntrospection.cash:6 outputBytecode: 0xaa20d510df1721debb0d678d8e424b5f64f04f820005f017cb4731f7be94cd63755787');
        expect(tx).not.toLog('SiblingIntrospection.cash:10 inputBytecode: 0xaa2092e16594dd458916b3aa6cae4bf41352d1b3b39658698e8cddbeedd687efec7587');
        expect(tx).not.toLog('SameNameDifferentPath.cash:5 a is 0');
      });
    });

    it('should still work with different instances of the same contract, with different paths due to different contract parameter values', () => {
      const sameNameDifferentPathContract1 = new Contract(ARTIFACT_SAME_NAME_DIFFERENT_PATH, [0n], { provider });
      const sameNameDifferentPathContract2 = new Contract(ARTIFACT_SAME_NAME_DIFFERENT_PATH, [1n], { provider });

      const sameNameDifferentPathContract1Utxo = randomUtxo();
      const sameNameDifferentPathContract2Utxo = randomUtxo();

      (provider as any)?.addUtxo(sameNameDifferentPathContract1.address, sameNameDifferentPathContract1Utxo);
      (provider as any)?.addUtxo(sameNameDifferentPathContract2.address, sameNameDifferentPathContract2Utxo);

      const tx = new TransactionBuilder({ provider })
        .addInput(sameNameDifferentPathContract1Utxo, sameNameDifferentPathContract1.unlock.function_1(0n))
        .addInput(sameNameDifferentPathContract2Utxo, sameNameDifferentPathContract2.unlock.function_1(1n))
        .addOutput({ to: sameNameDifferentPathContract1.address, amount: sameNameDifferentPathContract1Utxo.satoshis })
        .addOutput({ to: sameNameDifferentPathContract2.address, amount: sameNameDifferentPathContract2Utxo.satoshis });

      expect(tx).toLog('SameNameDifferentPath.cash:5 a is 0\nSameNameDifferentPath.cash:8 a is not 0');
    });
  });

  describe('require statements', () => {
    it('should not throw an error if no require statement fails', async () => {
      const p2pkhContract = new Contract(p2pkhArtifact, [bobPkh], { provider });
      const bigintContract = new Contract(bigintArtifact, [], { provider });

      const MAX_INT64 = BigInt('9223372036854775807');

      (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo());
      (provider as any).addUtxo?.(bigintContract.address, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());

      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const bigIntContractUtxos = await bigintContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(bigIntContractUtxos[0], bigintContract.unlock.proofOfBigInt(MAX_INT64 + 1n, 1n))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      await expect(transaction).not.toFailRequire();
    });

    it('should fail with correct error message if a require statement fails in contract 1', async () => {
      const p2pkhContract = new Contract(p2pkhArtifact, [bobPkh], { provider });
      const bigintContract = new Contract(bigintArtifact, [], { provider });

      const MAX_INT64 = BigInt('9223372036854775807');

      (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo());
      (provider as any).addUtxo?.(bigintContract.address, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());

      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const bigIntContractUtxos = await bigintContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        // wrong public key
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(alicePub, bobSignatureTemplate))
        .addInput(bigIntContractUtxos[0], bigintContract.unlock.proofOfBigInt(MAX_INT64 + 1n, 1n))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      console.warn(transaction.bitauthUri());

      await expect(transaction).toFailRequireWith('P2PKH.cash:4 Require statement failed at input 0 in contract P2PKH.cash at line 4.');
    });

    it('should fail with correct error message if a require statement in contract 2', async () => {
      const p2pkhContract = new Contract(p2pkhArtifact, [bobPkh], { provider });
      const bigintContract = new Contract(bigintArtifact, [], { provider });

      (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo());
      (provider as any).addUtxo?.(bigintContract.address, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());

      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const bigIntContractUtxos = await bigintContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(bigIntContractUtxos[0], bigintContract.unlock.proofOfBigInt(1n, 1n))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      console.warn(transaction.bitauthUri());

      await expect(transaction).toFailRequireWith('BigInt.cash:4 Require statement failed at input 1 in contract BigInt.cash at line 4.');
    });

    it('should fail with correct error message when a final verify fails in contract 1', async () => {
      const p2pkhContract = new Contract(p2pkhArtifact, [bobPkh], { provider });
      const bigintContract = new Contract(bigintArtifact, [], { provider });

      const MAX_INT64 = BigInt('9223372036854775807');

      (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo());
      (provider as any).addUtxo?.(bigintContract.address, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());

      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const bigIntContractUtxos = await bigintContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(bobPub, Uint8Array.from(Array(0))))
        .addInput(bigIntContractUtxos[0], bigintContract.unlock.proofOfBigInt(MAX_INT64 + 1n, -1n))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      console.warn(transaction.bitauthUri());

      await expect(transaction).toFailRequireWith('P2PKH.cash:5 Require statement failed at input 0 in contract P2PKH.cash at line 5');
    });

    it('should fail with correct error message when a final verify fails in contract 2', async () => {
      const p2pkhContract = new Contract(p2pkhArtifact, [bobPkh], { provider });
      const bigintContract = new Contract(bigintArtifact, [], { provider });

      const MAX_INT64 = BigInt('9223372036854775807');

      (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo());
      (provider as any).addUtxo?.(bigintContract.address, randomUtxo());
      (provider as any).addUtxo?.(bobAddress, randomUtxo());

      const to = p2pkhContract.address;
      const amount = 10000n;
      const p2pkhContractUtxos = await p2pkhContract.getUtxos();
      const bigIntContractUtxos = await bigintContract.getUtxos();
      const bobAddressUtxos = await provider.getUtxos(bobAddress);

      // when
      const transaction = new TransactionBuilder({ provider })
        .addInput(p2pkhContractUtxos[0], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(bigIntContractUtxos[0], bigintContract.unlock.proofOfBigInt(MAX_INT64 + 1n, -1n))
        .addInput(bobAddressUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      console.warn(transaction.bitauthUri());

      await expect(transaction).toFailRequireWith('BigInt.cash');
    });

    describe('Sibling introspection', () => {
      const correctContract = new Contract(p2pkhArtifact, [alicePkh], { provider });
      const incorrectContract = new Contract(p2pkhArtifact, [bobPkh], { provider });

      const correctLockingBytecode = addressToLockScript(correctContract.address);
      const siblingIntrospectionContract = new Contract(
        SiblingIntrospectionArtifact,
        [correctLockingBytecode],
        { provider },
      );

      const correctContractUtxo = randomUtxo();
      const incorrectContractUtxo = randomUtxo();
      const siblingIntrospectionUtxo = randomUtxo();

      (provider as any).addUtxo?.(correctContract.address, correctContractUtxo);
      (provider as any).addUtxo?.(incorrectContract.address, incorrectContractUtxo);
      (provider as any).addUtxo?.(siblingIntrospectionContract.address, siblingIntrospectionUtxo);

      it('should not throw fail any require statements when introspecting correct sibling UTXOs', () => {
        const tx = new TransactionBuilder({ provider })
          .addInput(siblingIntrospectionUtxo, siblingIntrospectionContract.unlock.spend())
          .addInput(correctContractUtxo, correctContract.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
          .addOutput({ to: siblingIntrospectionContract.address, amount: siblingIntrospectionUtxo.satoshis })
          .addOutput({ to: correctContract.address, amount: correctContractUtxo.satoshis - 2000n });

        expect(tx).not.toFailRequire();
      });

      it('should fail with correct error message when introspected input bytecode of a sibling UTXO does not match', () => {
        const tx = new TransactionBuilder({ provider })
          .addInput(siblingIntrospectionUtxo, siblingIntrospectionContract.unlock.spend())
          .addInput(incorrectContractUtxo, incorrectContract.unlock.spend(bobPub, bobSignatureTemplate))
          .addOutput({ to: siblingIntrospectionContract.address, amount: siblingIntrospectionUtxo.satoshis })
          .addOutput({ to: correctContract.address, amount: incorrectContractUtxo.satoshis - 2000n });

        expect(tx).toFailRequireWith('SiblingIntrospection.cash:11 Require statement failed at input 0 in contract SiblingIntrospection.cash at line 11 with the following message: input bytecode should match.');
        expect(tx).toFailRequireWith('Failing statement: require(inputBytecode == expectedLockingBytecode, \'input bytecode should match\')');
      });

      it('should fail with correct error message when introspected output bytecode of a sibling UTXO does not match', () => {
        const tx = new TransactionBuilder({ provider })
          .addInput(siblingIntrospectionUtxo, siblingIntrospectionContract.unlock.spend())
          .addInput(correctContractUtxo, correctContract.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
          .addOutput({ to: siblingIntrospectionContract.address, amount: siblingIntrospectionUtxo.satoshis })
          .addOutput({ to: incorrectContract.address, amount: correctContractUtxo.satoshis - 2000n });

        expect(tx).toFailRequireWith('SiblingIntrospection.cash:7 Require statement failed at input 0 in contract SiblingIntrospection.cash at line 7 with the following message: output bytecode should match.');
        expect(tx).toFailRequireWith('Failing statement: require(outputBytecode == expectedLockingBytecode, \'output bytecode should match\')');
      });
    });

    it.todo('should still work with duplicate custom require messages across contracts');

    it('should still work if contract or function parameters have the same name across contracts', () => {
      const nameCollision = new Contract(ARTIFACT_NAME_COLLISION, [0n], { provider });
      const functionNameCollision = new Contract(ARTIFACT_FUNCTION_NAME_COLLISION, [1n], { provider });

      const nameCollisionUtxo = randomUtxo();
      const functionNameCollisionUtxo = randomUtxo();

      provider.addUtxo(nameCollision.address, nameCollisionUtxo);
      provider.addUtxo(functionNameCollision.address, functionNameCollisionUtxo);

      const transaction1 = new TransactionBuilder({ provider })
        .addInput(nameCollisionUtxo, nameCollision.unlock.name_collision(0n))
        .addInput(functionNameCollisionUtxo, functionNameCollision.unlock.name_collision(0n))
        .addOutput({ to: nameCollision.address, amount: 10000n });

      expect(transaction1).toFailRequireWith('FunctionNameCollision.cash:4 Require statement failed at input 1 in contract FunctionNameCollision.cash at line 4 with the following message: b should be 1.');

      const transaction2 = new TransactionBuilder({ provider })
        .addInput(nameCollisionUtxo, nameCollision.unlock.name_collision(1n))
        .addInput(functionNameCollisionUtxo, functionNameCollision.unlock.name_collision(1n))
        .addOutput({ to: nameCollision.address, amount: 10000n });

      expect(transaction2).toFailRequireWith('NameCollision.cash:5 Require statement failed at input 0 in contract NameCollision.cash at line 5 with the following message: b should be 0.');
    });

    it('should still work with different instances of the same contract, with different paths due to different constructor parameter values', () => {
      const p2pkhContract1 = new Contract(ARTIFACT_SAME_NAME_DIFFERENT_PATH, [0n], { provider });
      const p2pkhContract2 = new Contract(ARTIFACT_SAME_NAME_DIFFERENT_PATH, [1n], { provider });

      const contract1Utxo = randomUtxo();
      const contract2Utxo = randomUtxo();

      provider.addUtxo(p2pkhContract1.address, contract1Utxo);
      provider.addUtxo(p2pkhContract2.address, contract2Utxo);

      const transaction1 = new TransactionBuilder({ provider })
        .addInput(contract1Utxo, p2pkhContract1.unlock.function_1(0n))
        .addInput(contract2Utxo, p2pkhContract2.unlock.function_1(0n))
        .addOutput({ to: p2pkhContract1.address, amount: 10000n });

      expect(transaction1).toFailRequireWith('SameNameDifferentPath.cash:9 Require statement failed at input 1 in contract SameNameDifferentPath.cash at line 9 with the following message: b should not be 0.');

      const transaction2 = new TransactionBuilder({ provider })
        .addInput(contract1Utxo, p2pkhContract1.unlock.function_1(1n))
        .addInput(contract2Utxo, p2pkhContract2.unlock.function_1(1n))
        .addOutput({ to: p2pkhContract1.address, amount: 10000n });

      expect(transaction2).toFailRequireWith('SameNameDifferentPath.cash:6 Require statement failed at input 0 in contract SameNameDifferentPath.cash at line 6 with the following message: b should be 0.');
    });
  });

  describe('Non-require error messages', () => {
    it('should fail with the correct error message when there are name collisions on the contractName', () => {
      const nameCollision = new Contract(ARTIFACT_NAME_COLLISION, [0n], { provider });
      const contractNameCollision = new Contract(ARTIFACT_CONTRACT_NAME_COLLISION, [1n], { provider });

      const nameCollisionUtxo = randomUtxo();
      const contractNameCollisionUtxo = randomUtxo();

      provider.addUtxo(nameCollision.address, nameCollisionUtxo);
      provider.addUtxo(contractNameCollision.address, contractNameCollisionUtxo);

      const transaction = new TransactionBuilder({ provider })
        .addInput(nameCollisionUtxo, nameCollision.unlock.name_collision(0n))
        .addInput(contractNameCollisionUtxo, contractNameCollision.unlock.name_collision(0n))
        .addOutput({ to: nameCollision.address, amount: 10000n });

      expect(() => transaction.debug()).toThrow('There are multiple artifacts with the same contractName. Please make sure that all artifacts have unique names.');
    });

    it.todo('should fail with correct error message and statement when a multiline non-require statement fails');
  });
});
