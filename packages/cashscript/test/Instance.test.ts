import path from 'path';
import { Contract, Instance, Sig } from '../src';
import {
  alicePk,
  alice,
  bob,
  alicePkh,
} from './fixture/vars';

describe('Instance', () => {
  describe('getBalance', () => {
    // Not very robust, as this depends on the example P2PKH contract having balance
    it('should return balance for existing contract', async () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const instance = P2PKH.deployed();
      const otherInstance = P2PKH.new(alicePkh);

      expect(await instance.getBalance()).toBeGreaterThan(0);
      expect(await otherInstance.getBalance()).toBeGreaterThan(0);
    });

    it('should return zero balance for new contract', async () => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const instance = P2PKH.new(Buffer.alloc(20, 0));

      expect(await instance.getBalance()).toBe(0);
    });
  });

  describe('Contract functions', () => {
    let instance: Instance;
    let bbInstance: Instance;
    beforeEach(() => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      instance = P2PKH.deployed();
      const BoundedBytes = Contract.import(path.join(__dirname, 'fixture', 'bounded_bytes.json'), 'testnet');
      bbInstance = BoundedBytes.new();
    });

    it('can\'t call spend with incorrect parameter signature', () => {
      expect(() => instance.functions.spend()).toThrow();
      expect(() => instance.functions.spend(0, 1)).toThrow();
      expect(() => instance.functions.spend(alicePk, new Sig(alice), 0)).toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e803', 'hex'), 1000)).toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e803000000', 'hex'), 1000)).toThrow();
    });

    it('can call spend with incorrect parameters', () => {
      expect(() => instance.functions.spend(alicePk, new Sig(bob))).not.toThrow();
      expect(() => instance.functions.spend(alicePk, Buffer.alloc(65, 0))).not.toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e8031234', 'hex'), 1000)).not.toThrow();
    });

    it('can call spend with correct parameters', () => {
      expect(() => instance.functions.spend(alicePk, new Sig(alice))).not.toThrow();
      expect(() => bbInstance.functions.spend(Buffer.from('e8030000', 'hex'), 1000)).not.toThrow();
    });
  });
});
