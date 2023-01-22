import {
  lockingBytecodeToCashAddress,
  hexToBin,
  Transaction,
  binToHex,
  binToBigIntUint64LE,
} from '@bitauth/libauth';
import { Output, Network } from '../src/interfaces.js';
import { network as defaultNetwork } from './fixture/vars.js';
import { getNetworkPrefix } from '../src/utils.js';

export function getTxOutputs(tx: Transaction, network: Network = defaultNetwork): Output[] {
  return tx.outputs.map((o) => {
    const OP_RETURN = '6a';
    const scriptHex = binToHex(o.lockingBytecode);

    if (scriptHex.startsWith(OP_RETURN)) {
      return { to: hexToBin(scriptHex), amount: BigInt(0) };
    }

    const prefix = getNetworkPrefix(network);
    const address = lockingBytecodeToCashAddress(hexToBin(scriptHex), prefix) as string;
    return {
      to: address,
      amount: binToBigIntUint64LE(o.satoshis),
    };
  });
}
