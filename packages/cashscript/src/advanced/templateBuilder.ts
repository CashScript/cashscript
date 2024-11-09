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
} from '../interfaces.js';
import SignatureTemplate from '../SignatureTemplate.js';
import { Transaction } from '../Transaction.js';
import { EncodedConstructorArgument, EncodedFunctionArgument } from '../Argument.js';
import { addressToLockScript, extendedStringify, snakeCase, zip } from '../utils.js';
import { Contract } from '../Contract.js';


export const getBitauthUri = (template: WalletTemplate): string => {
  const base64toBase64Url = (base64: string): string => base64.replace(/\+/g, '-').replace(/\//g, '_');
  const payload = base64toBase64Url(binToBase64(deflate(utf8ToBin(extendedStringify(template)))));
  return `https://ide.bitauth.com/import-template/${payload}`;
};

export const generateTemplateEntitiesP2PKH = (
  index: number,
): any => {
  const lockScriptName = `p2pkh_placeholder_lock_${index}`;
  const unlockScriptName = `p2pkh_placeholder_unlock_${index}`;

  return {
    [`signer_${index}`]: {
      scripts: [lockScriptName, unlockScriptName],
      description: `placeholder_key_${index}`,
      name: `Signer ${index}`,
      variables: {
        [`placeholder_key_${index}`]: {
          description: '',
          name: `Placeholder key ${index}`,
          type: 'HdKey',
        },
      },
    },
  };
};

export const generateTemplateEntities = (
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
      name: artifact.contractName,
      scripts: [
        snakeCase(artifact.contractName + '_lock'),
        snakeCase(artifact.contractName + '_' + abiFunction.name + '_unlock'),
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

export const generateTemplateScriptsP2PKH = (
  template: SignatureTemplate,
  index: number,
): any => {

  const scripts: any = {};

  const lockScriptName = `p2pkh_placeholder_lock_${index}`;
  const unlockScriptName = `p2pkh_placeholder_unlock_${index}`;
  const placeholderKeyName = `placeholder_key_${index}`;

  const signatureAlgorithmName = getSignatureAlgorithmName(template.getSignatureAlgorithm());
  const hashtypeName = getHashTypeName(template.getHashType(false));
  const signatureString = `${placeholderKeyName}.${signatureAlgorithmName}.${hashtypeName}`;
  // add extra unlocking and locking script for P2PKH inputs spent alongside our contract
  // this is needed for correct cross-references in the template
  scripts[unlockScriptName] = {
    name: unlockScriptName,
    script:
        `<${signatureString}>\n<${placeholderKeyName}.public_key>`,
    unlocks: lockScriptName,
  };
  scripts[lockScriptName] = {
    lockingType: 'standard',
    name: lockScriptName,
    script:
      `OP_DUP\nOP_HASH160 <$(<${placeholderKeyName}.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG`,
  };

  return scripts;
};

export const generateTemplateScripts = (
  artifact: Artifact,
  addressType: AddressType,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  encodedConstructorArgs: EncodedConstructorArgument[],
  slotIndex: number,
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode

  return {
    [snakeCase(artifact.contractName + '_' + abiFunction.name + '_unlock')]: generateTemplateUnlockScript(artifact, abiFunction, encodedFunctionArgs, slotIndex),
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
    name: artifact.contractName,
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
  slotIndex: number,
): WalletTemplateScriptUnlocking => {
  // const functionIndex = artifact.abi.findIndex((func) => func.name === abiFunction.name);

  const functionIndexString = artifact.abi.length > 1
    ? ['// function index in contract', `<function_index> // int = <${slotIndex}>`, '']
    : [];

  return {
    // this unlocking script must pass our only scenario
    passes: [snakeCase(artifact.contractName + '_' + abiFunction.name + 'EvaluateFunction')],
    name: abiFunction.name,
    script: [
      `// "${abiFunction.name}" function parameters`,
      formatParametersForDebugging(abiFunction.inputs, encodedFunctionArgs),
      '',
      ...functionIndexString,
    ].join('\n'),
    unlocks: snakeCase(artifact.contractName + '_lock'),
  };
};

export const generateTemplateScenarios = (
  contract: Contract,
  libauthTransaction: TransactionBCH,
  csTransaction: Transaction,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  slotIndex: number,
): WalletTemplate['scenarios'] => {

  const artifact = contract.artifact;
  const encodedConstructorArgs = contract.encodedConstructorArgs;

  const scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    [snakeCase(artifact.contractName + '_' + abiFunction.name + 'EvaluateFunction')]: {
      name: snakeCase(artifact.contractName + '_' + abiFunction.name + 'Evaluate'),
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
      transaction: generateTemplateScenarioTransaction(contract, libauthTransaction, csTransaction, slotIndex),
      sourceOutputs: generateTemplateScenarioSourceOutputs(csTransaction, slotIndex),
    },
  };

  // if (artifact.abi.length > 1) {
  scenarios![snakeCase(artifact.contractName + '_' + abiFunction.name + 'EvaluateFunction')].data!.bytecode!.function_index = slotIndex.toString();
  // }

  return scenarios;
};

const generateTemplateScenarioTransaction = (
  contract: Contract,
  libauthTransaction: TransactionBCH,
  csTransaction: Transaction,
  slotIndex: number,
): WalletTemplateScenario['transaction'] => {
  const inputs = libauthTransaction.inputs.map((input, index) => {
    const csInput = csTransaction.inputs[index] as Utxo;

    return {
      outpointIndex: input.outpointIndex,
      outpointTransactionHash: binToHex(input.outpointTransactionHash),
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode: generateTemplateScenarioBytecode(csInput, `p2pkh_placeholder_unlock_${index}`, `placeholder_key_${index}`, slotIndex === index),
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

const generateTemplateScenarioTransactionOutputLockingBytecode = (
  csOutput: Output,
  contract: Contract,
): string | {} => {
  if (csOutput.to instanceof Uint8Array) return binToHex(csOutput.to);
  if ([contract.address, contract.tokenAddress].includes(csOutput.to)) return {};
  return binToHex(addressToLockScript(csOutput.to));
};

const generateTemplateScenarioSourceOutputs = (
  csTransaction: Transaction,
  slotIndex: number,
): Array<WalletTemplateScenarioOutput<true>> => {

  return csTransaction.inputs.map((input, index) => {
    return {
      lockingBytecode: generateTemplateScenarioBytecode(input, `p2pkh_placeholder_lock_${index}`, `placeholder_key_${index}`, index === slotIndex),
      valueSatoshis: Number(input.satoshis),
      token: serialiseTokenDetails(input.token),
    };
  });
};

// Used for generating the locking / unlocking bytecode for source outputs and inputs
const generateTemplateScenarioBytecode = (
  input: Utxo, p2pkhScriptName: string, placeholderKeyName: string, insertSlot?: boolean,
): WalletTemplateScenarioBytecode | ['slot'] => {
  if (isUtxoP2PKH(input)) {
    return {
      script: p2pkhScriptName,
      overrides: {
        keys: {
          privateKeys: {
            [placeholderKeyName]: binToHex(input.template?.privateKey),
          },
        },
      },
    };
  }

  return insertSlot ? ['slot'] : {};
};

const generateTemplateScenarioParametersValues = (
  types: AbiInput[],
  encodedArgs: EncodedFunctionArgument[],
): Record<string, string> => {
  const typesAndArguments = zip(types, encodedArgs);

  const entries = typesAndArguments
    // SignatureTemplates are handled by the 'keys' object in the scenario
    .filter(([, arg]) => !(arg instanceof SignatureTemplate))
    .map(([input, arg]) => {
      const encodedArgumentHex = binToHex(arg as Uint8Array);
      const prefixedEncodedArgument = encodedArgumentHex.length > 0 ? `0x${encodedArgumentHex}` : '';
      return [snakeCase(input.name), prefixedEncodedArgument] as const;
    });

  return Object.fromEntries(entries);
};

const generateTemplateScenarioKeys = (
  types: AbiInput[],
  encodedArgs: EncodedFunctionArgument[],
): Record<string, string> => {
  const typesAndArguments = zip(types, encodedArgs);

  const entries = typesAndArguments
    .filter(([, arg]) => arg instanceof SignatureTemplate)
    .map(([input, arg]) => ([snakeCase(input.name), binToHex((arg as SignatureTemplate).privateKey)] as const));

  return Object.fromEntries(entries);
};

const formatParametersForDebugging = (types: AbiInput[], args: EncodedFunctionArgument[]): string => {
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

const getSignatureAlgorithmName = (signatureAlgorithm: SignatureAlgorithm): string => {
  const signatureAlgorithmNames = {
    [SignatureAlgorithm.SCHNORR]: 'schnorr_signature',
    [SignatureAlgorithm.ECDSA]: 'ecdsa_signature',
  };

  return signatureAlgorithmNames[signatureAlgorithm];
};

const getHashTypeName = (hashType: HashType): string => {
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

const formatBytecodeForDebugging = (artifact: Artifact): string => {
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

const serialiseTokenDetails = (token?: TokenDetails | LibauthTokenDetails): LibauthTemplateTokenDetails | undefined => {
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