import { Utxo, Output } from './interfaces';
import { BitcoinCashUtil, ScriptUtil } from './BITBOX';
import { Script } from '../generation/Script';
import { AbiFunction } from './ABI';
import { Parameter, Sig } from './Contract';
import { PrimitiveType, Type } from '../ast/Type';
import { encodeBool, encodeInt, encodeString } from '../util';

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
  const scriptSizeSize = encodeInt(scriptSize).byteLength;
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
    .map((p, i) => encodeParameter(p, abiFunction.parameters[i]))
    .reverse();
  if (selector) unlockScript.unshift(encodeInt(selector));

  // Create total input script / scriptSig
  return ScriptUtil.encodeP2SHInput(
    ScriptUtil.encode(unlockScript),
    ScriptUtil.encode(redeemScript),
  );
}

export function typecheckParameter(parameter: Parameter, type: Type): void {
  switch (type) {
    case PrimitiveType.BOOL:
      if (typeof parameter === 'boolean') return;
      throw new Error();
    case PrimitiveType.INT:
      if (typeof parameter === 'number') return;
      throw new Error();
    case PrimitiveType.STRING:
      if (typeof parameter !== 'string') return;
      throw new Error();
    case PrimitiveType.SIG:
      if (typeof parameter === 'string') return;
      if (parameter instanceof Buffer) return;
      if (parameter instanceof Sig) return;
      throw new Error();
    default:
      if (typeof parameter === 'string') return;
      if (parameter instanceof Buffer) return;
      throw new Error();
  }
}

export function encodeParameter(parameter: Parameter, type: Type): Buffer {
  switch (type) {
    case PrimitiveType.BOOL:
      if (typeof parameter !== 'boolean') throw new Error();
      return encodeBool(parameter);
    case PrimitiveType.INT:
      if (typeof parameter !== 'number') throw new Error();
      return encodeInt(parameter);
    case PrimitiveType.STRING:
      if (typeof parameter !== 'string') throw new Error();
      return encodeString(parameter);
    default:
      if (typeof parameter === 'string') {
        if (parameter.startsWith('0x')) {
          parameter = parameter.slice(2);
        }

        return Buffer.from(parameter, 'hex');
      }
      if (!(parameter instanceof Buffer)) throw Error();
      return parameter;
  }
}
