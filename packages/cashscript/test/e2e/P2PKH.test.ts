import { binToHex } from '@bitauth/libauth';
import {
  Contract, SignatureTemplate, MockNetworkProvider, ElectrumNetworkProvider,
  FailedRequireError,
  TransactionBuilder,
} from '../../src/index.js';
import {
  bobAddress,
  bobPub,
  bobPriv,
  bobPkh,
  alicePriv,
  alicePub,
  aliceAddress,
} from '../fixture/vars.js';
import { gatherUtxos, getTxOutputs } from '../test-util.js';
import { Network } from '../../src/interfaces.js';
import {
  createOpReturnOutput, randomUtxo,
} from '../../src/utils.js';
import artifact from '../fixture/p2pkh.artifact.js';

describe('P2PKH-no-tokens', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);

  // define contract in the describe block so artifact typings aren't lost
  const p2pkhContract = new Contract(artifact, [bobPkh], { provider });

  beforeAll(() => {
    // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other (P2PKH tokens) tests
    console.log(p2pkhContract.tokenAddress);
    (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo({ satoshis: 10000000n }));
    (provider as any).addUtxo?.(p2pkhContract.address, randomUtxo({ satoshis: 10000000n }));
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
  });

  describe('send', () => {
    it('should fail when using incorrect public key', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(alicePub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('P2PKH.cash:4 Require statement failed at input 0 in contract P2PKH.cash at line 4.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(hash160(pk) == pkh)');
    });

    it('should fail when using incorrect signature', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount });

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('P2PKH.cash:5 Require statement failed at input 0 in contract P2PKH.cash at line 5.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(checkSig(s, pk))');
    });

    it('should succeed when using correct function arguments', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
      expect(tx.txid).toBeDefined();
    });

    it('should fail when not enough satoshis are provided in utxos', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 1000n;
      const { utxos, total, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount });
      const failureAmount = total + 1n;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount: failureAmount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      // TODO: this fails on mocknet, because mocknet doesn't check inputs vs outputs,
      // we should add a sanity check in our own code
      await expect(txPromise).rejects.toThrow();
    });

    it('should succeed when providing UTXOs to .addInputs', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 1000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput({ to, amount: changeAmount })
        .send();

      // then
      expect.hasAssertions();
      tx.inputs.forEach((input) => {
        expect(utxos.find((utxo) => (
          utxo.txid === binToHex(input.outpointTransactionHash)
          && utxo.vout === input.outpointIndex
        ))).toBeTruthy();
      });
    });

    it('can call addOutput() multiple times', async () => {
      // given
      const outputs = [
        { to: p2pkhContract.address, amount: 10_000n },
        { to: p2pkhContract.address, amount: 20_000n },
      ];
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount: 30_000n, fee: 2000n });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to: outputs[0].to, amount: outputs[0].amount })
        .addOutput({ to: outputs[1].to, amount: outputs[1].amount })
        .addOutput({ to: aliceAddress, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can send to list of recipients', async () => {
      // given
      const outputs = [
        { to: p2pkhContract.address, amount: 10_000n },
        { to: p2pkhContract.address, amount: 20_000n },
      ];
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount: 30_000n, fee: 2000n });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutputs(outputs)
        .addOutput({ to: aliceAddress, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can include OP_RETURN data as an output', async () => {
      // given
      const opReturnData = ['0x6d02', 'Hello, World!', '0x01'];
      const to = p2pkhContract.address;
      const amount = 10000n;
      const { utxos, changeAmount } = gatherUtxos(await p2pkhContract.getUtxos(), { amount });

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(utxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput(createOpReturnOutput(opReturnData))
        .addOutput({ to: aliceAddress, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      const expectedOutputs = [{ to, amount }, createOpReturnOutput(opReturnData)];
      expect(txOutputs).toEqual(expect.arrayContaining(expectedOutputs));
    });

    it('can include UTXOs from P2PKH addresses', async () => {
      // given
      const to = bobAddress;
      const amount = 10000n;
      const bobSignatureTemplate = new SignatureTemplate(bobPriv);

      const contractUtxos = await p2pkhContract.getUtxos();
      const bobUtxos = await provider.getUtxos(bobAddress);

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(bobUtxos[0], bobSignatureTemplate.unlockP2PKH())
        .addInput(contractUtxos[1], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(bobUtxos[1], bobSignatureTemplate.unlockP2PKH())
        .addOutput({ to, amount })
        .addOutput({ to, amount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
