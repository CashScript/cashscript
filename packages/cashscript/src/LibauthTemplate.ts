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
  isUnlockableUtxo,
  isStandardUnlockableUtxo,
} from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';
import { Transaction } from './Transaction.js';
import { EncodedConstructorArgument, EncodedFunctionArgument } from './Argument.js';
import { addressToLockScript, extendedStringify, zip } from './utils.js';
import { Contract } from './Contract.js';
import { generateUnlockingScriptParams } from './advanced/LibauthTemplate.js';

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

      template.entities[contract.name + '_parameters'].scripts!.push(lockScriptName, unlockScriptName);
      template.entities[contract.name + '_parameters'].variables = {
        ...template.entities[contract.name + '_parameters'].variables,
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
      input.name,
      {
        description: `"${input.name}" parameter of function "${abiFunction.name}"`,
        name: input.name,
        type: encodedFunctionArgs[index] instanceof SignatureTemplate ? 'Key' : 'WalletData',
      },
    ])),
  );

  const constructorParameters = Object.fromEntries<WalletTemplateVariable>(
    artifact.constructorInputs.map((input) => ([
      input.name,
      {
        description: `"${input.name}" parameter of this contract`,
        name: input.name,
        type: 'WalletData',
      },
    ])),
  );

  const entities = {
    [artifact.contractName + '_parameters']: {
      description: 'Contract creation and function parameters',
      name: artifact.contractName + '_parameters',
      scripts: [
        artifact.contractName + '_lock',
        artifact.contractName + '_unlock',
      ],
      variables: {
        ...functionParameters,
        ...constructorParameters,
      },
    },
  };

  // function_index is a special variable that indicates the function to execute
  if (artifact.abi.length > 1) {
    entities[artifact.contractName + '_parameters'].variables.function_index = {
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
    [artifact.contractName + '_unlock']: generateTemplateUnlockScript(artifact, abiFunction, encodedFunctionArgs),
    [artifact.contractName + '_lock']: generateTemplateLockScript(artifact, addressType, encodedConstructorArgs),
  };
};

const generateTemplateLockScript = (
  artifact: Artifact,
  addressType: AddressType,
  constructorArguments: EncodedFunctionArgument[],
): WalletTemplateScriptLocking => {
  return {
    lockingType: addressType,
    name: artifact.contractName + '_lock',
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
    passes: [artifact.contractName + '_evaluate'],
    name: artifact.contractName + '_unlock',
    script: [
      `// "${abiFunction.name}" function parameters`,
      formatParametersForDebugging(abiFunction.inputs, encodedFunctionArgs),
      '',
      ...functionIndexString,
    ].join('\n'),
    unlocks: artifact.contractName + '_lock',
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
    [artifact.contractName + '_evaluate']: {
      name: artifact.contractName + '_evaluate',
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: {
          ...generateTemplateScenarioParametersFunctionIndex(abiFunction, artifact.abi),
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

  return scenarios;
};

const generateTemplateScenarioTransaction = (
  contract: Contract,
  libauthTransaction: TransactionBCH,
  csTransaction: Transaction,
): WalletTemplateScenario['transaction'] => {
  const slotIndex = csTransaction.inputs.findIndex((input) => !isUtxoP2PKH(input));

  const inputs = libauthTransaction.inputs.map((input, inputIndex) => {
    const csInput = csTransaction.inputs[inputIndex] as Utxo;

    return {
      outpointIndex: input.outpointIndex,
      outpointTransactionHash: binToHex(input.outpointTransactionHash),
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode: generateTemplateScenarioBytecode(csInput, inputIndex, 'p2pkh_placeholder_unlock', inputIndex === slotIndex),
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

const generateTemplateScenarioSourceOutputs = (
  csTransaction: Transaction,
): Array<WalletTemplateScenarioOutput<true>> => {
  const slotIndex = csTransaction.inputs.findIndex((input) => !isUtxoP2PKH(input));

  return csTransaction.inputs.map((input, inputIndex) => {
    return {
      lockingBytecode: generateTemplateScenarioBytecode(input, inputIndex, 'p2pkh_placeholder_lock', inputIndex === slotIndex),
      valueSatoshis: Number(input.satoshis),
      token: serialiseTokenDetails(input.token),
    };
  });
};

// Used for generating the locking / unlocking bytecode for source outputs and inputs
export const generateTemplateScenarioBytecode = (
  input: Utxo, inputIndex: number, p2pkhScriptNameTemplate: string, insertSlot?: boolean,
): WalletTemplateScenarioBytecode | ['slot'] => {
  if (insertSlot) return ['slot'];

  const p2pkhScriptName = `${p2pkhScriptNameTemplate}_${inputIndex}`;
  const placeholderKeyName = `placeholder_key_${inputIndex}`;

  // This is for P2PKH inputs in the old transaction builder (TODO: remove when we remove old transaction builder)
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

  if (isUnlockableUtxo(input) && isStandardUnlockableUtxo(input)) {
    return generateUnlockingScriptParams(input, p2pkhScriptNameTemplate, inputIndex);
  }

  // 'slot' means that we are currently evaluating this specific input,
  // {} means that it is the same script type, but not being evaluated
  return {};
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
      return [input.name, prefixedEncodedArgument] as const;
    });

  return Object.fromEntries(entries);
};

export const generateTemplateScenarioParametersFunctionIndex = (
  abiFunction: AbiFunction,
  abi: readonly AbiFunction[],
): Record<string, string> => {
  const functionIndex = abi.length > 1
    ? abi.findIndex((func) => func.name === abiFunction.name)
    : undefined;

  return functionIndex !== undefined ? { function_index: functionIndex.toString() } : {};
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
    .map(([input, arg]) => ([input.name, binToHex((arg as SignatureTemplate).privateKey)] as const));

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
      return `<${input.name}.${signatureAlgorithmName}.${hashtypeName}> // ${input.type}`;
    }

    const typeStr = input.type === 'bytes' ? `bytes${arg.length}` : input.type;

    // we output these values as pushdata, comment will contain the type and the value of the variable
    // e.g. <timeout> // int = <0xa08601>
    return `<${input.name}> // ${typeStr} = <${`0x${binToHex(arg)}`}>`;
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
