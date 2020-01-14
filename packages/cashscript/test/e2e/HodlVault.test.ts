import * as path from 'path';
import { Contract, Instance, Sig } from '../../src';
import {
  alicePk,
  alice,
  oraclePk,
  oracle,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedTransactionError } from '../../src/Errors';

describe('HodlVault', () => {
  let hodlVault: Instance;
  beforeAll(() => {
    const HodlVault = Contract.import(path.join(__dirname, '..', 'fixture', 'hodl_vault.json'), 'testnet');
    hodlVault = HodlVault.new(alicePk, oraclePk, 597000, 30000);
  });

  describe('send (to one)', () => {
    it('should fail when oracle sig is incorrect', async () => {
      // given
      const message = oracle.createMessage(1000000, 1000);
      const wrongMessage = oracle.createMessage(1000000, 1001);
      const wrongSig = oracle.signMessage(wrongMessage);
      const to = hodlVault.address;
      const amount = 10000;

      // then
      const expectPromise = expect(
        hodlVault.functions
          .spend(new Sig(alice), wrongSig, message)
          .send(to, amount),
      );
      await expectPromise.rejects.toThrow(FailedTransactionError);
      await expectPromise.rejects.toThrow('Script failed an OP_VERIFY operation');
    });

    it('should fail when price is too low', async () => {
      // given
      const message = oracle.createMessage(1000000, 29900);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000;

      // then
      const expectPromise = expect(
        hodlVault.functions
          .spend(new Sig(alice), oracleSig, message)
          .send(to, amount),
      );
      await expectPromise.rejects.toThrow(FailedTransactionError);
      await expectPromise.rejects.toThrow('Script failed an OP_VERIFY operation');
    });

    it('should succeed when price is high enough', async () => {
      // given
      const message = oracle.createMessage(1000000, 30000);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000;

      // when
      const tx = await hodlVault.functions
        .spend(new Sig(alice), oracleSig, message)
        .send(to, amount);

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });

  describe('send (to many)', () => {
    it('should fail when oracle sig is incorrect', async () => {
      // given
      const message = oracle.createMessage(1000000, 1000);
      const wrongMessage = oracle.createMessage(1000000, 1001);
      const wrongSig = oracle.signMessage(wrongMessage);
      const outputs = [
        { to: hodlVault.address, amount: 10000 },
        { to: hodlVault.address, amount: 20000 },
      ];

      // then
      const expectPromise = expect(
        hodlVault.functions
          .spend(new Sig(alice), wrongSig, message)
          .send(outputs),
      );
      await expectPromise.rejects.toThrow(FailedTransactionError);
      await expectPromise.rejects.toThrow('Script failed an OP_VERIFY operation');
    });

    it('should fail when price is too low', async () => {
      // given
      const message = oracle.createMessage(1000000, 29900);
      const oracleSig = oracle.signMessage(message);
      const outputs = [
        { to: hodlVault.address, amount: 10000 },
        { to: hodlVault.address, amount: 20000 },
      ];

      // then
      const expectPromise = expect(
        hodlVault.functions
          .spend(new Sig(alice), oracleSig, message)
          .send(outputs),
      );
      await expectPromise.rejects.toThrow(FailedTransactionError);
      await expectPromise.rejects.toThrow('Script failed an OP_VERIFY operation');
    });

    it('should succeed when price is high enough', async () => {
      // given
      const message = oracle.createMessage(1000000, 30000);
      const oracleSig = oracle.signMessage(message);
      const outputs = [
        { to: hodlVault.address, amount: 10000 },
        { to: hodlVault.address, amount: 20000 },
      ];

      // when
      const tx = await hodlVault.functions
        .spend(new Sig(alice), oracleSig, message)
        .send(outputs);

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });
  });
});
