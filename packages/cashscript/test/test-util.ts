import { TxnDetailsResult } from 'bitcoin-com-rest';
import { BigNumber } from 'bignumber.js';
import { Output } from '../src/interfaces';

export function getTxOutputs(tx: TxnDetailsResult): Output[] {
  return tx.vout.map((o: any) => {
    if (o.scriptPubKey.asm.startsWith('OP_RETURN')) {
      return { to: Buffer.from(o.scriptPubKey.hex, 'hex'), amount: 0 };
    } else {
      return {
        to: o.scriptPubKey.cashAddrs[0] as string,
        amount: new BigNumber(o.value).multipliedBy(1e8).toNumber(),
      };
    }
  });
}
