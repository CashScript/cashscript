// Code taken and adapted from https://github.com/bitcoinjs/bip68
// If we make signficant changes to this code, we should also take and adapt the tests from that repository.

// see https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki#compatibility

const SEQUENCE_FINAL = 0xffffffff;
const SEQUENCE_LOCKTIME_DISABLE_FLAG = (1 << 31);
const SEQUENCE_LOCKTIME_GRANULARITY = 9;
const SEQUENCE_LOCKTIME_MASK = 0x0000ffff;
const SEQUENCE_LOCKTIME_TYPE_FLAG = (1 << 22);

const BLOCKS_MAX = SEQUENCE_LOCKTIME_MASK;
const SECONDS_MOD = 1 << SEQUENCE_LOCKTIME_GRANULARITY;
const SECONDS_MAX = SEQUENCE_LOCKTIME_MASK << SEQUENCE_LOCKTIME_GRANULARITY;

interface DecodedSequence {
  blocks?: number;
  seconds?: number;
}

export function decodeBip68(sequence: number): DecodedSequence {
  // If the disable flag is set, we return an empty object
  if (sequence & SEQUENCE_LOCKTIME_DISABLE_FLAG) return {};

  // If the SEQUENCE_LOCKTIME_TYPE_FLAG is set, that means that the sequence is in seconds
  if (sequence & SEQUENCE_LOCKTIME_TYPE_FLAG) {
    // If the sequence is in seconds, we need to shift it by the granularity
    // (because every "unit" of time corresponds to 512 seconds)
    const seconds = (sequence & SEQUENCE_LOCKTIME_MASK) << SEQUENCE_LOCKTIME_GRANULARITY;
    return { seconds };
  }

  // If the disable flag is not set, and the SEQUENCE_LOCKTIME_TYPE_FLAG is not set, the sequence is in blocks
  const blocks = sequence & SEQUENCE_LOCKTIME_MASK;
  return { blocks };
}

export function encodeBip68({ blocks, seconds }: DecodedSequence): number {
  if (blocks !== undefined && seconds !== undefined) throw new TypeError('Cannot encode blocks AND seconds');

  // If the input is correct, we encode it as a sequence in seconds (using the SEQUENCE_LOCKTIME_TYPE_FLAG)
  if (seconds !== undefined) {
    if (!Number.isFinite(seconds)) throw new TypeError('Expected Number seconds');
    if (seconds > SECONDS_MAX) throw new TypeError('Expected Number seconds <= ' + SECONDS_MAX);
    if (seconds % SECONDS_MOD !== 0) throw new TypeError('Expected Number seconds as a multiple of ' + SECONDS_MOD);

    return SEQUENCE_LOCKTIME_TYPE_FLAG | (seconds >> SEQUENCE_LOCKTIME_GRANULARITY);
  }

  // If the input is correct, we return the blocks (no further encoding needed)
  if (blocks !== undefined) {
    if (!Number.isFinite(blocks)) throw new TypeError('Expected Number blocks');
    if (blocks > SEQUENCE_LOCKTIME_MASK) throw new TypeError('Expected Number blocks <= ' + BLOCKS_MAX);

    return blocks;
  }

  // If neither blocks nor seconds are provided, we assume the sequence is final
  return SEQUENCE_FINAL;
}
