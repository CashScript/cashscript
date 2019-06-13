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
} from './fixture/vars';

chai.use(chaiAsPromised);
const { assert } = chai;

// Tests not very robust / reliable as they use actual testnet transactions
// These tests could also be made more dynamic by loading a list of fixture data
// Meep tests should also test for correctness of the output (not a priority)
describe('Transaction', () => {
  describe('P2PKH', () => {
    let p2pkhInstance: Instance;
    before(() => {
      const P2PKH = Contract.fromArtifact(path.join(__dirname, 'fixture', 'p2pkh.json'), 'testnet');
      p2pkhInstance = P2PKH.new(alicePkh);
    });

    describe('send (to one)', () => {
      it('should fail when using incorrect function parameters', async () => {
        await assert.isRejected(
          p2pkhInstance.functions.spend(alicePk, new Sig(bob, 0x01))
            .send(p2pkhInstance.address, 10000),
        );
      });

      it('should succeed when using correct function parameters', async () => {
        assert.isNotEmpty(
          await p2pkhInstance.functions.spend(alicePk, new Sig(alice, 0x01))
            .send(p2pkhInstance.address, 10000),
        );
      });
    });

    describe('send (to many)', () => {
      it('should fail when using incorrect function parameters', async () => {
        await assert.isRejected(
          p2pkhInstance.functions.spend(alicePk, new Sig(bob, 0x01)).send([
            { to: p2pkhInstance.address, amount: 15000 },
            { to: p2pkhInstance.address, amount: 15000 },
          ]),
        );
      });

      it('should succeed when using correct function parameters', async () => {
        assert.isNotEmpty(
          await p2pkhInstance.functions.spend(alicePk, new Sig(alice, 0x01)).send([
            { to: p2pkhInstance.address, amount: 15000 },
            { to: p2pkhInstance.address, amount: 15000 },
          ]),
        );
      });
    });

    describe('meep (to one)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await p2pkhInstance.functions.spend(alicePk, new Sig(bob, 0x01))
          .meep(p2pkhInstance.address, 10000);
      });

      it('should succeed when using correct function parameters', async () => {
        await p2pkhInstance.functions.spend(alicePk, new Sig(alice, 0x01))
          .meep(p2pkhInstance.address, 10000);
      });
    });

    describe('meep (to many)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await p2pkhInstance.functions.spend(alicePk, new Sig(bob, 0x01)).meep([
          { to: p2pkhInstance.address, amount: 15000 },
          { to: p2pkhInstance.address, amount: 15000 },
        ]);
      });

      it('should succeed when using correct function parameters', async () => {
        await p2pkhInstance.functions.spend(alicePk, new Sig(alice, 0x01)).meep([
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
      const TWT = Contract.fromArtifact(path.join(__dirname, 'fixture', 'transfer_with_timeout.json'), 'testnet');
      twtInstancePast = TWT.new(alicePk, bobPk, 1000000);
      twtInstanceFuture = TWT.new(alicePk, bobPk, 2000000);
    });

    describe('send (to one)', () => {
      it('should fail when using incorrect function parameters', async () => {
        await assert.isRejected(
          twtInstancePast.functions.transfer(new Sig(alice, 0x01))
            .send(twtInstancePast.address, 10000),
        );

        await assert.isRejected(
          twtInstancePast.functions.timeout(new Sig(bob, 0x01))
            .send(twtInstancePast.address, 10000),
        );
      });

      it('should fail when called before timeout', async () => {
        await assert.isRejected(
          twtInstanceFuture.functions.timeout(new Sig(alice, 0x01))
            .send(twtInstancePast.address, 10000),
        );
      });

      it('should succeed when using correct function parameters', async () => {
        assert.isNotEmpty(
          await twtInstancePast.functions.transfer(new Sig(bob, 0x01))
            .send(twtInstancePast.address, 10000),
        );

        assert.isNotEmpty(
          await twtInstanceFuture.functions.transfer(new Sig(bob, 0x01))
            .send(twtInstanceFuture.address, 10000),
        );

        assert.isNotEmpty(
          await twtInstancePast.functions.timeout(new Sig(alice, 0x01))
            .send(twtInstancePast.address, 10000),
        );
      });
    });

    describe('send (to many)', () => {
      it('should fail when using incorrect function parameters', async () => {
        await assert.isRejected(
          twtInstancePast.functions.transfer(new Sig(alice, 0x01)).send([
            { to: twtInstancePast.address, amount: 10000 },
            { to: twtInstancePast.address, amount: 10000 },
          ]),
        );

        await assert.isRejected(
          twtInstancePast.functions.timeout(new Sig(bob, 0x01)).send([
            { to: twtInstancePast.address, amount: 10000 },
            { to: twtInstancePast.address, amount: 10000 },
          ]),
        );
      });

      it('should fail when called before timeout', async () => {
        await assert.isRejected(
          twtInstanceFuture.functions.timeout(new Sig(alice, 0x01)).send([
            { to: twtInstanceFuture.address, amount: 10000 },
            { to: twtInstanceFuture.address, amount: 10000 },
          ]),
        );
      });

      it('should succeed when using correct function parameters', async () => {
        assert.isNotEmpty(
          await twtInstancePast.functions.transfer(new Sig(bob, 0x01)).send([
            { to: twtInstancePast.address, amount: 10000 },
            { to: twtInstancePast.address, amount: 10000 },
          ]),
        );

        assert.isNotEmpty(
          await twtInstanceFuture.functions.transfer(new Sig(bob, 0x01)).send([
            { to: twtInstanceFuture.address, amount: 10000 },
            { to: twtInstanceFuture.address, amount: 10000 },
          ]),
        );

        assert.isNotEmpty(
          await twtInstancePast.functions.timeout(new Sig(alice, 0x01)).send([
            { to: twtInstancePast.address, amount: 10000 },
            { to: twtInstancePast.address, amount: 10000 },
          ]),
        );
      });
    });

    describe('meep (to one)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await twtInstancePast.functions.transfer(new Sig(alice, 0x01))
          .meep(twtInstancePast.address, 10000);

        await twtInstancePast.functions.timeout(new Sig(bob, 0x01))
          .meep(twtInstancePast.address, 10000);
      });

      it('should succeed when called before timeout', async () => {
        await twtInstanceFuture.functions.timeout(new Sig(alice, 0x01))
          .meep(twtInstancePast.address, 10000);
      });

      it('should succeed when using correct function parameters', async () => {
        await twtInstancePast.functions.transfer(new Sig(bob, 0x01))
          .meep(twtInstancePast.address, 10000);

        await twtInstanceFuture.functions.transfer(new Sig(bob, 0x01))
          .meep(twtInstanceFuture.address, 10000);

        await twtInstancePast.functions.timeout(new Sig(alice, 0x01))
          .send(twtInstancePast.address, 10000);
      });
    });

    describe('meep (to many)', () => {
      it('should succeed when using incorrect function parameters', async () => {
        await twtInstancePast.functions.transfer(new Sig(alice, 0x01)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);

        await twtInstancePast.functions.timeout(new Sig(bob, 0x01)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);
      });

      it('should succeed when called before timeout', async () => {
        await twtInstanceFuture.functions.timeout(new Sig(alice, 0x01)).meep([
          { to: twtInstanceFuture.address, amount: 10000 },
          { to: twtInstanceFuture.address, amount: 10000 },
        ]);
      });

      it('should succeed when using correct function parameters', async () => {
        await twtInstancePast.functions.transfer(new Sig(bob, 0x01)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);

        await twtInstanceFuture.functions.transfer(new Sig(bob, 0x01)).meep([
          { to: twtInstanceFuture.address, amount: 10000 },
          { to: twtInstanceFuture.address, amount: 10000 },
        ]);

        await twtInstancePast.functions.timeout(new Sig(alice, 0x01)).meep([
          { to: twtInstancePast.address, amount: 10000 },
          { to: twtInstancePast.address, amount: 10000 },
        ]);
      });
    });
  });
});
