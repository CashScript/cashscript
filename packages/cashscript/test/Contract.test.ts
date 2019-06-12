import { assert } from 'chai';
import * as path from 'path';
import { Contract, Artifacts } from '../src';

describe('Contract', () => {
  describe('fromCashFile', () => {
    it('should fail for invalid .cash file', () => {
      assert.throws(() => {
        Contract.fromCashFile(path.join(__dirname, 'fixture', 'p2pkh-invalid.cash'));
      });
    });

    it('should create P2PKH Contract object', () => {
      const P2PKH = Contract.fromCashFile(path.join(__dirname, 'fixture', 'p2pkh.cash'));
      const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', 'p2pkh.json'));

      // Disregard updatedAt & networks
      expectedArtifact.updatedAt = P2PKH.artifact.updatedAt;
      expectedArtifact.networks = P2PKH.artifact.networks;
      assert.deepEqual(P2PKH.artifact, expectedArtifact);
    });

    it('should create TransferWithTimeout Contract object', () => {
      const TransferWithTimeout = Contract.fromCashFile(path.join(__dirname, 'fixture', 'transfer_with_timeout.cash'));
      const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'));

      // Disregard updatedAt & networks
      expectedArtifact.updatedAt = TransferWithTimeout.artifact.updatedAt;
      expectedArtifact.networks = TransferWithTimeout.artifact.networks;
      assert.deepEqual(TransferWithTimeout.artifact, expectedArtifact);
    });
  });
  describe('fromArtifact', () => {
    it('should fail with invalid Artifact file', () => {
      assert.throws(() => {
        Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh-invalid.json'));
      });
    });
    it('should create P2PKH Contract object', () => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'));
      const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', 'p2pkh.json'));

      assert.deepEqual(P2PKH.artifact, expectedArtifact);
    });

    it('should create TransferWithTimeout Contract object', () => {
      const TransferWithTimeout = Contract.fromArtifact(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'));
      const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'));

      assert.deepEqual(TransferWithTimeout.artifact, expectedArtifact);
    });
  });
  describe('new', () => {
    it('should fail with incorrect constructor parameters', () => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'));

      assert.throws(() => {
        P2PKH.new();
      });
      assert.throws(() => {
        P2PKH.new(20);
      });
      assert.throws(() => {
        P2PKH.new(Buffer.alloc(20, 0), Buffer.alloc(20, 0));
      });
    });

    it('should create new P2PKH instance', () => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'));

      const instance = P2PKH.new(Buffer.alloc(20, 0));

      assert.exists(instance.address);
      assert.exists(instance.functions.spend);
      assert.equal(instance.name, P2PKH.name);
    });

    it('should create new TransferWithTimeout instance', () => {
      const TransferWithTimeout = Contract.fromArtifact(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'));

      const instance = TransferWithTimeout.new(Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000);

      assert.exists(instance.address);
      assert.exists(instance.functions.transfer);
      assert.exists(instance.functions.timeout);
      assert.equal(instance.name, TransferWithTimeout.name);
    });
  });
  describe('deployed', () => {
    it('should fail on new Contract', () => {
      const P2PKH = Contract.fromCashFile(path.join(__dirname, 'fixture', 'p2pkh.cash'));

      assert.isEmpty(P2PKH.artifact.networks);
      assert.throws(() => {
        P2PKH.deployed();
      });
      assert.throws(() => {
        P2PKH.deployed('bchtest:ppzllwzk775qk86zfskzyzae7pa9h4dvzcfezpsdkl');
      });
    });
    it('should return deployed P2PKH', () => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'));
      const deployedAddress = 'bchtest:ppzllwzk775qk86zfskzyzae7pa9h4dvzcfezpsdkl'

      assert.isNotEmpty(P2PKH.artifact.networks);
      const instance1 = P2PKH.deployed();
      const instance2 = P2PKH.deployed(deployedAddress);

      assert.equal(instance1.address, deployedAddress);
      assert.equal(instance2.address, deployedAddress);
      assert.exists(instance1.functions.spend);
      assert.exists(instance2.functions.spend);
      assert.equal(instance1.name, P2PKH.name);
      assert.equal(instance2.name, P2PKH.name);
    });
  });
});
