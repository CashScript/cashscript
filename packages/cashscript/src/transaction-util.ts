import {
  AbiFunction,
  Script,
  Data,
} from 'cashc';
import { Utxo, Output } from './interfaces';
import { BitcoinCashUtil, ScriptUtil, CryptoUtil } from './BITBOX';
import { Parameter, encodeParameter } from './Parameter';

export function selectUtxos(
  utxos: Utxo[],
  outputs: Output[],
  placeholderScript: Buffer,
): { utxos: Utxo[], change: number } {
  const initialFee = BitcoinCashUtil.getByteCount({}, { P2PKH: outputs.length + 1 });
  let satsNeeded = outputs.reduce((acc, output) => acc + output.amount, initialFee);
  let satsAvailable = 0;

  const selected: Utxo[] = [];
  for (const utxo of utxos) {
    selected.push(utxo);
    satsAvailable += utxo.satoshis;
    satsNeeded += inputSize(placeholderScript);
    if (satsAvailable > satsNeeded) break;
  }

  const change = satsAvailable - satsNeeded;

  if (change < 0) {
    throw new Error(`Insufficient balance: available (${satsAvailable}) < needed (${satsNeeded}).`);
  }

  return { utxos: selected, change };
}

function inputSize(script: Buffer) {
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

export function meep(tx: any, utxos: Utxo[], script: Script) {
  const scriptPubkey: string = ScriptUtil.encodeP2SHOutput(
    CryptoUtil.hash160(
      ScriptUtil.encode(script),
    ),
  ).toString('hex');
  console.log(`meep debug --tx=${tx.toHex()} --idx=0 --amt=${utxos[0].satoshis} --pkscript=${scriptPubkey}`);
}
