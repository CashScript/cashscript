import { Contract, ElectrumNetworkProvider, MockNetworkProvider, Network, TransactionBuilder } from '../../src/index.js';
import {
  alicePkh,
  bobPkh,
  aliceAddress,
  bobAddress,
} from '../fixture/vars.js';
import { addUtxo, getLargestUtxo, getTxOutputs } from '../test-util.js';
import { FailedRequireError } from '../../src/Errors.js';
import artifact from '../fixture/mecenas.artifact.js';
import { randomUtxo } from '../../src/utils.js';

// Mecenas has this.age check omitted for testing
describe('Mecenas', () => {
  const provider = process.env.TESTS_USE_CHIPNET
    ? new ElectrumNetworkProvider(Network.CHIPNET)
    : new MockNetworkProvider();

  const pledge = 10_000n;
  const mecenas = new Contract(artifact, [alicePkh, bobPkh, pledge], { provider });
  const minerFee = 1000n;

  beforeAll(async () => {
    console.log(mecenas.address);
    await addUtxo(provider, mecenas.address, randomUtxo());
  });

  describe('send', () => {
    it('should fail when trying to spend multiple contract inputs', async () => {
      // given
      const recipient = aliceAddress;
      const pledgeAmount = pledge;
      // Ensure a second contract UTXO exists so we can try to spend two at once
      await addUtxo(provider, mecenas.address, randomUtxo());
      const contractUtxos = (await mecenas.getUtxos()).slice(0, 2);
      expect(contractUtxos).toHaveLength(2);
      const totalInput = contractUtxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const changeAmount = totalInput - pledgeAmount - minerFee;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], mecenas.unlock.receive())
        .addInput(contractUtxos[1], mecenas.unlock.receive())
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: mecenas.address, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Mecenas.cash:14 Require statement failed at input 0 in contract Mecenas.cash at line 14.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.inputs.length == 1)');
    });

    it('should fail when trying to send more than pledge', async () => {
      // given
      const recipient = aliceAddress;
      const pledgeAmount = pledge + 10n;
      const contractUtxo = getLargestUtxo(await mecenas.getUtxos());
      const changeAmount = contractUtxo.satoshis - pledgeAmount - minerFee;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, mecenas.unlock.receive())
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: mecenas.address, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Mecenas.cash:28 Require statement failed at input 0 in contract Mecenas.cash at line 28.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[0].value == pledge)');
    });

    it('should fail when trying to send to wrong person', async () => {
      // given
      const recipient = bobAddress;
      const pledgeAmount = pledge;
      const contractUtxo = getLargestUtxo(await mecenas.getUtxos());
      const changeAmount = contractUtxo.satoshis - pledgeAmount - minerFee;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, mecenas.unlock.receive())
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: mecenas.address, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Mecenas.cash:17 Require statement failed at input 0 in contract Mecenas.cash at line 17.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient))');
    });

    it('should fail when trying to send to multiple people', async () => {
      // given
      const recipient = aliceAddress;
      const pledgeAmount = pledge;
      const contractUtxo = getLargestUtxo(await mecenas.getUtxos());
      const changeAmount = contractUtxo.satoshis - pledgeAmount * 2n - minerFee;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, mecenas.unlock.receive())
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: mecenas.address, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Mecenas.cash:29 Require statement failed at input 0 in contract Mecenas.cash at line 29.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode)');
    });

    it('should fail when sending incorrect amount of change', async () => {
      // given
      const recipient = aliceAddress;
      const pledgeAmount = pledge;
      const contractUtxo = getLargestUtxo(await mecenas.getUtxos());
      const changeAmount = contractUtxo.satoshis - pledgeAmount - minerFee;
      const incorrectChangeAmount = BigInt(Math.floor(Number(changeAmount) * 0.8));

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, mecenas.unlock.receive())
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: mecenas.address, amount: incorrectChangeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Mecenas.cash:30 Require statement failed at input 0 in contract Mecenas.cash at line 30.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[1].value == changeValue)');
    });

    it('should succeed when sending pledge to receiver', async () => {
      // given
      const recipient = aliceAddress;
      const pledgeAmount = pledge;
      const contractUtxo = getLargestUtxo(await mecenas.getUtxos());
      const changeAmount = contractUtxo.satoshis - pledgeAmount - minerFee;

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxo, mecenas.unlock.receive())
        .addOutput({ to: recipient, amount: pledgeAmount })
        .addOutput({ to: mecenas.address, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to: recipient, amount: pledgeAmount }]));
    });
  });
});
