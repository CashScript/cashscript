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
    beforeEach(() => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      instance = P2PKH.deployed();
    });

    it('can\'t call spend with incorrect parameter signature', () => {
      assert.throws(() => {
        instance.functions.spend();
      });
      assert.throws(() => {
        instance.functions.spend(0, 1);
      });
      assert.throws(() => {
        instance.functions.spend(alicePk, new Sig(alice, 0x01), 0);
      });
    });

    it('can call spend with incorrect tx signature or pk', () => {
      assert.doesNotThrow(() => {
        instance.functions.spend(alicePk, new Sig(bob, 0x01));
      });
      assert.doesNotThrow(() => {
        instance.functions.spend(bobPk, new Sig(alice, 0x01));
      });
    });

    it('can call spend with correct tx signature and pk', () => {
      assert.doesNotThrow(() => {
        instance.functions.spend(alicePk, new Sig(alice, 0x01));
      });
    });
  });
});
