import { binToHex } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src';
import {
  alicePkh,
  alicePk,
  alice,
  bob,
  aliceAddress,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { Utxo } from '../../src/interfaces';
import { createOpReturnOutput } from '../../src/util';
import { FailedSigCheckError, Reason } from '../../src/Errors';

describe('P2PKH', () => {
  let p2pkhInstance: Contract;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    const artifact = require('../fixture/p2pkh.json');
    const provider = new ElectrumNetworkProvider();
    p2pkhInstance = new Contract(artifact, [alicePkh], provider);
    console.log(p2pkhInstance.address);
  });

  describe('send', () => {
    it('should fail when using incorrect function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000;

      // when
      const txPromise = p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(bob))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should succeed when using correct function arguments', async () => {
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
      expect(tx.txid).toBeDefined();
    });

    it('should fail when not enough satoshis are provided in utxos', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 1000;
      const utxos = await p2pkhInstance.getUtxos();
      utxos.sort((a, b) => (a.satoshis > b.satoshis ? 1 : -1));
      const { utxos: gathered } = gatherUtxos(utxos, { amount });
      const failureAmount = gathered.reduce((acc, utxo) => acc + utxo.satoshis, 0) + 1;

      // when
      const txPromise = p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .from(gathered)
        .to(to, failureAmount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow();
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
      receipt.inputs.forEach((input) => {
        expect(gathered.find((utxo) => (
          utxo.txid === binToHex(input.outpointTransactionHash)
          && utxo.vout === input.outpointIndex
        ))).toBeTruthy();
      });
    });

    it('can call to() multiple times', async () => {
      // given
      const outputs = [
        { to: p2pkhInstance.address, amount: 10000 },
        { to: p2pkhInstance.address, amount: 20000 },
      ];

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(outputs[0].to, outputs[0].amount)
        .to(outputs[1].to, outputs[1].amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can send to list of recipients', async () => {
      // given
      const outputs = [
        { to: p2pkhInstance.address, amount: 10000 },
        { to: p2pkhInstance.address, amount: 20000 },
      ];

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .to(outputs)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can include OP_RETURN data as an output', async () => {
      // given
      const opReturn = ['0x6d02', 'Hello, World!', '0x01'];
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

    it('can include UTXOs from P2PKH addresses', async () => {
      // given
      const to = aliceAddress;
      const amount = 10000;

      const contractUtxos = await p2pkhInstance.getUtxos();
      const aliceUtxos = await getAddressUtxos(aliceAddress);

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePk, new SignatureTemplate(alice))
        .experimentalFromP2PKH(aliceUtxos[0], new SignatureTemplate(alice))
        .from(contractUtxos[0])
        .experimentalFromP2PKH(aliceUtxos[1], new SignatureTemplate(alice))
        .from(contractUtxos[1])
        .to(to, amount)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

async function getAddressUtxos(address: string): Promise<Utxo[]> {
  return new ElectrumNetworkProvider().getUtxos(address);
}

function gatherUtxos(
  utxos: Utxo[],
  options?: { amount?: number, fees?: number },
): { utxos: Utxo[], total: number } {
  const targetUtxos: Utxo[] = [];
  let total = 0;
  // 1000 for fees
  const { amount = 0, fees = 1000 } = options ?? {};
  for (const utxo of utxos) {
    if (total - fees > amount) break;
    total += utxo.satoshis;
    targetUtxos.push(utxo);
  }
  return {
    utxos: targetUtxos,
    total,
  };
}
