import { decodeTransactionUnsafe, hexToBin, stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider, MockNetworkProvider } from '../src/index.js';
import {
  bobAddress,
  bobPub,
  bobPriv,
  carolPkh,
  carolPub,
  carolAddress,
  carolPriv,
  bobTokenAddress,
} from './fixture/vars.js';
import { Network } from '../src/interfaces.js';
import { utxoComparator, calculateDust, randomUtxo, randomToken, isNonTokenUtxo, isFungibleTokenUtxo } from '../src/utils.js';
import p2pkhArtifact from './fixture/p2pkh.json' with { type: 'json' };
import twtArtifact from './fixture/transfer_with_timeout.json' with { type: 'json' };
import { TransactionBuilder } from '../src/TransactionBuilder.js';
import { gatherUtxos, getTxOutputs } from './test-util.js';

describe('Transaction Builder', () => {
  const provider = process.env.TESTS_USE_MOCKNET
    ? new MockNetworkProvider()
    : new ElectrumNetworkProvider(Network.CHIPNET);

  let p2pkhInstance: Contract;
  let twtInstance: Contract;

  beforeAll(() => {
    // Note: We instantiate the contract with carolPkh to avoid mempool conflicts with other (P2PKH) tests
    p2pkhInstance = new Contract(p2pkhArtifact, [carolPkh], { provider });
    twtInstance = new Contract(twtArtifact, [bobPub, carolPub, 100000n], { provider });
    console.log(p2pkhInstance.tokenAddress);
    console.log(twtInstance.tokenAddress);
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({ token: randomToken() }));
    (provider as any).addUtxo?.(twtInstance.address, randomUtxo());
    (provider as any).addUtxo?.(twtInstance.address, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(bobAddress, randomUtxo());
    (provider as any).addUtxo?.(carolAddress, randomUtxo());
    (provider as any).addUtxo?.(carolAddress, randomUtxo());
  });

  describe('should return the same transaction as the simple transaction builder', () => {
    it('for a single-output (+ change) transaction from a single type of contract', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 1000n;
      const fee = 2000n;

      const utxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
      const { utxos: gathered, total } = gatherUtxos(utxos, { amount, fee });

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
        .withoutTokenChange()
        .withTime(0)
        .build();

      const advancedTransaction = new TransactionBuilder({ provider })
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
      const fee = 2000n;

      const contractUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
      const bobUtxos = await provider.getUtxos(bobAddress);
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
        .withoutTokenChange()
        .withTime(0)
        .build();

      const advancedTransaction = new TransactionBuilder({ provider })
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

    const carolUtxos = (await provider.getUtxos(carolAddress)).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
    const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
    const twtUtxos = (await twtInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

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

    const tx = new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addInput(twtUtxos[0], twtInstance.unlock.transfer(new SignatureTemplate(carolPriv)))
      .addInput(carolUtxos[0], new SignatureTemplate(carolPriv).unlockP2PKH())
      .addOpReturnOutput(['Hello new transaction builder'])
      .addOutputs(outputs)
      .build();

    const txOutputs = getTxOutputs(decodeTransactionUnsafe(hexToBin(tx)));
    expect(txOutputs).toEqual(expect.arrayContaining(outputs));
  });

  it('should fail when fee is higher than maxFee', async () => {
    const fee = 2000n;
    const maxFee = 1000n;
    const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

    const amount = p2pkhUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

    if (amount < dustAmount) {
      throw new Error('Not enough funds to send transaction');
    }

    expect(() => {
      new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: p2pkhInstance.address, amount })
        .setMaxFee(maxFee)
        .build();
    }).toThrow(`Transaction fee of ${fee} is higher than max fee of ${maxFee}`);
  });

  it('should succeed when fee is lower than maxFee', async () => {
    const fee = 1000n;
    const maxFee = 2000n;
    const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

    const amount = p2pkhUtxos[0].satoshis - fee;
    const dustAmount = calculateDust({ to: p2pkhInstance.address, amount });

    if (amount < dustAmount) {
      throw new Error('Not enough funds to send transaction');
    }

    const tx = new TransactionBuilder({ provider })
      .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
      .addOutput({ to: p2pkhInstance.address, amount })
      .setMaxFee(maxFee)
      .build();

    expect(tx).toBeDefined();
  });

  // TODO: Consider improving error messages checked below to also include the input/output index

  it('should fail when trying to send to invalid addres', async () => {
    const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();

    expect(() => {
      new TransactionBuilder({ provider })
        .addInput(p2pkhUtxos[0], p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: bobAddress.slice(0, -1), amount: 1000n })
        .build();
    }).toThrow('CashAddress decoding error');
  });

  it('should fail when trying to send tokens to non-token address', async () => {
    const tokenUtxo = (await p2pkhInstance.getUtxos()).find(isFungibleTokenUtxo)!;

    expect(() => {
      new TransactionBuilder({ provider })
        .addInput(tokenUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: bobAddress, amount: 1000n, token: tokenUtxo.token })
        .build();
    }).toThrow('Tried to send tokens to an address without token support');
  });

  it('should fail when trying to send negative BCH amount or token amount', async () => {
    const tokenUtxo = (await p2pkhInstance.getUtxos()).find(isFungibleTokenUtxo)!;

    expect(() => {
      new TransactionBuilder({ provider })
        .addInput(tokenUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: bobTokenAddress, amount: -1000n, token: tokenUtxo.token })
        .build();
    }).toThrow('Tried to add an output with -1000 satoshis, which is less than the required minimum for this output-type');

    expect(() => {
      new TransactionBuilder({ provider })
        .addInput(tokenUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: bobTokenAddress, amount: 1000n, token: { amount: -1000n, category: tokenUtxo.token!.category } })
        .build();
    }).toThrow('Tried to add an output with -1000 tokens, which is invalid');
  });

  it('should fail when adding undefined input', async () => {
    const p2pkhUtxos = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo).sort(utxoComparator).reverse();
    const undefinedUtxo = p2pkhUtxos[1000];

    expect(() => {
      new TransactionBuilder({ provider })
        .addInput(undefinedUtxo, p2pkhInstance.unlock.spend(carolPub, new SignatureTemplate(carolPriv)))
        .addOutput({ to: bobAddress, amount: 1000n })
        .build();
    }).toThrow('Input is undefined');
  });
});
