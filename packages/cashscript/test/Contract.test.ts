import { Contract, ElectrumNetworkProvider, SignatureTemplate } from '../src';
import {
  alicePkh,
  alicePk,
  alice,
  bob,
} from './fixture/vars';

describe('Contract', () => {
  describe('new', () => {
    it('should fail with incorrect constructor parameters', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();

      expect(() => new Contract(artifact, provider, [])).toThrow();
      expect(() => new Contract(artifact, provider, [20])).toThrow();
      expect(
        () => new Contract(artifact, provider, [Buffer.alloc(20, 0), Buffer.alloc(20, 0)]),
      ).toThrow();
      expect(() => new Contract(artifact, provider, [Buffer.alloc(19, 0)])).toThrow();
      expect(() => new Contract(artifact, provider, [Buffer.alloc(21, 0)])).toThrow();
    });

    it('should fail with incomplete artifact', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();

      expect(() => new Contract({ ...artifact, abi: undefined }, provider, [])).toThrow();
      expect(() => new Contract({ ...artifact, bytecode: undefined }, provider, [])).toThrow();
      expect(
        () => new Contract({ ...artifact, constructorInputs: undefined }, provider, []),
      ).toThrow();
      expect(() => new Contract({ ...artifact, contractName: undefined }, provider, [])).toThrow();
    });

    it('should create new P2PKH instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      const instance = new Contract(artifact, provider, [Buffer.alloc(20, 0)]);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });

    it('should create new TransferWithTimeout instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/transfer_with_timeout.json');
      const provider = new ElectrumNetworkProvider();
      const constructorParameters = [Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000];
      const instance = new Contract(artifact, provider, constructorParameters);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.transfer).toBe('function');
      expect(typeof instance.functions.timeout).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });

    it('should create new HodlVault instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/hodl_vault.json');
      const provider = new ElectrumNetworkProvider();
      const constructorParameters = [Buffer.alloc(65, 0), Buffer.alloc(65, 0), 1000000, 10000];
      const instance = new Contract(artifact, provider, constructorParameters);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });

    it('should create new Mecenas instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/mecenas.json');
      const provider = new ElectrumNetworkProvider();
      const constructorParameters = [Buffer.alloc(20, 0), Buffer.alloc(20, 0), 1000000];
      const instance = new Contract(artifact, provider, constructorParameters);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.receive).toBe('function');
      expect(typeof instance.functions.reclaim).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });
  });

  describe('getBalance', () => {
    // Not very robust, as this depends on the example P2PKH contract having balance
    it('should return balance for existing contract', async () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      const instance = new Contract(artifact, provider, [alicePkh]);

      expect(await instance.getBalance()).toBeGreaterThan(0);
    });

    it('should return zero balance for new contract', async () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      const instance = new Contract(artifact, provider, [Buffer.alloc(20, 0)]);

      expect(await instance.getBalance()).toBe(0);
    });
  });

  describe('Contract functions', () => {
    let instance: Contract;
    let bbInstance: Contract;
    beforeEach(() => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      instance = new Contract(artifact, provider, [alicePkh]);

      // eslint-disable-next-line global-require
      const bbArtifact = require('./fixture/bounded_bytes.json');
      bbInstance = new Contract(bbArtifact, provider, []);
    });

    it('can\'t call spend with incorrect parameter signature', () => {
      expect(() => instance.functions.spend()).toThrow();
      expect(() => instance.functions.spend(0, 1)).toThrow();
      expect(() => instance.functions.spend(alicePk, new SignatureTemplate(alice), 0)).toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e803', 'hex'), 1000)).toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e803000000', 'hex'), 1000)).toThrow();
    });

    it('can call spend with incorrect parameters', () => {
      expect(() => instance.functions.spend(alicePk, new SignatureTemplate(bob))).not.toThrow();
      expect(() => instance.functions.spend(alicePk, Buffer.alloc(65, 0))).not.toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e8031234', 'hex'), 1000)).not.toThrow();
    });

    it('can call spend with correct parameters', () => {
      expect(() => instance.functions.spend(alicePk, new SignatureTemplate(alice))).not.toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e8030000', 'hex'), 1000)).not.toThrow();
    });
  });
});
