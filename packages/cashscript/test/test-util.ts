import {
  lockingBytecodeToCashAddress,
  hexToBin,
  Transaction,
  binToHex,
  binToBigIntUint64LE,
} from '@bitauth/libauth';
import { Output } from '../src/interfaces';
import { network } from './fixture/vars';
import { getNetworkPrefix } from '../src/util';

export function getTxOutputs(tx: Transaction): Output[] {
  return tx.outputs.map((o) => {
    const OP_RETURN = '6a';
    const scriptHex = binToHex(o.lockingBytecode);
    if (scriptHex.startsWith(OP_RETURN)) {
      return { to: Buffer.from(scriptHex, 'hex'), amount: 0 };
    } else {
      const prefix = getNetworkPrefix(network);
      const address = lockingBytecodeToCashAddress(hexToBin(scriptHex), prefix) as string;
      return {
        to: address,
        amount: Number(binToBigIntUint64LE(o.satoshis)),
      };
    }
  });
}
