import {
  AbiFunction,
  Script,
  Data,
  Op,
} from 'cashc';
import { Utxo, OpReturn } from './interfaces';
import { ScriptUtil, CryptoUtil } from './BITBOX';
import { Parameter, encodeParameter } from './Parameter';

export function inputSize(script: Buffer): number {
  const scriptSize = script.byteLength;
  const scriptSizeSize = Data.encodeInt(scriptSize).byteLength;
  return 32 + 4 + scriptSizeSize + scriptSize + 4;
}

export function createInputScript(
  redeemScript: Script,
  abiFunction: AbiFunction,
  parameters: Parameter[],
  selector?: number,
): Buffer {
  // Create unlock script / redeemScriptSig
  const unlockScript = parameters
    .map((p, i) => encodeParameter(p, abiFunction.inputs[i].type))
    .reverse();
  if (selector !== undefined) unlockScript.push(Data.encodeInt(selector));

  // Create total input script / scriptSig
  return ScriptUtil.encodeP2SHInput(
    ScriptUtil.encode(unlockScript),
    ScriptUtil.encode(redeemScript),
  );
}
export function createOpReturnScript(
  opReturnOutput: OpReturn,
): Buffer {
  const script = [
    Op.OP_RETURN,
    ...opReturnOutput.opReturn.map((output: string) => toBuffer(output)),
  ];

  return ScriptUtil.encode(script);
}

function toBuffer(output: string): Buffer {
  const data = output.replace(/^0x/, '');
  const format = data === output ? 'utf8' : 'hex';
  return Buffer.from(data, format);
}

export function meep(tx: any, utxos: Utxo[], script: Script): void {
  const scriptPubkey: string = ScriptUtil.encodeP2SHOutput(
    CryptoUtil.hash160(
      ScriptUtil.encode(script),
    ),
  ).toString('hex');
  console.log(`meep debug --tx=${tx.toHex()} --idx=0 --amt=${utxos[0].satoshis} --pkscript=${scriptPubkey}`);
}
