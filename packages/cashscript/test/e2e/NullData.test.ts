import { binToHex } from '@bitauth/libauth';
import { compileString } from 'cashc';
import { Contract, MockNetworkProvider, TransactionBuilder } from '../../src/index.js';
import { randomUtxo } from '../../src/utils.js';

// Chunk sizes around the boundaries of OP_PUSHBYTES_N (1-75), OP_PUSHDATA1 (76-255) and the signed OP_SIZE (128).
// 216 bytes is the largest chunk that fits in the standard 223-byte data carrier limit (together with the 0x6d02 chunk).
const CHUNK_SIZES = [0, 1, 75, 76, 127, 128, 216];
const chunks = CHUNK_SIZES.map((size) => `0x${binToHex(new Uint8Array(size).fill(0xab))}`);

const artifact = compileString(`
  contract NullData() {
    ${CHUNK_SIZES.map((size, i) => `
    function literal${size}() {
      require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([0x6d02, ${chunks[i]}]));
    }`).join('\n')}

    function runtime(bytes chunk) {
      require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([0x6d02, chunk]));
    }
  }
`);

describe('LockingBytecodeNullData', () => {
  const provider = new MockNetworkProvider();
  const contract = new Contract(artifact, [], { provider });
  const contractUtxo = provider.addUtxo(contract.address, randomUtxo());

  CHUNK_SIZES.forEach((size, i) => {
    it(`should match the SDK's OP_RETURN encoding for a literal chunk of ${size} bytes`, () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock[`literal${size}`]())
        .addOpReturnOutput(['0x6d02', chunks[i]]);

      expect(() => transaction.debug()).not.toThrow();
    });

    it(`should match the SDK's OP_RETURN encoding for a runtime chunk of ${size} bytes`, () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock.runtime(chunks[i]))
        .addOpReturnOutput(['0x6d02', chunks[i]]);

      expect(() => transaction.debug()).not.toThrow();
    });
  });
});
