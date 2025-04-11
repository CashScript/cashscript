import {
  Contract,
  MockNetworkProvider,
  randomUtxo,
  SignatureTemplate,
  TransactionBuilder,
} from './../src/index.js';
import {
  alicePub,
  bobAddress,
  bobPkh,
  bobPriv,
  bobPub,
} from './fixture/vars.js';
import p2pkhArtifact from './fixture/p2pkh.artifact.js';
import bigintArtifact from './fixture/bigint.artifact.js';
import '../src/test/JestExtensions.js';

const bobSignatureTemplate = new SignatureTemplate(bobPriv);

const provider = new MockNetworkProvider();

describe('Multi-Contract-Debugging tests', () => {
  describe('require statements', () => {
    it('it should not throw an error if no require statement fails', async () => {
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

    it('it should fail with correct error message if a require statement fails in contract 1', async () => {
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

    it('it should fail with correct error message if a require statement in contract 2', async () => {
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

    it('it should fail with correct error message when a final verify fails in contract 1', async () => {
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

    it('it should fail with correct error message when a final verify fails in contract 2', async () => {
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
  });
});
