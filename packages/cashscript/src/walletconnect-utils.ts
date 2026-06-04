import {
  type LibauthOutput,
  isContractUnlocker,
  type PlaceholderP2PKHUnlocker,
  type PlaceholderP2PKHUnlockerOptions,
  type UnlockableUtxo,
} from './interfaces.js';
import { type AbiFunction, type Artifact } from '@cashscript/utils';
import { cashAddressToLockingBytecode, hexToBin, type Input, type TransactionCommon } from '@bitauth/libauth';

// Wallet Connect interfaces according to the spec
// see https://github.com/mainnet-pat/wc2-bch-bcr

export interface WalletConnectTransactionOptions {
  broadcast?: boolean;
  userPrompt?: string;
}

/** @deprecated Use `WalletConnectTransactionOptions` instead. */
export type WcTransactionOptions = WalletConnectTransactionOptions;

export interface WalletConnectTransactionObject {
  transaction: TransactionCommon; // spec also allows for a tx hex string but we use the libauth transaction object
  sourceOutputs: WalletConnectSourceOutput[];
  broadcast?: boolean;
  userPrompt?: string;
}

/** @deprecated Use `WalletConnectTransactionObject` instead. */
export type WcTransactionObject = WalletConnectTransactionObject;

export type WizardConnectInputPath = [inputIndex: number, pathName: string, addressIndex: number];

export interface WizardConnectTransactionObject {
  transaction: WalletConnectTransactionObject;
  inputPaths: WizardConnectInputPath[];
}

export type WalletConnectSourceOutput = Input & LibauthOutput & WalletConnectContractInfo;

/** @deprecated Use `WalletConnectSourceOutput` instead. */
export type WcSourceOutput = WalletConnectSourceOutput;

export interface WalletConnectContractInfo {
  contract?: {
    abiFunction: AbiFunction;
    redeemScript: Uint8Array;
    artifact: Partial<Artifact>;
  }
}

/** @deprecated Use `WalletConnectContractInfo` instead. */
export type WcContractInfo = WalletConnectContractInfo;

export function getWcContractInfo(input: UnlockableUtxo): WalletConnectContractInfo | {} {
  // If the input does not have a contract unlocker, return an empty object
  if (!(isContractUnlocker(input.unlocker))) return {};

  const contract = input.unlocker.contract;
  const abiFunctionName = input.unlocker.abiFunction?.name;
  const abiFunction = contract.artifact.abi.find(abi => abi.name === abiFunctionName);

  if (!abiFunction) {
    throw new Error(`ABI function ${abiFunctionName} not found in contract artifact`);
  }

  const walletConnectContractObject: WalletConnectContractInfo = {
    contract: {
      abiFunction: abiFunction,
      redeemScript: hexToBin(contract.bytecode),
      artifact: contract.artifact,
    },
  };

  return walletConnectContractObject;
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
 * when building a transaction object for WalletConnect / WizardConnect signing where the final
 * signing is performed by the connected wallet.
 *
 * @param userAddress - The user's CashAddress that will eventually sign the input
 * @param options - Optional signing metadata, such as HD path information for WizardConnect.
 * @returns A placeholder unlocker that can be passed to `TransactionBuilder.addInput`.
 * @throws If `userAddress` is not a valid CashAddress.
 */
export function placeholderP2PKHUnlocker(
  userAddress: string,
  options: PlaceholderP2PKHUnlockerOptions = {},
): PlaceholderP2PKHUnlocker {
  const decodeAddressResult = cashAddressToLockingBytecode(userAddress);

  if (typeof decodeAddressResult === 'string') {
    throw new Error(`Invalid address: ${decodeAddressResult}`);
  }

  const lockingBytecode = decodeAddressResult.bytecode;
  return {
    generateLockingBytecode: () => lockingBytecode,
    generateUnlockingBytecode: () => Uint8Array.from(Array(0)),
    placeholder: true,
    address: userAddress,
    ...options,
  };
}
