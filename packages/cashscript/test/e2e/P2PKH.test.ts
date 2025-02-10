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
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { Network, Utxo } from '../../src/interfaces.js';
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
  let contractUtxos: Utxo[];

  beforeAll(() => {
    // Note: We instantiate the contract with bobPkh to avoid mempool conflicts with other (P2PKH tokens) tests
    console.log(p2pkhContract.tokenAddress);
    contractUtxos = [randomUtxo({ satoshis: 10000000n }), randomUtxo({ satoshis: 10000000n })];
    (provider as any).addUtxo?.(p2pkhContract.address, contractUtxos[0]);
    (provider as any).addUtxo?.(p2pkhContract.address, contractUtxos[1]);
  });

  describe('send', () => {
    it('should fail when using incorrect public key', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 10000n;

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(alicePub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
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

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount })
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

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
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

      // when
      const txPromise = new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount: contractUtxos[0].satoshis + amount })
        .send();

      // then
      await expect(txPromise).rejects.toThrow();
    });

    it('should succeed when providing UTXOs to .addInputs', async () => {
      // given
      const to = p2pkhContract.address;
      const amount = 1000n;

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInputs(contractUtxos, p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount: contractUtxos[0].satoshis + amount })
        .send();

      // then
      expect.hasAssertions();
      tx.inputs.forEach((input) => {
        expect(contractUtxos.find((utxo) => (
          utxo.txid === binToHex(input.outpointTransactionHash)
          && utxo.vout === input.outpointIndex
        ))).toBeTruthy();
      });
    });

    it('can call addOutput() multiple times', async () => {
      // given
      const outputs = [
        { to: p2pkhContract.address, amount: 10000n },
        { to: p2pkhContract.address, amount: 20000n },
      ];

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to: outputs[0].to, amount: outputs[0].amount })
        .addOutput({ to: outputs[1].to, amount: outputs[1].amount })
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can send to list of recipients', async () => {
      // given
      const outputs = [
        { to: p2pkhContract.address, amount: 10000n },
        { to: p2pkhContract.address, amount: 20000n },
      ];

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutputs(outputs)
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

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, new SignatureTemplate(bobPriv)))
        .addOutput({ to, amount })
        .addOutput(createOpReturnOutput(opReturnData))
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

      const bobUtxos = [randomUtxo(), randomUtxo()];
      (provider as any).addUtxo?.(p2pkhContract.address, bobUtxos[0]);
      (provider as any).addUtxo?.(p2pkhContract.address, bobUtxos[1]);

      // when
      const tx = await new TransactionBuilder({ provider })
        .addInput(contractUtxos[0], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(contractUtxos[1], p2pkhContract.unlock.spend(bobPub, bobSignatureTemplate))
        .addInput(bobUtxos[0], bobSignatureTemplate.unlockP2PKH())
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
