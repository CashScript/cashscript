import * as path from 'path';
import { assert } from 'chai';
import { Contract, Instance, Sig } from '../src';
import {
  alicePk,
  alice,
  bob,
  bobPk,
  alicePkh,
} from './fixture/vars';

describe('Instance', () => {
  describe('getBalance', () => {
    // Not very robust, as this depends on the example P2PKH contract having balance
    it('should return balance for existing contract', async () => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const instance = P2PKH.deployed();
      const otherInstance = P2PKH.new(alicePkh);

      assert.isAbove(await instance.getBalance(), 0);
      assert.isAbove(await otherInstance.getBalance(), 0);
    });

    it('should return zero balance for new contract', async () => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      const instance = P2PKH.new(Buffer.alloc(20, 0));

      assert.equal(await instance.getBalance(), 0);
    });
  });

  describe('Contract functions', () => {
    let instance: Instance;
    let bbInstance: Instance;
    beforeEach(() => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      instance = P2PKH.deployed();
      const BoundedBytes = Contract.fromArtifact(path.join(__dirname, 'fixture', 'bounded_bytes.json'), 'testnet');
      bbInstance = BoundedBytes.new();
    });

    it('can\'t call spend with incorrect parameter signature', () => {
      assert.throws(() => {
        instance.functions.spend();
      });
      assert.throws(() => {
        instance.functions.spend(0, 1);
      });
      assert.throws(() => {
        instance.functions.spend(alicePk, new Sig(alice), 0);
      });
      assert.throws(() => {
        bbInstance.functions.spend(Buffer.from('e803', 'hex'), 1000);
      });
      assert.throws(() => {
        bbInstance.functions.spend(Buffer.from('e803000000', 'hex'), 1000);
      });
    });

    it('can call spend with incorrect parameters', () => {
      assert.doesNotThrow(() => {
        instance.functions.spend(alicePk, new Sig(bob));
      });
      assert.doesNotThrow(() => {
        instance.functions.spend(bobPk, new Sig(alice));
      });
      assert.doesNotThrow(() => {
        instance.functions.spend(bobPk, Buffer.alloc(65, 0));
      });
      assert.doesNotThrow(() => {
        bbInstance.functions.spend(Buffer.from('e8031234', 'hex'), 1000);
      });
    });

    it('can call spend with correct parameters', () => {
      assert.doesNotThrow(() => {
        instance.functions.spend(alicePk, new Sig(alice));
      });
      assert.doesNotThrow(() => {
        bbInstance.functions.spend(Buffer.from('e8030000', 'hex'), 1000);
      });
    });
  });
});
