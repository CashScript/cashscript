import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
import * as path from 'path';
import { Contract, Artifacts } from '../src';

chai.use(chaiExclude);
const { assert } = chai;

describe('Contract', () => {
  describe('compile', () => {
    it('should fail for invalid .cash file or string', () => {
      assert.throws(() => {
        Contract.compile(path.join(__dirname, 'fixture', 'p2pkh-invalid.cash'));
      });

      assert.throws(() => {
        Contract.compile('contract P2PKH(bytes20 pkh) {\n    // Require pk to match stored pkh and signature to match\n    functon spend(pubkey pk, sig s) {\n        require(hash160(pk) == pkh);\n        require(checkSig(s, pk));\n    }\n}\n');
      });
    });

    ['p2pkh', 'transfer_with_timeout', 'hodl_vault', 'mecenas'].forEach((name) => {
      it(`should create ${name} contract object from file`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.compile(path.join(__dirname, 'fixture', `${name}.cash`));
        assert.deepEqualExcluding(contract.artifact, expectedArtifact, ['updatedAt', 'networks']);
      });

      it(`should create ${name} contract object from string`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.compile(expectedArtifact.source);
        assert.deepEqualExcluding(contract.artifact, expectedArtifact, ['updatedAt', 'networks']);
      });
    });
  });

  describe('import', () => {
    it('should fail with invalid Artifact file or object', () => {
      assert.throws(() => {
        Contract.import(path.join(__dirname, 'fixture', 'p2pkh-invalid.json'), 'testnet');
      });
      assert.throws(() => {
        const artifact = Artifacts.require(path.join(__dirname, 'fixture', 'p2pkh-invalid.json'));
        artifact.abi = [];
        Contract.import(artifact);
      });
    });

    ['p2pkh', 'transfer_with_timeout', 'hodl_vault', 'mecenas'].forEach((name) => {
      it(`should create ${name} contract object from file`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.import(path.join(__dirname, 'fixture', `${name}.json`), 'testnet');
        assert.deepEqual(contract.artifact, expectedArtifact);
      });

      it(`should create ${name} contract object from string`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.import(expectedArtifact, 'testnet');
        assert.deepEqual(contract.artifact, expectedArtifact);
      });
    });
  });

  describe('export', () => {
    ['p2pkh', 'transfer_with_timeout', 'hodl_vault', 'mecenas'].forEach((name) => {
      it(`should export artifact file for ${name}`, () => {
        const initial = Contract.import(path.join(__dirname, 'fixture', `${name}.json`), 'testnet');
        const returnedArtifact = initial.export(path.join(__dirname, 'fixture', `${name}.json`));
        const exportedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));

        assert.deepEqual(initial.artifact, exportedArtifact);
        assert.deepEqual(initial.artifact, returnedArtifact);
      });

      it(`should export artifact object for ${name}`, () => {
        const initial = Contract.import(path.join(__dirname, 'fixture', `${name}.json`), 'testnet');
        const artifact = initial.export();

        assert.deepEqual(initial.artifact, artifact);
      });
    });
  });

  describe('new', () => {
    it('should fail with incorrect constructor parameters', () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');

      assert.throws(() => {
        P2PKH.new();
      });
      assert.throws(() => {
        P2PKH.new(20);
      });
      assert.throws(() => {
        P2PKH.new(Buffer.alloc(20, 0), Buffer.alloc(20, 0));
      });
      assert.throws(() => {
        P2PKH.new(Buffer.alloc(19, 0));
      });
      assert.throws(() => {
        P2PKH.new(Buffer.alloc(21, 0));
      });
    });

    it('should create new P2PKH instance', () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const instance = P2PKH.new(Buffer.alloc(20, 0));

      assert.exists(instance.address);
      assert.exists(instance.functions.spend);
      assert.equal(instance.name, P2PKH.name);
    });

    it('should create new TransferWithTimeout instance', () => {
      const TransferWithTimeout = Contract.import(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'), 'testnet');
      const instance = TransferWithTimeout.new(Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000);

      assert.exists(instance.address);
      assert.exists(instance.functions.transfer);
      assert.exists(instance.functions.timeout);
      assert.equal(instance.name, TransferWithTimeout.name);
    });

    it('should create new HodlVault instance', () => {
      const HodlVault = Contract.import(path.join(__dirname, 'fixture', 'hodl_vault.json'), 'testnet');
      const instance = HodlVault.new(Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000, 10000);

      assert.exists(instance.address);
      assert.exists(instance.functions.spend);
      assert.equal(instance.name, HodlVault.name);
    });

    it('should create new Mecenas instance', () => {
      const Mecenas = Contract.import(path.join(__dirname, 'fixture', 'mecenas.json'), 'testnet');
      const instance = Mecenas.new(Buffer.alloc(20, 0), Buffer.alloc(20, 0), 1000000);

      assert.exists(instance.address);
      assert.exists(instance.functions.receive);
      assert.exists(instance.functions.reclaim);
      assert.equal(instance.name, Mecenas.name);
    });
  });

  describe('deployed', () => {
    it('should fail on new Contract', () => {
      const P2PKH = Contract.compile(path.join(__dirname, 'fixture', 'p2pkh.cash'), 'testnet');

      assert.isEmpty(P2PKH.artifact.networks);
      assert.throws(() => {
        P2PKH.deployed();
      });
      assert.throws(() => {
        P2PKH.deployed('bchtest:prpnwqy42crzhrt9dn3kkq6xr9d8qvlpecrnqgdka6');
      });
    });

    it('should return deployed P2PKH', () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const deployedAddress = 'bchtest:pzfsp649y00eay9mm3ky63ln72v3h6tx6gul8mlg93';

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
