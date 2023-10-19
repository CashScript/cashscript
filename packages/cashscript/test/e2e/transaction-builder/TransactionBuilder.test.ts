import { decodeTransactionUnsafe, hexToBin, stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../../src/index.js';
import {
  bobAddress,
  bobPub,
  bobPriv,
  carolPkh,
  carolPub,
  carolAddress,
  carolPriv,
} from '../../fixture/vars.js';
import { Network, Utxo } from '../../../src/interfaces.js';
import { utxoComparator, calculateDust } from '../../../src/utils.js';
import p2pkhArtifact from '../../fixture/p2pkh.json' assert { type: "json" };
import twtArtifact from '../../fixture/transfer_with_timeout.json' assert { type: "json" };
import { TransactionBuilder } from '../../../src/TransactionBuilder.js';
import { getTxOutputs } from '../../test-util.js';

describe('Transaction Builder', () => {
  const provider = new ElectrumNetworkProvider(Network.CHIPNET);
  let p2pkhInstance: Contract;
  let twtInstance: Contract;

  beforeAll(() => {
    // Note: We instantiate the contract with carolPkh to avoid mempool conflicts with other (P2PKH) tests
    p2pkhInstance = new Contract(p2pkhArtifact, [carolPkh], { provider });
    twtInstance = new Contract(twtArtifact, [bobPub, carolPub, 100000n], { provider });
    console.log(p2pkhInstance.tokenAddress);
    console.log(twtInstance.tokenAddress);
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
        .withTime(0)
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
        .withTime(0)
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
  });

  it('should build a transaction that can spend from 2 different contracts and P2PKH + OP_RETURN', async () => {
    const fee = 1000n;

    const carolUtxos = await provider.getUtxos(carolAddress);
    const p2pkhUtxos = await p2pkhInstance.getUtxos();
    const twtUtxos = await twtInstance.getUtxos();

    const change = carolUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: carolAddress, amount: change });

    const outputs = [
      { to: p2pkhInstance.address, amount: p2pkhUtxos[0].satoshis },
      { to: twtInstance.address, amount: twtUtxos[0].satoshis },
      ...(change > dustAmount ? [{ to: carolAddress, amount: change }] : []),
    ];

    if (change < 0) {
      throw new Error('Not enough funds to send transaction');
    }

    const tx = await new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addInput(twtUtxos[0], twtInstance.unlock.transfer(new SignatureTemplate(carolPriv)))
      .addInput(carolUtxos[0], new SignatureTemplate(carolPriv).unlockP2PKH())
      .addOpReturnOutput(['Hello new transaction builder'])
      .addOutputs(outputs)
      .send();

    const txOutputs = getTxOutputs(tx);
    expect(txOutputs).toEqual(expect.arrayContaining(outputs));
  });

  it('should fail when fee is higher than maxFee', async () => {
    const fee = 2000n;
    const maxFee = 1000n;
    const p2pkhUtxos = await p2pkhInstance.getUtxos();

    const amount = p2pkhUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

    if (amount < dustAmount) {
      throw new Error('Not enough funds to send transaction');
    }

    const txPromise = new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addOutput({ to: p2pkhInstance.address, amount })
      .setMaxFee(maxFee)
      .send();

    await expect(txPromise).rejects.toThrow(`Transaction fee of ${fee} is higher than max fee of ${maxFee}`);
  });

  it('should succeed when fee is lower than maxFee', async () => {
    const fee = 1000n;
    const maxFee = 2000n;
    const p2pkhUtxos = await p2pkhInstance.getUtxos();

    const amount = p2pkhUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

    if (amount < dustAmount) {
      throw new Error('Not enough funds to send transaction');
    }

    const tx = await new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addOutput({ to: p2pkhInstance.address, amount })
      .setMaxFee(maxFee)
      .send();

    const txOutputs = getTxOutputs(tx);
    expect(txOutputs).toEqual(expect.arrayContaining([{ to: p2pkhInstance.address, amount }]));
  });

  it('should fail when locktime is higher than current block height', async () => {
    const fee = 1000n;
    const p2pkhUtxos = await p2pkhInstance.getUtxos();

    const amount = p2pkhUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

    if (amount < dustAmount) {
      throw new Error('Not enough funds to send transaction');
    }

    const blockHeight = await provider.getBlockHeight();

    const txPromise = new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addOutput({ to: p2pkhInstance.address, amount })
      .setLocktime(blockHeight + 100)
      .send();

    await expect(txPromise).rejects.toThrow(/non-final transaction/);
  });

  it('should succeed when locktime is lower than current block height', async () => {
    const fee = 1000n;
    const p2pkhUtxos = await p2pkhInstance.getUtxos();

    const amount = p2pkhUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

    if (amount < dustAmount) {
      throw new Error('Not enough funds to send transaction');
    }

    const blockHeight = await provider.getBlockHeight();

    const tx = await new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addOutput({ to: p2pkhInstance.address, amount })
      .setLocktime(blockHeight - 100)
      .send();

    const txOutputs = getTxOutputs(tx);
    expect(txOutputs).toEqual(expect.arrayContaining([{ to: p2pkhInstance.address, amount }]));
  });

  it.todo('test sequence numbers');
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
