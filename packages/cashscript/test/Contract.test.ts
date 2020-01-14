import * as path from 'path';
import { Contract, Artifacts } from '../src';

describe('Contract', () => {
  describe('compile', () => {
    it('should fail for invalid .cash file or string', () => {
      expect(() => Contract.compile(path.join(__dirname, 'fixture', 'p2pkh-invalid.cash')))
        .toThrow();

      expect(() => Contract.compile('contract P2PKH(bytes20 pkh) {\n    // Require pk to match stored pkh and signature to match\n    functon spend(pubkey pk, sig s) {\n        require(hash160(pk) == pkh);\n        require(checkSig(s, pk));\n    }\n}\n'))
        .toThrow();
    });

    ['p2pkh', 'transfer_with_timeout', 'hodl_vault', 'mecenas_v1', 'mecenas', 'simple_covenant'].forEach((name) => {
      it(`should create ${name} contract object from file`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.compile(path.join(__dirname, 'fixture', `${name}.cash`));
        expect(contract.artifact).toEqual({
          ...expectedArtifact,
          updatedAt: expect.any(String),
          networks: expect.any(Object),
          compiler: expect.any(Object),
        });
      });

      it(`should create ${name} contract object from string`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.compile(expectedArtifact.source);
        expect(contract.artifact).toEqual({
          ...expectedArtifact,
          updatedAt: expect.any(String),
          networks: expect.any(Object),
          compiler: expect.any(Object),
        });
      });
    });
  });

  describe('import', () => {
    it('should fail with invalid Artifact file or object', () => {
      expect(() => Contract.import(path.join(__dirname, 'fixture', 'p2pkh-invalid.json'), 'testnet'))
        .toThrow();

      expect(() => {
        const artifact = Artifacts.require(path.join(__dirname, 'fixture', 'p2pkh-invalid.json'));
        artifact.abi = []; // TODO
        Contract.import(artifact);
      }).toThrow();
    });

    ['p2pkh', 'transfer_with_timeout', 'hodl_vault', 'mecenas_v1', 'mecenas', 'simple_covenant'].forEach((name) => {
      it(`should create ${name} contract object from file`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.import(path.join(__dirname, 'fixture', `${name}.json`), 'testnet');
        expect(contract.artifact).toEqual(expectedArtifact);
      });

      it(`should create ${name} contract object from string`, () => {
        const expectedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));
        const contract = Contract.import(expectedArtifact, 'testnet');
        expect(contract.artifact).toEqual(expectedArtifact);
      });
    });
  });

  describe('export', () => {
    ['p2pkh', 'transfer_with_timeout', 'hodl_vault', 'mecenas', 'simple_covenant'].forEach((name) => {
      it(`should export artifact file for ${name}`, () => {
        const initial = Contract.import(path.join(__dirname, 'fixture', `${name}.json`), 'testnet');
        const returnedArtifact = initial.export(path.join(__dirname, 'fixture', `${name}.json`));
        const exportedArtifact = Artifacts.require(path.join(__dirname, 'fixture', `${name}.json`));

        expect(initial.artifact).toEqual(exportedArtifact);
        expect(initial.artifact).toEqual(returnedArtifact);
      });

      it(`should export artifact object for ${name}`, () => {
        const initial = Contract.import(path.join(__dirname, 'fixture', `${name}.json`), 'testnet');
        const artifact = initial.export();
        expect(initial.artifact).toEqual(artifact);
      });
    });
  });

  describe('new', () => {
    it('should fail with incorrect constructor parameters', () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');

      expect(() => P2PKH.new()).toThrow();
      expect(() => P2PKH.new(20)).toThrow();
      expect(() => P2PKH.new(Buffer.alloc(20, 0), Buffer.alloc(20, 0))).toThrow();
      expect(() => P2PKH.new(Buffer.alloc(19, 0))).toThrow();
      expect(() => P2PKH.new(Buffer.alloc(21, 0))).toThrow();
    });

    it('should create new P2PKH instance', () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const instance = P2PKH.new(Buffer.alloc(20, 0));

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(P2PKH.name);
    });

    it('should create new TransferWithTimeout instance', () => {
      const TransferWithTimeout = Contract.import(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'), 'testnet');
      const instance = TransferWithTimeout.new(Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.transfer).toBe('function');
      expect(typeof instance.functions.timeout).toBe('function');
      expect(instance.name).toEqual(TransferWithTimeout.name);
    });

    it('should create new HodlVault instance', () => {
      const HodlVault = Contract.import(path.join(__dirname, 'fixture', 'hodl_vault.json'), 'testnet');
      const instance = HodlVault.new(Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000, 10000);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(HodlVault.name);
    });

    it('should create new Mecenas instance', () => {
      const Mecenas = Contract.import(path.join(__dirname, 'fixture', 'mecenas.json'), 'testnet');
      const instance = Mecenas.new(Buffer.alloc(20, 0), Buffer.alloc(20, 0), 1000000);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.receive).toBe('function');
      expect(typeof instance.functions.reclaim).toBe('function');
      expect(instance.name).toEqual(Mecenas.name);
    });
  });

  describe('deployed', () => {
    it('should fail on new Contract', () => {
      const P2PKH = Contract.compile(path.join(__dirname, 'fixture', 'p2pkh.cash'), 'testnet');

      expect(P2PKH.artifact.networks).toEqual({});
      expect(() => P2PKH.deployed()).toThrow();
      expect(() => P2PKH.deployed('prpnwqy42crzhrt9dn3kkq6xr9d8qvlpecrnqgdka6')).toThrow();
    });

    it('should return deployed P2PKH', () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const deployedAddress = 'bchtest:pzfsp649y00eay9mm3ky63ln72v3h6tx6gul8mlg93';

      expect(P2PKH.artifact.networks).toEqual({ testnet: expect.any(Object) });
      const instance1 = P2PKH.deployed();
      const instance2 = P2PKH.deployed(deployedAddress);

      expect(instance1.address).toEqual(deployedAddress);
      expect(instance2.address).toEqual(deployedAddress);
      expect(typeof instance1.functions.spend).toBe('function');
      expect(typeof instance2.functions.spend).toBe('function');
      expect(instance1.name).toEqual(P2PKH.name);
      expect(instance2.name).toEqual(P2PKH.name);
    });
  });
});
