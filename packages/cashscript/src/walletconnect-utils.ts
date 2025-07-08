import type { StandardUnlockableUtxo, LibauthOutput, Unlocker } from './interfaces.js';
import { type AbiFunction, type Artifact, scriptToBytecode } from '@cashscript/utils';
import { cashAddressToLockingBytecode, type Input, type TransactionCommon } from '@bitauth/libauth';

// Wallet Connect interfaces according to the spec
// see https://github.com/mainnet-pat/wc2-bch-bcr

export interface WcTransactionOptions {
  broadcast?: boolean;
  userPrompt?: string;
}

export interface WcTransactionObject {
  transaction: TransactionCommon | string;
  sourceOutputs: WcSourceOutput[];
  broadcast?: boolean;
  userPrompt?: string;
}

export type WcSourceOutput = Input & LibauthOutput & WcContractInfo;

export interface WcContractInfo {
  contract?: {
    abiFunction: AbiFunction;
    redeemScript: Uint8Array;
    artifact: Partial<Artifact>;
  }
}

export function getWcContractInfo(input: StandardUnlockableUtxo): WcContractInfo | {} {
  // If the input does not have a contract unlocker, return an empty object
  if (!('contract' in input.unlocker)) return {};
  const contract = input.unlocker.contract;
  const abiFunctionName = input.unlocker.abiFunction?.name;
  const abiFunction = contract.artifact.abi.find(abi => abi.name === abiFunctionName);
  if (!abiFunction) {
    throw new Error(`ABI function ${abiFunctionName} not found in contract artifact`);
  }
  const wcContractObj: WcContractInfo = {
    contract: {
      abiFunction: abiFunction,
      redeemScript: scriptToBytecode(contract.redeemScript),
      artifact: contract.artifact,
    },
  };
  return wcContractObj;
}

export const placeholderSignature = (): Uint8Array => Uint8Array.from(Array(65));
export const placeholderPublicKey = (): Uint8Array => Uint8Array.from(Array(33));

export const placeholderP2PKHUnlocker = (userAddress: string): Unlocker => {
  const decodeAddressResult = cashAddressToLockingBytecode(userAddress);

  if (typeof decodeAddressResult === 'string') {
    throw new Error(`Invalid address: ${decodeAddressResult}`);
  }

  const lockingBytecode = decodeAddressResult.bytecode;
  return {
    generateLockingBytecode: () => lockingBytecode,
    generateUnlockingBytecode: () => Uint8Array.from(Array(0)),
  };
};
