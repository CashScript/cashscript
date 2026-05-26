import { type LibauthOutput, isContractUnlocker, type PlaceholderP2PKHUnlocker, type UnlockableUtxo } from './interfaces.js';
import { type AbiFunction, type Artifact } from '@cashscript/utils';
import { cashAddressToLockingBytecode, hexToBin, type Input, type TransactionCommon } from '@bitauth/libauth';

// Wallet Connect interfaces according to the spec
// see https://github.com/mainnet-pat/wc2-bch-bcr

export interface WcTransactionOptions {
  broadcast?: boolean;
  userPrompt?: string;
}

export interface WcTransactionObject {
  transaction: TransactionCommon; // spec also allows for a tx hex string but we use the libauth transaction object
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

export function getWcContractInfo(input: UnlockableUtxo): WcContractInfo | {} {
  // If the input does not have a contract unlocker, return an empty object
  if (!(isContractUnlocker(input.unlocker))) return {};
  const contract = input.unlocker.contract;
  const abiFunctionName = input.unlocker.abiFunction?.name;
  const abiFunction = contract.artifact.abi.find(abi => abi.name === abiFunctionName);
  if (!abiFunction) {
    throw new Error(`ABI function ${abiFunctionName} not found in contract artifact`);
  }
  const wcContractObj: WcContractInfo = {
    contract: {
      abiFunction: abiFunction,
      redeemScript: hexToBin(contract.bytecode),
      artifact: contract.artifact,
    },
  };
  return wcContractObj;
}

/**
 * A zero-filled 65-byte Schnorr signature placeholder. Used when building a WalletConnect
 * transaction object where the final signature will be supplied by the connected wallet, so the
 * transaction can be assembled and size-estimated beforehand.
 *
 * @returns A 65-byte `Uint8Array` filled with zeros.
 */
export const placeholderSignature = (): Uint8Array => Uint8Array.from(Array(65));

/**
 * A zero-filled 33-byte compressed public key placeholder. Used when building a WalletConnect
 * transaction object where the actual public key will be filled in by the connected wallet.
 *
 * @returns A 33-byte `Uint8Array` filled with zeros.
 */
export const placeholderPublicKey = (): Uint8Array => Uint8Array.from(Array(33));

/**
 * Create a placeholder P2PKH `Unlocker` for the provided user address. The returned unlocker
 * generates an empty unlocking bytecode and is flagged as `placeholder: true`, which is useful
 * when building a transaction object for WalletConnect signing where the final signing is
 * performed by the connected wallet.
 *
 * @param userAddress - The user's CashAddress that will eventually sign the input.
 * @returns A placeholder unlocker that can be passed to `TransactionBuilder.addInput`.
 * @throws If `userAddress` is not a valid CashAddress.
 */
export const placeholderP2PKHUnlocker = (userAddress: string): PlaceholderP2PKHUnlocker => {
  const decodeAddressResult = cashAddressToLockingBytecode(userAddress);

  if (typeof decodeAddressResult === 'string') {
    throw new Error(`Invalid address: ${decodeAddressResult}`);
  }

  const lockingBytecode = decodeAddressResult.bytecode;
  return {
    generateLockingBytecode: () => lockingBytecode,
    generateUnlockingBytecode: () => Uint8Array.from(Array(0)),
    placeholder: true,
  };
};
