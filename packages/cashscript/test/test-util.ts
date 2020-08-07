import { Address } from 'bitbox-sdk';
import { Output } from '../src/interfaces';
import { network } from './fixture/vars';

export function getTxOutputs(tx: any): Output[] {
  return tx.outs.map((o: any) => {
    const OP_RETURN = '6a';
    const scriptHex = o.script.toString('hex');
    if (scriptHex.startsWith(OP_RETURN)) {
      return { to: Buffer.from(scriptHex, 'hex'), amount: 0 };
    } else {
      const address = new Address().fromOutputScript(Buffer.from(scriptHex, 'hex'), network);
      return {
        to: address,
        amount: o.value,
      };
    }
  });
}
