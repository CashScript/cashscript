import { generateLibauthSourceOutputs } from 'cashscript/dist/utils.js';
import { HashType, MockNetworkProvider, SignatureAlgorithm, SignatureTemplate, TransactionBuilder } from '../src/index.js';
import { aliceAddress, alicePriv, alicePub, aliceWif } from './fixture/vars.js';
import { binToHex, hexToBin } from '@bitauth/libauth';

describe('SignatureTemplate', () => {
  describe('constructor', () => {
    it('should properly convert different signer formats to raw private key', () => {
      const mockKeyPair = { toWIF: () => aliceWif };
      const fromKeyPair = new SignatureTemplate(mockKeyPair);
      const from0xHex = new SignatureTemplate(`0x${binToHex(alicePriv)}`);
      const fromHex = new SignatureTemplate(binToHex(alicePriv));
      const fromWif = new SignatureTemplate(aliceWif);
      const fromPriv = new SignatureTemplate(alicePriv);
      expect(fromKeyPair.privateKey).toEqual(alicePriv);
      expect(from0xHex.privateKey).toEqual(alicePriv);
      expect(fromHex.privateKey).toEqual(alicePriv);
      expect(fromWif.privateKey).toEqual(alicePriv);
      expect(fromPriv.privateKey).toEqual(alicePriv);
    });
  });

  describe('generateSignature', () => {
    it('should generate a correct signature using Schnorr', () => {
      const signatureTemplate = new SignatureTemplate(alicePriv);
      const signature = signatureTemplate.generateSignature(hexToBin('0000000000000000000000'));
      expect(signature).toEqual(hexToBin('bcac180e17de108003cce026708bd2af54b860dad2626cee157f4ed5abd993b9085d615015f905978adc51e8878226280ddd27d899f086519c0978e53332d79961'));
    });

    it('should generate a correct signature using ECDSA', () => {
      const signatureTemplate = new SignatureTemplate(alicePriv, undefined, SignatureAlgorithm.ECDSA);
      const signature = signatureTemplate.generateSignature(hexToBin('0000000000000000000000'));
      expect(signature).toEqual(hexToBin('3045022100fa1d6a159a124e99479f78152422d55ff3c16f7fac5ae47fa291907f8f47613f02200d6c906f667b3712860b6f5a1f296ecb7dcd44da83c6a1eb45869b61c6b8dadb61'));
    });

    it('should append the correct hash type when fork ID is true', () => {
      const signatureTemplate = new SignatureTemplate(alicePriv, HashType.SIGHASH_SINGLE);
      const signature = signatureTemplate.generateSignature(hexToBin('0000000000000000000000'), true);
      expect(signature).toEqual(hexToBin('bcac180e17de108003cce026708bd2af54b860dad2626cee157f4ed5abd993b9085d615015f905978adc51e8878226280ddd27d899f086519c0978e53332d79943'));
    });

    it('should append the correct hash type when fork ID is false', () => {
      const signatureTemplate = new SignatureTemplate(alicePriv, HashType.SIGHASH_SINGLE);
      const signature = signatureTemplate.generateSignature(hexToBin('0000000000000000000000'), false);
      expect(signature).toEqual(hexToBin('bcac180e17de108003cce026708bd2af54b860dad2626cee157f4ed5abd993b9085d615015f905978adc51e8878226280ddd27d899f086519c0978e53332d79903'));
    });
  });

  describe('getPublicKey', () => {
    it('should generate a correct public key', () => {
      const signatureTemplate = new SignatureTemplate(alicePriv);
      expect(signatureTemplate.getPublicKey()).toEqual(alicePub);
    });
  });

  describe('unlockP2PKH', () => {
    it('should generate a correct unlocker', () => {
      const utxo = {
        txid: '043ec3826702c45460a6dd6b13e343a8f1bc06bc047b63ca484f791dfdfd92c2',
        vout: 8,
        satoshis: 109759n,
      };

      const signatureTemplate = new SignatureTemplate(alicePriv);
      const unlocker = signatureTemplate.unlockP2PKH();

      expect(unlocker.generateLockingBytecode()).toEqual(hexToBin('76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac'));

      const transactionBuilder = new TransactionBuilder({ provider: new MockNetworkProvider() })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 1000n });

      const transaction = transactionBuilder.buildLibauthTransaction();
      const sourceOutputs = generateLibauthSourceOutputs(transactionBuilder.inputs);

      expect(unlocker.generateUnlockingBytecode({ transaction, sourceOutputs, inputIndex: 0 }))
        .toEqual(hexToBin('415cbd7f111be33daa9578ed7ace1b6721a5d14206302c628b1bfc27cfef92a334943504089731b7ce10173be7f22dc175f6d10c8c5a3d1b41a64db09555ebb00d61210373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088'));
    });
  });
});
