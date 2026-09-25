import { compileString } from 'cashc';
import { Contract, MockNetworkProvider, TransactionBuilder, Unlocker } from '../../src/index.js';
import { randomUtxo } from '../../src/utils.js';

// Chunk sizes around the boundaries of OP_PUSHBYTES_N (1-75), OP_PUSHDATA1 (76-255) and the signed OP_SIZE (128).
// 216 bytes is the largest chunk that fits in the standard 223-byte data carrier limit (together with the 0x6d02 chunk).
const CHUNK_SIZES = [0, 1, 75, 76, 127, 128, 216];
const hexChunk = (size: number): string => `0x${'ab'.repeat(size)}`;
const stringChunk = (size: number): string => 'a'.repeat(size);

// Chunks with a known value (hex and string literals), a known length (bytesN) and an unknown length (bytes)
const artifact = compileString(`
  contract NullData() {
    ${CHUNK_SIZES.map((size) => `
    function hex${size}() {
      require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([0x6d02, ${hexChunk(size)}]));
    }

    function string${size}() {
      require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([0x6d02, bytes('${stringChunk(size)}')]));
    }
    ${size === 0 ? '' : `
    function bounded${size}(bytes${size} chunk) {
      require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([0x6d02, chunk]));
    }`}`).join('\n')}

    function runtime(bytes chunk) {
      require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([0x6d02, chunk]));
    }
  }
`);

describe('LockingBytecodeNullData', () => {
  const provider = new MockNetworkProvider();
  const contract = new Contract(artifact, [], { provider });
  const contractUtxo = provider.addUtxo(contract.address, randomUtxo());

  const expectSdkEncoding = (unlocker: Unlocker, chunk: string): void => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, unlocker)
      .addOpReturnOutput(['0x6d02', chunk]);

    expect(() => transaction.debug()).not.toThrow();
  };

  CHUNK_SIZES.forEach((size) => {
    it(`should match the SDK's OP_RETURN encoding for a hex literal chunk of ${size} bytes`, () => {
      expectSdkEncoding(contract.unlock[`hex${size}`](), hexChunk(size));
    });

    it(`should match the SDK's OP_RETURN encoding for a string literal chunk of ${size} bytes`, () => {
      expectSdkEncoding(contract.unlock[`string${size}`](), stringChunk(size));
    });

    if (size > 0) {
      it(`should match the SDK's OP_RETURN encoding for a bytes${size} chunk`, () => {
        expectSdkEncoding(contract.unlock[`bounded${size}`](hexChunk(size)), hexChunk(size));
      });
    }

    it(`should match the SDK's OP_RETURN encoding for a runtime chunk of ${size} bytes`, () => {
      expectSdkEncoding(contract.unlock.runtime(hexChunk(size)), hexChunk(size));
    });
  });
});
