import {
  AbiFunction,
  AbiInput,
  Artifact,
  bytecodeToScript,
  formatBitAuthScript,
} from '@cashscript/utils';
import {
  hexToBin,
  WalletTemplateScenarioTransactionOutput,
  WalletTemplateScenario,
  decodeTransaction,
  binToHex,
  WalletTemplate,
  WalletTemplateScenarioInput,
  TransactionBCH,
  binToBase64,
  utf8ToBin,
  isHex,
  WalletTemplateScenarioOutput,
  WalletTemplateVariable,
  WalletTemplateScriptLocking,
  WalletTemplateScriptUnlocking,
  WalletTemplateScenarioBytecode,
} from '@bitauth/libauth';
import { deflate } from 'pako';
import {
  Utxo,
  isUtxoP2PKH,
  TokenDetails,
  LibauthTokenDetails,
  Output,
  AddressType,
  SignatureAlgorithm,
  HashType,
} from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';
import { Transaction } from './Transaction.js';
import { EncodedConstructorArgument, EncodedFunctionArgument } from './Argument.js';
import { addressToLockScript, extendedStringify, snakeCase, zip } from './utils.js';
import { Contract } from './Contract.js';

interface BuildTemplateOptions {
  transaction: Transaction;
  transactionHex?: string;
}

export const buildTemplate = async ({
  transaction,
  transactionHex = undefined, // set this argument to prevent unnecessary call `transaction.build()`
}: BuildTemplateOptions): Promise<WalletTemplate> => {
  const contract = transaction.contract;
  const txHex = transactionHex ?? await transaction.build();

  const template = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: 'CashScript Generated Debugging Template',
    supported: ['BCH_2025_05'],
    version: 0,
    entities: generateTemplateEntities(contract.artifact, transaction.abiFunction, transaction.encodedFunctionArgs),
    scripts: generateTemplateScripts(
      contract.artifact,
      contract.addressType,
      transaction.abiFunction,
      transaction.encodedFunctionArgs,
      contract.encodedConstructorArgs,
    ),
    scenarios: generateTemplateScenarios(
      contract,
      transaction,
      txHex,
      contract.artifact,
      transaction.abiFunction,
      transaction.encodedFunctionArgs,
      contract.encodedConstructorArgs,
    ),
  } as WalletTemplate;

  transaction.inputs
    .forEach((input, index) => {
      if (!isUtxoP2PKH(input)) return;

      const lockScriptName = `p2pkh_placeholder_lock_${index}`;
      const unlockScriptName = `p2pkh_placeholder_unlock_${index}`;
      const placeholderKeyName = `placeholder_key_${index}`;

      const signatureAlgorithmName = getSignatureAlgorithmName(input.template.getSignatureAlgorithm());
      const hashtypeName = getHashTypeName(input.template.getHashType(false));
      const signatureString = `${placeholderKeyName}.${signatureAlgorithmName}.${hashtypeName}`;

      template.entities[snakeCase(contract.name + 'Parameters')].scripts!.push(lockScriptName, unlockScriptName);
      template.entities[snakeCase(contract.name + 'Parameters')].variables = {
        ...template.entities[snakeCase(contract.name + 'Parameters')].variables,
        [placeholderKeyName]: {
          description: placeholderKeyName,
          name: placeholderKeyName,
          type: 'Key',
        },
      };

      // add extra unlocking and locking script for P2PKH inputs spent alongside our contract
      // this is needed for correct cross-references in the template
      template.scripts[unlockScriptName] = {
        name: unlockScriptName,
        script:
          `<${signatureString}>\n<${placeholderKeyName}.public_key>`,
        unlocks: lockScriptName,
      };
      template.scripts[lockScriptName] = {
        lockingType: 'standard',
        name: lockScriptName,
        script:
          `OP_DUP\nOP_HASH160 <$(<${placeholderKeyName}.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG`,
      };
    });

  return template;
};

export const getBitauthUri = (template: WalletTemplate): string => {
  const base64toBase64Url = (base64: string): string => base64.replace(/\+/g, '-').replace(/\//g, '_');
  const payload = base64toBase64Url(binToBase64(deflate(utf8ToBin(extendedStringify(template)))));
  return `https://ide.bitauth.com/import-template/${payload}`;
};


const generateTemplateEntities = (
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
): WalletTemplate['entities'] => {
  const functionParameters = Object.fromEntries<WalletTemplateVariable>(
    abiFunction.inputs.map((input, index) => ([
      snakeCase(input.name),
      {
        description: `"${input.name}" parameter of function "${abiFunction.name}"`,
        name: input.name,
        type: encodedFunctionArgs[index] instanceof SignatureTemplate ? 'Key' : 'WalletData',
      },
    ])),
  );

  const constructorParameters = Object.fromEntries<WalletTemplateVariable>(
    artifact.constructorInputs.map((input) => ([
      snakeCase(input.name),
      {
        description: `"${input.name}" parameter of this contract`,
        name: input.name,
        type: 'WalletData',
      },
    ])),
  );

  const entities = {
    [snakeCase(artifact.contractName + 'Parameters')]: {
      description: 'Contract creation and function parameters',
      name: snakeCase(artifact.contractName + 'Parameters'),
      scripts: [
        snakeCase(artifact.contractName + '_lock'),
        snakeCase(artifact.contractName + '_unlock'),
      ],
      variables: {
        ...functionParameters,
        ...constructorParameters,
      },
    },
  };

  // function_index is a special variable that indicates the function to execute
  if (artifact.abi.length > 1) {
    entities[snakeCase(artifact.contractName + 'Parameters')].variables.function_index = {
      description: 'Script function index to execute',
      name: 'function_index',
      type: 'WalletData',
    };
  }

  return entities;
};

const generateTemplateScripts = (
  artifact: Artifact,
  addressType: AddressType,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  encodedConstructorArgs: EncodedConstructorArgument[],
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode
  return {
    [snakeCase(artifact.contractName + '_unlock')]: generateTemplateUnlockScript(artifact, abiFunction, encodedFunctionArgs),
    [snakeCase(artifact.contractName + '_lock')]: generateTemplateLockScript(artifact, addressType, encodedConstructorArgs),
  };
};

const generateTemplateLockScript = (
  artifact: Artifact,
  addressType: AddressType,
  constructorArguments: EncodedFunctionArgument[],
): WalletTemplateScriptLocking => {
  return {
    lockingType: addressType,
    name: snakeCase(artifact.contractName + '_lock'),
    script: [
      `// "${artifact.contractName}" contract constructor parameters`,
      formatParametersForDebugging(artifact.constructorInputs, constructorArguments),
      '',
      '// bytecode',
      formatBytecodeForDebugging(artifact),
    ].join('\n'),
  };
};

const generateTemplateUnlockScript = (
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
): WalletTemplateScriptUnlocking => {
  const functionIndex = artifact.abi.findIndex((func) => func.name === abiFunction.name);

  const functionIndexString = artifact.abi.length > 1
    ? ['// function index in contract', `<function_index> // int = <${functionIndex}>`, '']
    : [];

  return {
    // this unlocking script must pass our only scenario
    passes: [snakeCase(artifact.contractName + 'Evaluate')],
    name: snakeCase(artifact.contractName + '_unlock'),
    script: [
      `// "${abiFunction.name}" function parameters`,
      formatParametersForDebugging(abiFunction.inputs, encodedFunctionArgs),
      '',
      ...functionIndexString,
    ].join('\n'),
    unlocks: snakeCase(artifact.contractName + '_lock'),
  };
};

const generateTemplateScenarios = (
  contract: Contract,
  transaction: Transaction,
  transactionHex: string,
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  encodedConstructorArgs: EncodedConstructorArgument[],
): WalletTemplate['scenarios'] => {
  const libauthTransaction = decodeTransaction(hexToBin(transactionHex));
  if (typeof libauthTransaction === 'string') throw Error(libauthTransaction);

  const scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    [snakeCase(artifact.contractName + 'Evaluate')]: {
      name: snakeCase(artifact.contractName + 'Evaluate'),
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: {
          ...generateTemplateScenarioParametersValues(abiFunction.inputs, encodedFunctionArgs),
          ...generateTemplateScenarioParametersValues(artifact.constructorInputs, encodedConstructorArgs),
        },
        currentBlockHeight: 2,
        currentBlockTime: Math.round(+new Date() / 1000),
        keys: {
          privateKeys: generateTemplateScenarioKeys(abiFunction.inputs, encodedFunctionArgs),
        },
      },
      transaction: generateTemplateScenarioTransaction(contract, libauthTransaction, transaction),
      sourceOutputs: generateTemplateScenarioSourceOutputs(transaction),
    },
  };

  if (artifact.abi.length > 1) {
    const functionIndex = artifact.abi.findIndex((func) => func.name === transaction.abiFunction.name);
    scenarios![snakeCase(artifact.contractName + 'Evaluate')].data!.bytecode!.function_index = functionIndex.toString();
  }

  return scenarios;
};

const generateTemplateScenarioTransaction = (
  contract: Contract,
  libauthTransaction: TransactionBCH,
  csTransaction: Transaction,
): WalletTemplateScenario['transaction'] => {
  const slotIndex = csTransaction.inputs.findIndex((input) => !isUtxoP2PKH(input));

  const inputs = libauthTransaction.inputs.map((input, index) => {
    const csInput = csTransaction.inputs[index] as Utxo;

    return {
      outpointIndex: input.outpointIndex,
      outpointTransactionHash: binToHex(input.outpointTransactionHash),
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode: generateTemplateScenarioBytecode(csInput, `p2pkh_placeholder_unlock_${index}`, `placeholder_key_${index}`, index === slotIndex),
    } as WalletTemplateScenarioInput;
  });

  const locktime = libauthTransaction.locktime;

  const outputs = libauthTransaction.outputs.map((output, index) => {
    const csOutput = csTransaction.outputs[index];

    return {
      lockingBytecode: generateTemplateScenarioTransactionOutputLockingBytecode(csOutput, contract),
      token: serialiseTokenDetails(output.token),
      valueSatoshis: Number(output.valueSatoshis),
    } as WalletTemplateScenarioTransactionOutput;
  });

  const version = libauthTransaction.version;

  return { inputs, locktime, outputs, version };
};

export const generateTemplateScenarioTransactionOutputLockingBytecode = (
  csOutput: Output,
  contract: Contract,
): string | {} => {
  if (csOutput.to instanceof Uint8Array) return binToHex(csOutput.to);
  if ([contract.address, contract.tokenAddress].includes(csOutput.to)) return {};
  return binToHex(addressToLockScript(csOutput.to));
};

/**
 * Generates source outputs for a BitAuth template scenario
 *
 * @param csTransaction - The CashScript transaction to generate source outputs for
 * @returns An array of BitAuth template scenario outputs with locking scripts and values
 *
 * For each input in the transaction:
 * - Generates appropriate locking bytecode (P2PKH or contract)
 * - Includes the input value in satoshis
 * - Includes any token details if present
 *
 * The slotIndex tracks which input is the contract input vs P2PKH inputs
 * to properly generate the locking scripts.
 */
const generateTemplateScenarioSourceOutputs = (
  csTransaction: Transaction,
): Array<WalletTemplateScenarioOutput<true>> => {
  const slotIndex = csTransaction.inputs.findIndex((input) => !isUtxoP2PKH(input));

  return csTransaction.inputs.map((input, index) => {
    return {
      lockingBytecode: generateTemplateScenarioBytecode(input, `p2pkh_placeholder_lock_${index}`, `placeholder_key_${index}`, index === slotIndex),
      valueSatoshis: Number(input.satoshis),
      token: serialiseTokenDetails(input.token),
    };
  });
};

// Used for generating the locking / unlocking bytecode for source outputs and inputs
export const generateTemplateScenarioBytecode = (
  input: Utxo, p2pkhScriptName: string, placeholderKeyName: string, insertSlot?: boolean,
): WalletTemplateScenarioBytecode | ['slot'] => {
  if (isUtxoP2PKH(input)) {
    return {
      script: p2pkhScriptName,
      overrides: {
        keys: {
          privateKeys: {
            [placeholderKeyName]: binToHex(input.template.privateKey),
          },
        },
      },
    };
  }

  return insertSlot ? ['slot'] : {};
};

export const generateTemplateScenarioParametersValues = (
  types: readonly AbiInput[],
  encodedArgs: EncodedFunctionArgument[],
): Record<string, string> => {
  const typesAndArguments = zip(types, encodedArgs);

  const entries = typesAndArguments
    // SignatureTemplates are handled by the 'keys' object in the scenario
    .filter(([, arg]) => !(arg instanceof SignatureTemplate))
    .map(([input, arg]) => {
      const encodedArgumentHex = binToHex(arg as Uint8Array);
      const prefixedEncodedArgument = addHexPrefixExceptEmpty(encodedArgumentHex);
      return [snakeCase(input.name), prefixedEncodedArgument] as const;
    });

  return Object.fromEntries(entries);
};

export const addHexPrefixExceptEmpty = (value: string): string => {
  return value.length > 0 ? `0x${value}` : '';
};

export const generateTemplateScenarioKeys = (
  types: readonly AbiInput[],
  encodedArgs: EncodedFunctionArgument[],
): Record<string, string> => {
  const typesAndArguments = zip(types, encodedArgs);

  const entries = typesAndArguments
    .filter(([, arg]) => arg instanceof SignatureTemplate)
    .map(([input, arg]) => ([snakeCase(input.name), binToHex((arg as SignatureTemplate).privateKey)] as const));

  return Object.fromEntries(entries);
};

export const formatParametersForDebugging = (types: readonly AbiInput[], args: EncodedFunctionArgument[]): string => {
  if (types.length === 0) return '// none';

  // We reverse the arguments because the order of the arguments in the bytecode is reversed
  const typesAndArguments = zip(types, args).reverse();

  return typesAndArguments.map(([input, arg]) => {
    if (arg instanceof SignatureTemplate) {
      const signatureAlgorithmName = getSignatureAlgorithmName(arg.getSignatureAlgorithm());
      const hashtypeName = getHashTypeName(arg.getHashType(false));
      return `<${snakeCase(input.name)}.${signatureAlgorithmName}.${hashtypeName}> // ${input.type}`;
    }

    const typeStr = input.type === 'bytes' ? `bytes${arg.length}` : input.type;

    // we output these values as pushdata, comment will contain the type and the value of the variable
    // e.g. <timeout> // int = <0xa08601>
    return `<${snakeCase(input.name)}> // ${typeStr} = <${`0x${binToHex(arg)}`}>`;
  }).join('\n');
};

export const getSignatureAlgorithmName = (signatureAlgorithm: SignatureAlgorithm): string => {
  const signatureAlgorithmNames = {
    [SignatureAlgorithm.SCHNORR]: 'schnorr_signature',
    [SignatureAlgorithm.ECDSA]: 'ecdsa_signature',
  };

  return signatureAlgorithmNames[signatureAlgorithm];
};

export const getHashTypeName = (hashType: HashType): string => {
  const hashtypeNames = {
    [HashType.SIGHASH_ALL]: 'all_outputs',
    [HashType.SIGHASH_ALL | HashType.SIGHASH_ANYONECANPAY]: 'all_outputs_single_input',
    [HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS]: 'all_outputs_all_utxos',
    [HashType.SIGHASH_ALL | HashType.SIGHASH_ANYONECANPAY | HashType.SIGHASH_UTXOS]: 'all_outputs_single_input_INVALID_all_utxos',
    [HashType.SIGHASH_SINGLE]: 'corresponding_output',
    [HashType.SIGHASH_SINGLE | HashType.SIGHASH_ANYONECANPAY]: 'corresponding_output_single_input',
    [HashType.SIGHASH_SINGLE | HashType.SIGHASH_UTXOS]: 'corresponding_output_all_utxos',
    [HashType.SIGHASH_SINGLE | HashType.SIGHASH_ANYONECANPAY | HashType.SIGHASH_UTXOS]: 'corresponding_output_single_input_INVALID_all_utxos',
    [HashType.SIGHASH_NONE]: 'no_outputs',
    [HashType.SIGHASH_NONE | HashType.SIGHASH_ANYONECANPAY]: 'no_outputs_single_input',
    [HashType.SIGHASH_NONE | HashType.SIGHASH_UTXOS]: 'no_outputs_all_utxos',
    [HashType.SIGHASH_NONE | HashType.SIGHASH_ANYONECANPAY | HashType.SIGHASH_UTXOS]: 'no_outputs_single_input_INVALID_all_utxos',
  };

  return hashtypeNames[hashType];
};

export const formatBytecodeForDebugging = (artifact: Artifact): string => {
  if (!artifact.debug) {
    return artifact.bytecode
      .split(' ')
      .map((asmElement) => (isHex(asmElement) ? `<0x${asmElement}>` : asmElement))
      .join('\n');
  }

  return formatBitAuthScript(
    bytecodeToScript(hexToBin(artifact.debug.bytecode)),
    artifact.debug.sourceMap,
    artifact.source,
  );
};

export const serialiseTokenDetails = (
  token?: TokenDetails | LibauthTokenDetails,
): LibauthTemplateTokenDetails | undefined => {
  if (!token) return undefined;

  return {
    amount: token.amount.toString(),
    category: token.category instanceof Uint8Array ? binToHex(token.category) : token.category,
    nft: token.nft ? {
      capability: token.nft.capability,
      commitment: token.nft.commitment instanceof Uint8Array ? binToHex(token.nft.commitment) : token.nft.commitment,
    } : undefined,
  };
};

export interface LibauthTemplateTokenDetails {
  amount: string;
  category: string;
  nft?: {
    capability: 'none' | 'mutable' | 'minting';
    commitment: string;
  };
}
