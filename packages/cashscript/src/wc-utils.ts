import { isStandardUnlockableUtxo } from './index.js';
import type { UnlockableUtxo, StandardUnlockableUtxo, LibauthOutput } from './interfaces.js';
import { generateLibauthSourceOutputs } from './utils.js';
import { type AbiFunction, type Artifact, scriptToBytecode } from '@cashscript/utils';
import type { Input, TransactionCommon } from '@bitauth/libauth';

// Wallet Connect interfaces according to the spec
// see https://github.com/mainnet-pat/wc2-bch-bcr

export interface WcContractInfo {
  contract?: {
    abiFunction: AbiFunction;
    redeemScript: Uint8Array;
    artifact: Partial<Artifact>;
  }
}

export type WcSourceOutputs = (Input & LibauthOutput & WcContractInfo)[];

function getWcContractInfo(input: StandardUnlockableUtxo): WcContractInfo | {} {
  // If the input does not have a contract unlocker, return an empty object
  if (!('contract' in input.unlocker)) return {};
  const contract = input.unlocker.contract;
  const abiFunctionName = input.unlocker.abiFunction?.name;
  const abiFunction = contract.artifact.abi.find(abi => abi.name === abiFunctionName);
  if (!abiFunction) {
    throw new Error(`ABI function ${abiFunctionName} not found in contract artifact`);
  }
  const wcContractObj:WcContractInfo = {
    contract: {
      abiFunction: abiFunction,
      redeemScript: scriptToBytecode(contract.redeemScript),
      artifact: contract.artifact,
    },
  };
  return wcContractObj;
}

export function generateWcSourceOutputs(
  inputs: UnlockableUtxo[], decodedTransaction:TransactionCommon,
): WcSourceOutputs {
  if (!inputs.every(input => isStandardUnlockableUtxo(input))) {
    throw new Error('All inputs must be StandardUnlockableUtxos to generate the wcSourceOutputs');
  }
  const sourceOutputs = generateLibauthSourceOutputs(inputs);
  const wcSourceOutputs: WcSourceOutputs = sourceOutputs.map((sourceOutput, index) => {
    return {
      ...sourceOutput,
      ...decodedTransaction.inputs[index],
      ...getWcContractInfo(inputs[index]),
    };
  });
  return wcSourceOutputs;
}
