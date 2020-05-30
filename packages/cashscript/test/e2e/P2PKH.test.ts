import path from 'path';
import { Contract, Instance, SignatureTemplate } from '../../src';
import {
  alicePkh,
  alicePk,
  alice,
  bob,
  network,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { Utxo, TxnDetailValueIn } from '../../src/interfaces';
import { createOpReturnOutput } from '../../src/util';
import { FailedSigCheckError, Reason } from '../../src/Errors';

describe('P2PKH', () => {
  let p2pkhInstance: Instance;
  beforeAll(() => {
    const P2PKH = Contract.import(path.join(__dirname, '..', 'fixture', 'p2pkh.json'), network);
    p2pkhInstance = P2PKH.new(alicePkh);
    console.log(p2pkhInstance.address);
  });

  describe('send', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000;

      // when
      const expectPromise = expect(
        p2pkhInstance.functions
          .spend(alicePk, new SignatureTemplate(bob))
          .to(to, amount)
          .send(),
      );

      // then
      await expectPromise.rejects.toThrow(FailedSigCheckError);
      await expectPromise.rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should succeed when using correct function parameters', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000;

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });

    it('should fail when not enough satoshis are provided in utxos', async () => {
      // when
      const to = p2pkhInstance.address;
      const amount = 1000;
      const utxos = await p2pkhInstance.getUtxos();
      utxos.sort((a, b) => (a.satoshis > b.satoshis ? 1 : -1));
      const { utxos: gathered, failureAmount } = gatherUtxos(utxos, { amount });

      // send
      await expect(
        p2pkhInstance.functions
          .spend(alicePk, new SignatureTemplate(alice))
          .from(gathered)
          .to(to, failureAmount)
          .send(),
      ).rejects.toThrow();

      await expect(
        p2pkhInstance.functions
          .spend(alicePk, new SignatureTemplate(alice))
          .to(to, failureAmount)
          .send(),
      ).resolves.toBeTruthy();
    });

    it('should succeed when providing UTXOs', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 1000;
      const utxos = await p2pkhInstance.getUtxos();
      utxos.sort((a, b) => (a.satoshis > b.satoshis ? 1 : -1));
      const { utxos: gathered } = gatherUtxos(utxos, { amount });

      // when
      const receipt = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .from(gathered)
        .to(to, amount)
        .send();

      // then
      expect.hasAssertions();
      for (const input of receipt.vin as TxnDetailValueIn[]) {
        expect(gathered.find(utxo => (
          utxo.txid === input.txid
          && utxo.vout === input.vout
          && utxo.satoshis === input.value
        ))).toBeTruthy();
      }
    });

    it('can send to multiple recipients', async () => {
      // given
      const outputs = [
        { to: p2pkhInstance.address, amount: 10000 },
        { to: p2pkhInstance.address, amount: 20000 },
      ];

      // when
      const tx1 = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(outputs)
        .send();

      const tx2 = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(outputs[0].to, outputs[0].amount)
        .to(outputs[1].to, outputs[1].amount)
        .send();

      // then
      const txOutputs1 = getTxOutputs(tx1);
      const txOutputs2 = getTxOutputs(tx2);
      expect(txOutputs1).toEqual(expect.arrayContaining(outputs));
      expect(txOutputs2).toEqual(expect.arrayContaining(outputs));
    });

    it('can include OP_RETURN data as an output', async () => {
      // given
      const opReturn = ['0x6d02', 'Hello, World!'];
      const to = p2pkhInstance.address;
      const amount = 10000;

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(to, amount)
        .withOpReturn(opReturn)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      const expectedOutputs = [{ to, amount }, createOpReturnOutput(opReturn)];
      expect(txOutputs).toEqual(expect.arrayContaining(expectedOutputs));
    });
  });
});

function gatherUtxos(utxos: Utxo[], options?: {
  amount?: number,
  fees?: number
}): { utxos: Utxo[], total: number, failureAmount: number } {
  const targetUtxos: Utxo[] = [];
  let total = 0;
  let failureAmount = 0;
  // 1000 for fees
  const { amount = 0, fees = 1000 } = options || {};
  for (const utxo of utxos) {
    failureAmount += utxo.satoshis;
    if (total - fees > amount) break;
    total += utxo.satoshis;
    targetUtxos.push(utxo);
  }
  return {
    utxos: targetUtxos,
    total,
    failureAmount,
  };
}
