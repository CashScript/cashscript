import { Contract, ElectrumNetworkProvider, MockNetworkProvider, Network, TransactionBuilder } from '../../src/index.js';
import { getLargestUtxo, getTxOutputs } from '../test-util.js';
import { FailedRequireError } from '../../src/Errors.js';
import { createOpReturnOutput, randomUtxo } from '../../src/utils.js';
import { aliceAddress } from '../fixture/vars.js';
import artifact from '../fixture/announcement.artifact.js';

describe('Announcement', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);
  const announcement = new Contract(artifact, [], { provider });
  const minerFee = 1000n;

  beforeAll(() => {
    console.log(announcement.address);
    (provider as any).addUtxo?.(announcement.address, randomUtxo());
  });

  describe('send', () => {
    it('should fail when trying to send money ', async () => {
      // given
      const to = announcement.address;
      const amount = 1000n;
      const contractUtxo = getLargestUtxo(await announcement.getUtxos());

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, announcement.unlock.announce())
        .addOutput({ to, amount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Announcement.cash:16 Require statement failed at input 0 in contract Announcement.cash at line 16.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[0].value == 0)');
    });

    it('should fail when trying to announce incorrect announcement', async () => {
      // given
      const str = 'A contract may injure a human being and, through inaction, allow a human being to come to harm.';
      const contractUtxo = getLargestUtxo(await announcement.getUtxos());

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, announcement.unlock.announce())
        .addOutput(createOpReturnOutput(['0x6d02', str]))
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Announcement.cash:17 Require statement failed at input 0 in contract Announcement.cash at line 17.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[0].lockingBytecode == announcement)');
    });

    it('should fail when sending incorrect amount of change', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const contractUtxo = getLargestUtxo(await announcement.getUtxos());
      const changeAmount = contractUtxo.satoshis - minerFee;
      const incorrectChangeAmount = changeAmount * 2n;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, announcement.unlock.announce())
        .addOutput(createOpReturnOutput(['0x6d02', str]))
        .addOutput({ to: announcement.address, amount: incorrectChangeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Announcement.cash:25 Require statement failed at input 0 in contract Announcement.cash at line 25.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[1].value == changeAmount)');
    });

    it('should fail when sending the correct change amount to an incorrect address', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const contractUtxo = getLargestUtxo(await announcement.getUtxos());
      const changeAmount = contractUtxo.satoshis - minerFee;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxo, announcement.unlock.announce())
        .addOutput(createOpReturnOutput(['0x6d02', str]))
        .addOutput({ to: aliceAddress, amount: changeAmount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow('Announcement.cash:24 Require statement failed at input 0 in contract Announcement.cash at line 24.');
      await expect(txPromise).rejects.toThrow('Failing statement: require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode)');
    });

    it('should succeed when announcing correct announcement', async () => {
      // given
      const str = 'A contract may not injure a human being or, through inaction, allow a human being to come to harm.';
      const contractUtxo = getLargestUtxo(await announcement.getUtxos());
      const changeAmount = contractUtxo.satoshis - minerFee;

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxo, announcement.unlock.announce())
        .addOutput(createOpReturnOutput(['0x6d02', str]))
        .addOutput({ to: announcement.address, amount: changeAmount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([createOpReturnOutput(['0x6d02', str])]));
    });
  });
});
