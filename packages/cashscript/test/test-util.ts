import { TxnDetailsResult } from 'bitcoin-com-rest';
import { BigNumber } from 'bignumber.js';
import { OutputForBuilder } from '../src/interfaces';

export function getTxOutputs(tx: TxnDetailsResult): OutputForBuilder[] {
  return tx.vout.map((o: any) => ({
    to: o.scriptPubKey.cashAddrs[0] as string,
    amount: new BigNumber(o.value).multipliedBy(1e8).toNumber(),
  }));
}
