import { decodeTransactionUnsafe, hexToBin, stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../../src/index.js';
import {
  bobAddress,
  bobPub,
  bobPriv,
  bobPkh,
} from '../../fixture/vars.js';
import { Network, Utxo } from '../../../src/interfaces.js';
import { utxoComparator, calculateDust } from '../../../src/utils.js';
import artifact from '../../fixture/p2pkh.json' assert { type: "json" };
import { TransactionBuilder } from '../../../src/TransactionBuilder.js';

describe('Transaction Builder', () => {
  const provider = new ElectrumNetworkProvider(Network.CHIPNET);
  let p2pkhInstance: Contract;

  beforeAll(() => {
    // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other (P2PKH tokens) tests
    p2pkhInstance = new Contract(artifact, [bobPkh], { provider });
    console.log(p2pkhInstance.tokenAddress);
  });

  describe('should return the same transaction as the simple transaction builder', () => {
    it('for a single-output (+ change) transaction from a single type of contract', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 1000n;
      const fee = 1000n;

      const utxos = await p2pkhInstance.getUtxos();
      utxos.sort(utxoComparator).reverse();
      const { utxos: gathered, total } = gatherUtxos(utxos, { amount });

      const change = total - amount - fee;
      const dustAmount = calculateDust({ to, amount: change });

      if (change < 0) {
        throw new Error('Not enough funds to send transaction');
      }

      // when
      const simpleTransaction = await p2pkhInstance.functions
        .spend(bobPub, new SignatureTemplate(bobPriv))
        .from(gathered)
        .to(to, amount)
        .to(change > dustAmount ? [{ to, amount: change }] : [])
        .withoutChange()
        .build();

      const advancedTransaction = await new TransactionBuilder({ provider })
        .addInputs(gathered, p2pkhInstance.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutputs(change > dustAmount ? [{ to, amount: change }] : [])
        .build();

      const simpleDecoded = stringify(decodeTransactionUnsafe(hexToBin(simpleTransaction)));
      const advancedDecoded = stringify(decodeTransactionUnsafe(hexToBin(advancedTransaction)));

      // then
      expect(advancedDecoded).toEqual(simpleDecoded);
    });

    it('for a multi-output (+ change) transaction with P2SH and P2PKH inputs', async () => {
      // given
      const to = bobAddress;
      const amount = 10000n;
      const fee = 1000n;

      const contractUtxos = await p2pkhInstance.getUtxos();
      const bobUtxos = await getAddressUtxos(bobAddress);
      const bobTemplate = new SignatureTemplate(bobPriv);

      const totalInputUtxos = [...contractUtxos.slice(0, 2), ...bobUtxos.slice(0, 2)];
      const totalInputAmount = totalInputUtxos.reduce((acc, utxo) => acc + utxo.satoshis, 0n);

      const change = totalInputAmount - (amount * 2n) - fee;
      const dustAmount = calculateDust({ to, amount: change });
      console.log('bob UTXOs', bobUtxos);
      console.log('contract UTXOs', contractUtxos);

      if (change < 0) {
        throw new Error('Not enough funds to send transaction');
      }

      // when
      const simpleTransaction = await p2pkhInstance.functions
        .spend(bobPub, bobTemplate)
        .fromP2PKH(bobUtxos[0], bobTemplate)
        .from(contractUtxos[0])
        .fromP2PKH(bobUtxos[1], bobTemplate)
        .from(contractUtxos[1])
        .to(to, amount)
        .to(to, amount)
        .to(change > dustAmount ? [{ to, amount: change }] : [])
        .withoutChange()
        .build();

      const advancedTransaction = await new TransactionBuilder({ provider })
        .addInput(bobUtxos[0], bobTemplate.unlockP2PKH())
        .addInput(contractUtxos[0], p2pkhInstance.unlock.spend(bobPub, bobTemplate))
        .addInput(bobUtxos[1], bobTemplate.unlockP2PKH())
        .addInput(contractUtxos[1], p2pkhInstance.unlock.spend(bobPub, bobTemplate))
        .addOutput({ to, amount })
        .addOutput({ to, amount })
        .addOutputs(change > dustAmount ? [{ to, amount: change }] : [])
        .build();

      const simpleDecoded = stringify(decodeTransactionUnsafe(hexToBin(simpleTransaction)));
      const advancedDecoded = stringify(decodeTransactionUnsafe(hexToBin(advancedTransaction)));

      // then
      expect(advancedDecoded).toEqual(simpleDecoded);
    });

    it.todo('2 different smart contracts and P2PKH');
    it.todo('op_return');
    it.todo('locktime fail + success cases');
    it.todo('max fee fail + success cases');
  });
});

async function getAddressUtxos(address: string): Promise<Utxo[]> {
  return new ElectrumNetworkProvider(Network.CHIPNET).getUtxos(address);
}

function gatherUtxos(
  utxos: Utxo[],
  options?: { amount?: bigint, fees?: bigint },
): { utxos: Utxo[], total: bigint } {
  const targetUtxos: Utxo[] = [];
  let total = 0n;

  // 1000 for fees
  const { amount = 0n, fees = 1000n } = options ?? {};

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
