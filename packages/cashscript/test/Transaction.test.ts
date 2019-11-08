import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import { Contract, Instance, Sig } from '../src';
import {
  alicePkh,
  alicePk,
  alice,
  bob,
  bobPk,
  oraclePk,
  oracle,
} from './fixture/vars';
import { getTxOutputs } from './test-util';
import { isOpReturn } from '../src/interfaces';
import { createOpReturnScript } from '../src/transaction-util';
import { FailedTransactionError } from '../src/Errors';

chai.use(chaiAsPromised);
const { assert } = chai;

// Tests not very robust / reliable as they use actual testnet transactions
// These tests could also be made more dynamic by loading a list of fixture data
// Meep tests should also test for correctness of the output (not a priority)
describe('Transaction', () => {
  describe('P2PKH', () => {
    let p2pkhInstance: Instance;
    before(() => {
      const P2PKH = Contract.import(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      p2pkhInstance = P2PKH.new(alicePkh);
    });

    describe('send (to one)', () => {
      it('should fail when using incorrect function parameters', async () => {
        // given
        const to = p2pkhInstance.address;
        const amount = 10000;

        // then
        await assert.isRejected(
          // when
          p2pkhInstance.functions
            .spend(alicePk, new Sig(bob))
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
        );
      });

      it('should succeed when using correct function parameters', async () => {
        // given
        const to = p2pkhInstance.address;
        const amount = 10000;

        // when
        const tx = await p2pkhInstance.functions
          .spend(alicePk, new Sig(alice))
          .send(to, amount);

        // then
        const txOutputs = getTxOutputs(tx);
        assert.deepInclude(txOutputs, { to, amount });
      });
    });

    describe('send (to many)', () => {
      it('should fail when using incorrect function parameters', async () => {
        // given
        const outputs = [
          { to: p2pkhInstance.address, amount: 10000 },
          { to: p2pkhInstance.address, amount: 20000 },
        ];

        // then
        await assert.isRejected(
          // when
          p2pkhInstance.functions
            .spend(alicePk, new Sig(bob))
            .send(outputs),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
        );
      });

      it('should succeed when using correct function parameters', async () => {
        // given
        const outputs = [
          { to: p2pkhInstance.address, amount: 10000 },
          { to: p2pkhInstance.address, amount: 20000 },
        ];

        // when
        const tx = await p2pkhInstance.functions
          .spend(alicePk, new Sig(alice))
          .send(outputs);

        // then
        const txOutputs = getTxOutputs(tx);
        assert.includeDeepMembers(txOutputs, outputs);
      });

      it('should support OP_RETURN data as an output', async () => {
        // given
        const outputs = [
          { opReturn: ['0x6d02', 'Hello, World!'] },
          { to: p2pkhInstance.address, amount: 10000 },
          { to: p2pkhInstance.address, amount: 20000 },
        ];

        // when
        const tx = await p2pkhInstance.functions
          .spend(alicePk, new Sig(alice))
          .send(outputs);

        // then
        const txOutputs = getTxOutputs(tx);
        const expectedOutputs = outputs.map(o => (
          isOpReturn(o) ? { to: createOpReturnScript(o), amount: 0 } : o
        ));
        assert.includeDeepMembers(txOutputs, expectedOutputs);
      });
    });

    describe('meep (to one)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await p2pkhInstance.functions
          .spend(alicePk, new Sig(bob))
          .meep(p2pkhInstance.address, 10000);
      });

      it('should succeed when using correct function parameters', async () => {
        await p2pkhInstance.functions
          .spend(alicePk, new Sig(alice))
          .meep(p2pkhInstance.address, 10000);
      });
    });

    describe('meep (to many)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await p2pkhInstance.functions.spend(alicePk, new Sig(bob)).meep([
          { to: p2pkhInstance.address, amount: 15000 },
          { to: p2pkhInstance.address, amount: 15000 },
        ]);
      });

      it('should succeed when using correct function parameters', async () => {
        await p2pkhInstance.functions.spend(alicePk, new Sig(alice)).meep([
          { to: p2pkhInstance.address, amount: 15000 },
          { to: p2pkhInstance.address, amount: 15000 },
        ]);
      });
    });
  });

  describe('TransferWithTimeout', () => {
    let twtInstancePast: Instance;
    let twtInstanceFuture: Instance;
    before(() => {
      const TWT = Contract.import(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'), 'testnet');
      twtInstancePast = TWT.new(alicePk, bobPk, 1000000);
      twtInstanceFuture = TWT.new(alicePk, bobPk, 2000000);
    });

    describe('send (to one)', () => {
      it('should fail when using incorrect function parameters', async () => {
        // given
        const to = twtInstancePast.address;
        const amount = 10000;

        // then
        await assert.isRejected(
          // when
          twtInstancePast.functions
            .transfer(new Sig(alice))
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
        );

        // then
        await assert.isRejected(
          // when
          twtInstancePast.functions
            .timeout(new Sig(bob))
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
        );
      });

      it('should fail when called before timeout', async () => {
        // given
        const to = twtInstanceFuture.address;
        const amount = 10000;

        // then
        await assert.isRejected(
          // when
          twtInstanceFuture.functions
            .timeout(new Sig(alice))
            .send(to, amount),
          FailedTransactionError,
          '64: non-mandatory-script-verify-flag (Locktime requirement not satisfied)',
        );
      });

      it('should succeed when using correct function parameters', async () => {
        // given
        const toFuture = twtInstanceFuture.address;
        const toPast = twtInstancePast.address;
        const amount = 10000;

        // when
        const tx1 = await twtInstancePast.functions
          .transfer(new Sig(bob))
          .send(toPast, amount);

        const tx2 = await twtInstanceFuture.functions
          .transfer(new Sig(bob))
          .send(toFuture, amount);

        const tx3 = await twtInstancePast.functions
          .timeout(new Sig(alice))
          .send(toPast, amount);

        // then
        const tx1Outputs = getTxOutputs(tx1);
        const tx2Outputs = getTxOutputs(tx2);
        const tx3Outputs = getTxOutputs(tx3);

        assert.deepInclude(tx1Outputs, { to: toPast, amount });
        assert.deepInclude(tx2Outputs, { to: toFuture, amount });
        assert.deepInclude(tx3Outputs, { to: toPast, amount });
      });
    });

    describe('send (to many)', () => {
      it('should fail when using incorrect function parameters', async () => {
        // given
        const outputs = [
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 20000 },
        ];

        // then
        await assert.isRejected(
          // when
          twtInstancePast.functions
            .transfer(new Sig(alice))
            .send(outputs),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
        );

        // then
        await assert.isRejected(
          // when
          twtInstancePast.functions
            .timeout(new Sig(bob))
            .send(outputs),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
        );
      });

      it('should fail when called before timeout', async () => {
        // given
        const outputs = [
          { to: twtInstanceFuture.address, amount: 10000 },
          { to: twtInstanceFuture.address, amount: 20000 },
        ];

        // then
        await assert.isRejected(
          // when
          twtInstanceFuture.functions
            .timeout(new Sig(alice))
            .send(outputs),
          FailedTransactionError,
          '64: non-mandatory-script-verify-flag (Locktime requirement not satisfied)',
        );
      });

      it('should succeed when using correct function parameters', async () => {
        // given
        const outputsPast = [
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 20000 },
        ];

        const outputsFuture = [
          { to: twtInstanceFuture.address, amount: 10000 },
          { to: twtInstanceFuture.address, amount: 20000 },
        ];

        // when
        const tx1 = await twtInstancePast.functions
          .transfer(new Sig(bob))
          .send(outputsPast);

        const tx2 = await twtInstanceFuture.functions
          .transfer(new Sig(bob))
          .send(outputsFuture);

        const tx3 = await twtInstancePast.functions
          .timeout(new Sig(alice))
          .send(outputsPast);

        // then
        const tx1Outputs = getTxOutputs(tx1);
        const tx2Outputs = getTxOutputs(tx2);
        const tx3Outputs = getTxOutputs(tx3);

        assert.includeDeepMembers(tx1Outputs, outputsPast);
        assert.includeDeepMembers(tx2Outputs, outputsFuture);
        assert.includeDeepMembers(tx3Outputs, outputsPast);
      });
    });

    describe('meep (to one)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await twtInstancePast.functions
          .transfer(new Sig(alice))
          .meep(twtInstancePast.address, 10000);

        await twtInstancePast.functions
          .timeout(new Sig(bob))
          .meep(twtInstancePast.address, 10000);
      });

      it('should succeed when called before timeout', async () => {
        await twtInstanceFuture.functions
          .timeout(new Sig(alice))
          .meep(twtInstancePast.address, 10000);
      });

      it('should succeed when using correct function parameters', async () => {
        await twtInstancePast.functions
          .transfer(new Sig(bob))
          .meep(twtInstancePast.address, 10000);

        await twtInstanceFuture.functions
          .transfer(new Sig(bob))
          .meep(twtInstanceFuture.address, 10000);

        await twtInstancePast.functions
          .timeout(new Sig(alice))
          .meep(twtInstancePast.address, 10000);
      });
    });

    describe('meep (to many)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await twtInstancePast.functions.transfer(new Sig(alice)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);

        await twtInstancePast.functions.timeout(new Sig(bob)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);
      });

      it('should succeed when called before timeout', async () => {
        await twtInstanceFuture.functions.timeout(new Sig(alice)).meep([
          { to: twtInstanceFuture.address, amount: 10000 },
          { to: twtInstanceFuture.address, amount: 10000 },
        ]);
      });

      it('should succeed when using correct function parameters', async () => {
        await twtInstancePast.functions.transfer(new Sig(bob)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);

        await twtInstanceFuture.functions.transfer(new Sig(bob)).meep([
          { to: twtInstanceFuture.address, amount: 10000 },
          { to: twtInstanceFuture.address, amount: 10000 },
        ]);

        await twtInstancePast.functions.timeout(new Sig(alice)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);
      });
    });
  });

  describe('HodlVault', () => {
    let hodlVault: Instance;
    before(() => {
      const HodlVault = Contract.import(path.join(__dirname, 'fixture', 'hodl_vault.json'), 'testnet');
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
        await assert.isRejected(
          // when
          hodlVault.functions
            .spend(new Sig(alice), wrongSig, message)
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Script failed an OP_VERIFY operation)',
        );
      });

      it('should fail when price is too low', async () => {
        // given
        const message = oracle.createMessage(1000000, 29900);
        const oracleSig = oracle.signMessage(message);
        const to = hodlVault.address;
        const amount = 10000;

        // then
        await assert.isRejected(
          // when
          hodlVault.functions
            .spend(new Sig(alice), oracleSig, message)
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Script failed an OP_VERIFY operation)',
        );
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
        assert.deepInclude(txOutputs, { to, amount });
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
        await assert.isRejected(
          // when
          hodlVault.functions
            .spend(new Sig(alice), wrongSig, message)
            .send(outputs),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Script failed an OP_VERIFY operation)',
        );
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
        await assert.isRejected(
          // when
          hodlVault.functions
            .spend(new Sig(alice), oracleSig, message)
            .send(outputs),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Script failed an OP_VERIFY operation)',
        );
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
        assert.includeDeepMembers(txOutputs, outputs);
      });
    });
  });

  describe('BoundedBytes', () => {
    let bbInstance: Instance;
    before(() => {
      const BoundedBytes = Contract.import(path.join(__dirname, 'fixture', 'bounded_bytes.json'), 'testnet');
      bbInstance = BoundedBytes.new();
    });

    describe('send (to one)', () => {
      it('should fail when using incorrect function parameters', async () => {
        // given
        const to = bbInstance.address;
        const amount = 10000;

        // then
        await assert.isRejected(
          // when
          bbInstance.functions
            .spend(Buffer.from('12345678', 'hex'), 1000)
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)',
        );

        // then
        await assert.isRejected(
          // when
          bbInstance.functions
            .spend(Buffer.from('000003e8', 'hex'), 1000)
            .send(to, amount),
          FailedTransactionError,
          '16: mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)',
        );
      });

      it('should succeed when using correct function parameters', async () => {
        // given
        const to = bbInstance.address;
        const amount = 10000;

        // when
        const tx = await bbInstance.functions
          .spend(Buffer.from('e8030000', 'hex'), 1000)
          .send(to, amount);

        // then
        const txOutputs = getTxOutputs(tx);
        assert.deepInclude(txOutputs, { to, amount });
      });
    });
  });
});
