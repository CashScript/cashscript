import {
  lockingBytecodeToCashAddress,
  hexToBin,
  Transaction,
  binToHex,
  binToBigIntUint64LE,
} from '@bitauth/libauth';
import { Output, Network } from '../src/interfaces';
import { network as defaultNetwork } from './fixture/vars';
import { getNetworkPrefix } from '../src/utils';

export function getTxOutputs(tx: Transaction, network: Network = defaultNetwork): Output[] {
  return tx.outputs.map((o) => {
    const OP_RETURN = '6a';
    const scriptHex = binToHex(o.lockingBytecode);

    if (scriptHex.startsWith(OP_RETURN)) {
      return { to: hexToBin(scriptHex), amount: 0 };
    }

    const prefix = getNetworkPrefix(network);
    const address = lockingBytecodeToCashAddress(hexToBin(scriptHex), prefix) as string;
    return {
      to: address,
      amount: Number(binToBigIntUint64LE(o.satoshis)),
    };
  });
}
