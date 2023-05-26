import { hexToBin } from '@bitauth/libauth';
import { placeholder } from '@cashscript/utils';
import { Contract, ElectrumNetworkProvider, SignatureTemplate } from '../src/index.js';
import {
  alicePkh,
  alicePk,
  alice,
  bob,
} from './fixture/vars.js';

// This is failing due to limitations between Jest and bigint (https://github.com/facebook/jest/issues/11617)
// TODO: Fix this somehow by changing the test, or move away from Jest
describe('Contract', () => {
  describe('new', () => {
    it('should fail with incorrect constructor args', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();

      expect(() => new Contract(artifact, [], provider)).toThrow();
      expect(() => new Contract(artifact, [BigInt(20)], provider)).toThrow();
      expect(
        () => new Contract(artifact, [placeholder(20), placeholder(20)], provider),
      ).toThrow();
      expect(() => new Contract(artifact, [placeholder(19)], provider)).toThrow();
      expect(() => new Contract(artifact, [placeholder(21)], provider)).toThrow();
    });

    it('should fail with incomplete artifact', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();

      expect(() => new Contract({ ...artifact, abi: undefined }, [], provider)).toThrow();
      expect(() => new Contract({ ...artifact, bytecode: undefined }, [], provider)).toThrow();
      expect(
        () => new Contract({ ...artifact, constructorInputs: undefined }, [], provider),
      ).toThrow();
      expect(() => new Contract({ ...artifact, contractName: undefined }, [], provider)).toThrow();
    });

    it('should create new P2PKH instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      const instance = new Contract(artifact, [placeholder(20)], provider);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });

    it('should create new TransferWithTimeout instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/transfer_with_timeout.json');
      const provider = new ElectrumNetworkProvider();
      const constructorArgs = [placeholder(65), placeholder(65), BigInt(1000000)];
      const instance = new Contract(artifact, constructorArgs, provider);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.transfer).toBe('function');
      expect(typeof instance.functions.timeout).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });

    it('should create new HodlVault instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/hodl_vault.json');
      const provider = new ElectrumNetworkProvider();
      const constructorArgs = [placeholder(65), placeholder(65), BigInt(1000000), BigInt(10000)];
      const instance = new Contract(artifact, constructorArgs, provider);

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(artifact.contractName);
    });

    it('should create new Mecenas instance', () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/mecenas.json');
      const provider = new ElectrumNetworkProvider();
      const constructorArgs = [placeholder(20), placeholder(20), BigInt(1000000)];
      const instance = new Contract(artifact, constructorArgs, provider);

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
      const instance = new Contract(artifact, [alicePkh], provider);

      expect(await instance.getBalance()).toBeGreaterThan(BigInt(0));
    });

    it('should return zero balance for new contract', async () => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      const instance = new Contract(artifact, [placeholder(20)], provider);

      expect(await instance.getBalance()).toBe(BigInt(0));
    });
  });

  describe('Contract functions', () => {
    let instance: Contract;
    let bbInstance: Contract;
    beforeEach(() => {
      // eslint-disable-next-line global-require
      const artifact = require('./fixture/p2pkh.json');
      const provider = new ElectrumNetworkProvider();
      instance = new Contract(artifact, [alicePkh], provider);

      // eslint-disable-next-line global-require
      const bbArtifact = require('./fixture/bounded_bytes.json');
      bbInstance = new Contract(bbArtifact, [], provider);
    });

    it('can\'t call spend with incorrect signature', () => {
      expect(() => instance.functions.spend()).toThrow();
      expect(() => instance.functions.spend(BigInt(0), BigInt(1))).toThrow();
      expect(() => instance.functions.spend(alicePk, new SignatureTemplate(alice), BigInt(0))).toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e803'), BigInt(1000))).toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e803000000'), BigInt(1000))).toThrow();
    });

    it('can call spend with incorrect arguments', () => {
      expect(() => instance.functions.spend(alicePk, new SignatureTemplate(bob))).not.toThrow();
      expect(() => instance.functions.spend(alicePk, placeholder(65))).not.toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e8031234'), BigInt(1000))).not.toThrow();
    });

    it('can call spend with correct arguments', () => {
      expect(() => instance.functions.spend(alicePk, new SignatureTemplate(alice))).not.toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e8030000'), BigInt(1000))).not.toThrow();
    });
  });
});
