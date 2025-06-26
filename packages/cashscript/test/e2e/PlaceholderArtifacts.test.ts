import { placeholder } from '@cashscript/utils';
import {
  Contract,
  MockNetworkProvider,
  randomUtxo,
  replaceArtifactPlaceholders,
  SignatureTemplate,
  TransactionBuilder
} from '../../src/index.js';
import { alicePriv, alicePub } from '../fixture/vars.js';
import { gatherUtxos } from '../test-util.js';

const artifact = {
  contractName: "PlaceholderArtifact",
  constructorInputs: [],
  abi: [
    {
      name: "spend",
      inputs: []
    }
  ],
  bytecode: "<publickey> OP_SIZE 21 OP_EQUALVERIFY OP_DROP <bounded_bytes2> OP_SIZE OP_2 OP_EQUALVERIFY OP_DROP <rawbytes> OP_SIZE OP_4 OP_EQUALVERIFY OP_DROP <datasignature> OP_DROP <signature> OP_DROP <0x_text> 61626364 OP_EQUALVERIFY <text> 61626364 OP_EQUALVERIFY <integer> OP_16 OP_EQUALVERIFY <boolean> OP_1 OP_EQUALVERIFY OP_1",
  source: "",
  compiler: {
    name: "cashc",
    version: "0.11.0"
  },
  updatedAt: "2025-06-12T06:27:28.123Z"
} as const;

describe('Placeholder artifact tests', () => {
  const provider = new MockNetworkProvider();

  it('unreplaced placeholders left', async () => {
    expect(() => replaceArtifactPlaceholders(structuredClone(artifact), {
    })).toThrow(/Not all placeholders in artifact PlaceholderArtifact/);
  });

  it('SignatureTemplate not allowed', async () => {
    expect(() => replaceArtifactPlaceholders(structuredClone(artifact), {
      signature: new SignatureTemplate(alicePriv),
    })).toThrow(/Cannot use signature templates/);
  });

  it('spend', async () => {
    const replacedArtifact = replaceArtifactPlaceholders(structuredClone(artifact), {
      boolean: true,
      integer: 16n,
      text: 'abcd',
      '0x_text': '0x61626364',
      signature: placeholder(65),
      datasignature: placeholder(64),
      rawbytes: new Uint8Array([1, 2, 3, 4]),
      bounded_bytes2: new Uint8Array([5, 6]),
      publickey: alicePub,
    });

    expect(replacedArtifact.bytecode).toBe(
      '0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088 OP_SIZE 21 OP_EQUALVERIFY OP_DROP 0506 OP_SIZE OP_2 OP_EQUALVERIFY OP_DROP 01020304 OP_SIZE OP_4 OP_EQUALVERIFY OP_DROP 00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 OP_DROP 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 OP_DROP 61626364 61626364 OP_EQUALVERIFY 61626364 61626364 OP_EQUALVERIFY 10 OP_16 OP_EQUALVERIFY 01 OP_1 OP_EQUALVERIFY OP_1'
    );

    const contract = new Contract(replacedArtifact, [], { provider });

    provider.addUtxo(contract.address, randomUtxo());

    const to = contract.address;
    const amount = 1000n;
    const { utxos, changeAmount } = gatherUtxos(await contract.getUtxos(), { amount });

    // when
    const txPromise = new TransactionBuilder({ provider })
      .addInputs(utxos, contract.unlock.spend())
      .addOutput({ to, amount: changeAmount })
      .send();

    await expect(txPromise).resolves.not.toThrow();
  });
});
