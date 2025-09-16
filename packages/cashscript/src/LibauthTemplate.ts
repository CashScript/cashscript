import {
  binToBase64,
  binToHex,
  decodeCashAddress,
  hexToBin,
  Input,
  isHex,
  TransactionBch,
  utf8ToBin,
  WalletTemplate,
  WalletTemplateEntity,
  WalletTemplateScenario,
  WalletTemplateScenarioBytecode,
  WalletTemplateScenarioInput,
  WalletTemplateScenarioOutput,
  WalletTemplateScenarioTransactionOutput,
  WalletTemplateScript,
  WalletTemplateScriptLocking,
  WalletTemplateScriptUnlocking,
  WalletTemplateVariable,
} from '@bitauth/libauth';
import {
  AbiFunction,
  AbiInput,
  Artifact,
  bytecodeToScript,
  formatBitAuthScript,
} from '@cashscript/utils';
import { EncodedConstructorArgument, EncodedFunctionArgument, encodeFunctionArguments } from './Argument.js';
import { Contract } from './Contract.js';
import { DebugResults, debugTemplate } from './debugging.js';
import {
  HashType,
  isContractUnlocker,
  isP2PKHUnlocker,
  isStandardUnlockableUtxo,
  isUnlockableUtxo,
  LibauthTokenDetails,
  Output,
  SignatureAlgorithm,
  StandardUnlockableUtxo,
  TokenDetails,
  UnlockableUtxo,
  Utxo,
} from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';
import { addressToLockScript, extendedStringify, getSignatureAndPubkeyFromP2PKHInput, zip } from './utils.js';
import { TransactionBuilder } from './TransactionBuilder.js';
import { deflate } from 'pako';


/**
 * Generates template entities for P2PKH (Pay to Public Key Hash) placeholder scripts.
 *
 * Follows the WalletTemplateEntity specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateEntitiesP2PKH = (
  inputIndex: number,
): WalletTemplate['entities'] => {
  const lockScriptName = `p2pkh_placeholder_lock_${inputIndex}`;
  const unlockScriptName = `p2pkh_placeholder_unlock_${inputIndex}`;

  return {
    [`signer_${inputIndex}`]: {
      scripts: [lockScriptName, unlockScriptName],
      description: `P2PKH data for input ${inputIndex}`,
      name: `P2PKH Signer (input #${inputIndex})`,
      variables: {
        [`signature_${inputIndex}`]: {
          description: '',
          name: `P2PKH Signature (input #${inputIndex})`,
          type: 'WalletData',
        },
        [`public_key_${inputIndex}`]: {
          description: '',
          name: `P2PKH public key (input #${inputIndex})`,
          type: 'WalletData',
        },
      },
    },
  };
};

/**
 * Generates template entities for P2SH (Pay to Script Hash) placeholder scripts.
 *
 * Follows the WalletTemplateEntity specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateEntitiesP2SH = (
  contract: Contract,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  inputIndex: number,
): WalletTemplate['entities'] => {
  const entities = {
    [contract.artifact.contractName + '_input' + inputIndex + '_parameters']: {
      description: 'Contract creation and function parameters',
      name: `${contract.artifact.contractName} (input #${inputIndex})`,
      scripts: [
        getLockScriptName(contract),
        getUnlockScriptName(contract, abiFunction, inputIndex),
      ],
      variables: createWalletTemplateVariables(contract.artifact, abiFunction, encodedFunctionArgs),
    },
  };

  // function_index is a special variable that indicates the function to execute
  if (contract.artifact.abi.length > 1) {
    entities[contract.artifact.contractName + '_input' + inputIndex + '_parameters'].variables.function_index = {
      description: 'Script function index to execute',
      name: 'function_index',
      type: 'WalletData',
    };
  }

  return entities;
};

const createWalletTemplateVariables = (
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
): Record<string, WalletTemplateVariable> => {
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

  return { ...functionParameters, ...constructorParameters };
};

/**
 * Generates template scripts for P2PKH (Pay to Public Key Hash) placeholder scripts.
 *
 * Follows the WalletTemplateScript specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateScriptsP2PKH = (
  inputIndex: number,
): WalletTemplate['scripts'] => {
  const scripts: WalletTemplate['scripts'] = {};
  const lockScriptName = `p2pkh_placeholder_lock_${inputIndex}`;
  const unlockScriptName = `p2pkh_placeholder_unlock_${inputIndex}`;

  const signatureString = `signature_${inputIndex}`;
  const publicKeyString = `public_key_${inputIndex}`;

  // add extra unlocking and locking script for P2PKH inputs spent alongside our contract
  // this is needed for correct cross-references in the template
  scripts[unlockScriptName] = {
    passes: [`P2PKH_spend_input${inputIndex}_evaluate`],
    name: `P2PKH Unlock (input #${inputIndex})`,
    script:
      `<${signatureString}>\n<${publicKeyString}>`,
    unlocks: lockScriptName,
  };
  scripts[lockScriptName] = {
    lockingType: 'standard',
    name: `P2PKH Lock (input #${inputIndex})`,
    script:
      `OP_DUP\nOP_HASH160 <$(<${publicKeyString}> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG`,
  };

  return scripts;
};

/**
 * Generates template scripts for P2SH (Pay to Script Hash) placeholder scripts.
 *
 * Follows the WalletTemplateScript specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateScriptsP2SH = (
  contract: Contract,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  encodedConstructorArgs: EncodedConstructorArgument[],
  inputIndex: number,
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode
  const unlockingScriptName = getUnlockScriptName(contract, abiFunction, inputIndex);
  const lockingScriptName = getLockScriptName(contract);

  return {
    [unlockingScriptName]: generateTemplateUnlockScript(contract, abiFunction, encodedFunctionArgs, inputIndex),
    [lockingScriptName]: generateTemplateLockScript(contract, encodedConstructorArgs),
  };
};

/**
 * Generates a template lock script for a P2SH (Pay to Script Hash) placeholder script.
 *
 * Follows the WalletTemplateScriptLocking specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
const generateTemplateLockScript = (
  contract: Contract,
  constructorArguments: EncodedFunctionArgument[],
): WalletTemplateScriptLocking => {
  return {
    lockingType: contract.addressType,
    name: contract.artifact.contractName,
    script: [
      `// "${contract.artifact.contractName}" contract constructor parameters`,
      formatParametersForDebugging(contract.artifact.constructorInputs, constructorArguments),
      '',
      '// bytecode',
      formatBytecodeForDebugging(contract.artifact),
    ].join('\n'),
  };
};

/**
 * Generates a template unlock script for a P2SH (Pay to Script Hash) placeholder script.
 *
 * Follows the WalletTemplateScriptUnlocking specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
const generateTemplateUnlockScript = (
  contract: Contract,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  inputIndex: number,
): WalletTemplateScriptUnlocking => {
  const scenarioIdentifier = `${contract.artifact.contractName}_${abiFunction.name}_input${inputIndex}_evaluate`;
  const functionIndex = contract.artifact.abi.findIndex((func) => func.name === abiFunction.name);

  const functionIndexString = contract.artifact.abi.length > 1
    ? ['// function index in contract', `<function_index> // int = <${functionIndex}>`, '']
    : [];

  return {
    // this unlocking script must pass our only scenario
    passes: [scenarioIdentifier],
    name: `${abiFunction.name} (input #${inputIndex})`,
    script: [
      `// "${abiFunction.name}" function parameters`,
      formatParametersForDebugging(abiFunction.inputs, encodedFunctionArgs),
      '',
      ...functionIndexString,
    ].join('\n'),
    unlocks: getLockScriptName(contract),
  };
};

export const generateTemplateScenarios = (
  contract: Contract,
  libauthTransaction: TransactionBch,
  csTransaction: TransactionType,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  inputIndex: number,
): WalletTemplate['scenarios'] => {
  const artifact = contract.artifact;
  const encodedConstructorArgs = contract.encodedConstructorArgs;
  const scenarioIdentifier = `${artifact.contractName}_${abiFunction.name}_input${inputIndex}_evaluate`;

  // TODO: Update scenario descriptions
  const scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    [scenarioIdentifier]: {
      name: `Evaluate ${artifact.contractName} ${abiFunction.name} (input #${inputIndex})`,
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
      transaction: generateTemplateScenarioTransaction(contract, libauthTransaction, csTransaction, inputIndex),
      sourceOutputs: generateTemplateScenarioSourceOutputs(csTransaction, libauthTransaction, inputIndex),
    },
  };

  // TODO: understand exactly what this does, and refactor
  // Looks similar to code in generateTemplateScenarioParametersFunctionIndex
  // Looks like we just want to use that function and spread in the scenarios data bytecode field
  if (artifact.abi.length > 1) {
    const functionIndex = artifact.abi.findIndex((func) => func.name === abiFunction.name);
    scenarios![scenarioIdentifier].data!.bytecode!.function_index = functionIndex.toString();
  }

  return scenarios;
};

export const generateTemplateScenariosP2PKH = (
  libauthTransaction: TransactionBch,
  csTransaction: TransactionType,
  inputIndex: number,
): WalletTemplate['scenarios'] => {
  // const artifact = contract.artifact;
  // const encodedConstructorArgs = contract.encodedConstructorArgs;
  const scenarioIdentifier = `P2PKH_spend_input${inputIndex}_evaluate`;

  const { signature, publicKey } = getSignatureAndPubkeyFromP2PKHInput(libauthTransaction.inputs[inputIndex]);

  // TODO: Update scenario descriptions
  const scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    [scenarioIdentifier]: {
      name: `Evaluate P2PKH spend (input #${inputIndex})`,
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: {
          [`signature_${inputIndex}`]: `0x${binToHex(signature)}`,
          [`public_key_${inputIndex}`]: `0x${binToHex(publicKey)}`,
        },
        currentBlockHeight: 2,
        currentBlockTime: Math.round(+new Date() / 1000),
      },
      transaction: generateTemplateScenarioTransaction(undefined, libauthTransaction, csTransaction, inputIndex),
      sourceOutputs: generateTemplateScenarioSourceOutputs(csTransaction, libauthTransaction, inputIndex),
    },
  };

  return scenarios;
};

const generateTemplateScenarioTransaction = (
  contract: Contract | undefined,
  libauthTransaction: TransactionBch,
  csTransaction: TransactionType,
  slotIndex: number,
): WalletTemplateScenario['transaction'] => {
  const inputs = libauthTransaction.inputs.map((input, inputIndex) => {
    const csInput = csTransaction.inputs[inputIndex] as Utxo;
    const libauthInput = libauthTransaction.inputs[inputIndex];

    return {
      outpointIndex: input.outpointIndex,
      outpointTransactionHash: binToHex(input.outpointTransactionHash),
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode: generateTemplateScenarioBytecode(csInput, libauthInput, inputIndex, 'p2pkh_placeholder_unlock', slotIndex === inputIndex),
    } as WalletTemplateScenarioInput;
  });

  const locktime = libauthTransaction.locktime;

  const outputs = libauthTransaction.outputs.map((output, index) => {
    const csOutput = csTransaction.outputs[index];

    if (csOutput && contract) {
      return {
        lockingBytecode: generateTemplateScenarioTransactionOutputLockingBytecode(csOutput, contract),
        token: serialiseTokenDetails(output.token),
        valueSatoshis: Number(output.valueSatoshis),
      } as WalletTemplateScenarioTransactionOutput;
    }

    return {
      lockingBytecode: `${binToHex(output.lockingBytecode)}`,
      token: serialiseTokenDetails(output.token),
      valueSatoshis: Number(output.valueSatoshis),
    } as WalletTemplateScenarioTransactionOutput;
  });

  const version = libauthTransaction.version;

  return { inputs, locktime, outputs, version };
};

const generateTemplateScenarioSourceOutputs = (
  csTransaction: TransactionType,
  libauthTransaction: TransactionBch,
  slotIndex: number,
): Array<WalletTemplateScenarioOutput<true>> => {
  return csTransaction.inputs.map((input, inputIndex) => {
    const libauthInput = libauthTransaction.inputs[inputIndex];

    return {
      lockingBytecode: generateTemplateScenarioBytecode(input, libauthInput, inputIndex, 'p2pkh_placeholder_lock', inputIndex === slotIndex),
      valueSatoshis: Number(input.satoshis),
      token: serialiseTokenDetails(input.token),
    };
  });
};

const createTransactionTypeFromTransactionBuilder = (txn: TransactionBuilder): TransactionType => {
  const csTransaction = {
    inputs: txn.inputs,
    locktime: txn.locktime,
    outputs: txn.outputs,
    version: 2,
  };

  return csTransaction;
};

interface TransactionType {
  inputs: UnlockableUtxo[];
  locktime: number;
  outputs: Output[];
  version: number;
}

export const getLibauthTemplates = (
  txn: TransactionBuilder,
): WalletTemplate => {
  if (txn.inputs.some((input) => !isStandardUnlockableUtxo(input))) {
    throw new Error('Cannot use debugging functionality with a transaction that contains custom unlockers');
  }

  const libauthTransaction = txn.buildLibauthTransaction();
  const csTransaction = createTransactionTypeFromTransactionBuilder(txn);

  const baseTemplate: WalletTemplate = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: 'CashScript Generated Debugging Template',
    supported: ['BCH_2025_05'],
    version: 0,
    entities: {},
    scripts: {},
    scenarios: {},
  };

  // Initialize collections for entities, scripts, and scenarios
  const entities: Record<string, WalletTemplateEntity> = {};
  const scripts: Record<string, WalletTemplateScript> = {};
  const scenarios: Record<string, WalletTemplateScenario> = {};

  // Initialize collections for P2PKH entities and scripts
  const p2pkhEntities: Record<string, WalletTemplateEntity> = {};
  const p2pkhScripts: Record<string, WalletTemplateScript> = {};

  // Initialize bytecode mappings, these will be used to map the locking and unlocking scripts and naming the scripts
  const unlockingBytecodeToLockingBytecodeParams: Record<string, WalletTemplateScenarioBytecode> = {};
  const lockingBytecodeToLockingBytecodeParams: Record<string, WalletTemplateScenarioBytecode> = {};

  // We can typecast this because we check that all inputs are standard unlockable at the top of this function
  for (const [inputIndex, input] of (txn.inputs as StandardUnlockableUtxo[]).entries()) {
    if (isP2PKHUnlocker(input.unlocker)) {
      Object.assign(p2pkhEntities, generateTemplateEntitiesP2PKH(inputIndex));
      Object.assign(p2pkhScripts, generateTemplateScriptsP2PKH(inputIndex));
      Object.assign(scenarios, generateTemplateScenariosP2PKH(libauthTransaction, csTransaction, inputIndex));
      continue;
    }

    if (isContractUnlocker(input.unlocker)) {
      const contract = input.unlocker?.contract;
      const abiFunction = input.unlocker?.abiFunction;

      if (!abiFunction) {
        throw new Error('No ABI function found in unlocker');
      }

      // Encode the function arguments for this contract input
      const encodedArgs = encodeFunctionArguments(
        abiFunction,
        input.unlocker.params ?? [],
      );

      // Generate a scenario object for this contract input
      Object.assign(scenarios,
        generateTemplateScenarios(
          contract,
          libauthTransaction,
          csTransaction,
          abiFunction,
          encodedArgs,
          inputIndex,
        ),
      );

      // Generate entities for this contract input
      const entity = generateTemplateEntitiesP2SH(
        contract,
        abiFunction,
        encodedArgs,
        inputIndex,
      );

      // Generate scripts for this contract input
      const script = generateTemplateScriptsP2SH(
        contract,
        abiFunction,
        encodedArgs,
        contract.encodedConstructorArgs,
        inputIndex,
      );

      // Find the lock script name for this contract input
      const lockScriptName = Object.keys(script).find(scriptName => scriptName.includes('_lock'));
      if (lockScriptName) {
        // Generate bytecodes for this contract input
        const unlockingBytecode = binToHex(libauthTransaction.inputs[inputIndex].unlockingBytecode);
        const lockingScriptParams = generateLockingScriptParams(input.unlocker.contract, input, lockScriptName);

        // Assign a name to the unlocking bytecode so later it can be used to replace the bytecode/slot in scenarios
        unlockingBytecodeToLockingBytecodeParams[unlockingBytecode] = lockingScriptParams;
        // Assign a name to the locking bytecode so later it can be used to replace with bytecode/slot in scenarios
        lockingBytecodeToLockingBytecodeParams[binToHex(addressToLockScript(contract.address))] = lockingScriptParams;
      }

      // Add entities and scripts to the base template and repeat the process for the next input
      Object.assign(entities, entity);
      Object.assign(scripts, script);
    }
  }

  Object.assign(entities, p2pkhEntities);
  Object.assign(scripts, p2pkhScripts);

  const finalTemplate = { ...baseTemplate, entities, scripts, scenarios };

  // Loop through all scenarios and map the locking and unlocking scripts to the scenarios
  // Replace the script tag with the identifiers we created earlier

  // For Inputs
  for (const scenario of Object.values(scenarios)) {
    for (const [idx, input] of libauthTransaction.inputs.entries()) {
      const unlockingBytecode = binToHex(input.unlockingBytecode);

      // If false then it stays lockingBytecode: {}
      if (unlockingBytecodeToLockingBytecodeParams[unlockingBytecode]) {
        // ['slot'] this identifies the source output in which the locking script under test will be placed
        if (Array.isArray(scenario?.sourceOutputs?.[idx]?.lockingBytecode)) continue;

        // If true then assign a name to the locking bytecode script.
        if (scenario.sourceOutputs && scenario.sourceOutputs[idx]) {
          scenario.sourceOutputs[idx] = {
            ...scenario.sourceOutputs[idx],
            lockingBytecode: unlockingBytecodeToLockingBytecodeParams[unlockingBytecode],
          };
        }
      }
    }

    // For Outputs
    for (const [idx, output] of libauthTransaction.outputs.entries()) {
      const lockingBytecode = binToHex(output.lockingBytecode);

      // If false then it stays lockingBytecode: {}
      if (lockingBytecodeToLockingBytecodeParams[lockingBytecode]) {

        // ['slot'] this identifies the source output in which the locking script under test will be placed
        if (Array.isArray(scenario?.transaction?.outputs?.[idx]?.lockingBytecode)) continue;

        // If true then assign a name to the locking bytecode script.
        if (scenario?.transaction && scenario?.transaction?.outputs && scenario?.transaction?.outputs[idx]) {
          scenario.transaction.outputs[idx] = {
            ...scenario.transaction.outputs[idx],
            lockingBytecode: lockingBytecodeToLockingBytecodeParams[lockingBytecode],
          };
        }
      }
    }

  }

  return finalTemplate;
};

export const debugLibauthTemplate = (template: WalletTemplate, transaction: TransactionBuilder): DebugResults => {
  const allArtifacts = transaction.inputs
    .map(input => 'contract' in input.unlocker ? input.unlocker.contract : undefined)
    .filter((contract): contract is Contract => Boolean(contract))
    .map(contract => contract.artifact);

  return debugTemplate(template, allArtifacts);
};

const generateLockingScriptParams = (
  contract: Contract,
  { unlocker }: StandardUnlockableUtxo,
  lockScriptName: string,
): WalletTemplateScenarioBytecode => {
  if (isP2PKHUnlocker(unlocker)) {
    return {
      script: lockScriptName,
    };
  }

  const constructorParamsEntries = contract.artifact.constructorInputs
    .map(({ name }, index) => [
      name,
      addHexPrefixExceptEmpty(
        binToHex(unlocker.contract.encodedConstructorArgs[index]),
      ),
    ]);

  const constructorParams = Object.fromEntries(constructorParamsEntries);

  return {
    script: lockScriptName,
    overrides: {
      bytecode: { ...constructorParams },
    },
  };
};

export const generateUnlockingScriptParams = (
  csInput: StandardUnlockableUtxo,
  libauthInput: Input,
  p2pkhScriptNameTemplate: string,
  inputIndex: number,
): WalletTemplateScenarioBytecode => {
  if (isP2PKHUnlocker(csInput.unlocker)) {
    const { signature, publicKey } = getSignatureAndPubkeyFromP2PKHInput(libauthInput);

    return {
      script: `${p2pkhScriptNameTemplate}_${inputIndex}`,
      overrides: {
        bytecode: {
          [`signature_${inputIndex}`]: `0x${binToHex(signature)}`,
          [`public_key_${inputIndex}`]: `0x${binToHex(publicKey)}`,
        },
      },
    };
  }

  const abiFunction = csInput.unlocker.abiFunction;
  const contract = csInput.unlocker.contract;
  const encodedFunctionArgs = encodeFunctionArguments(abiFunction, csInput.unlocker.params);

  return {
    script: getUnlockScriptName(contract, abiFunction, inputIndex),
    overrides: {
      // encode values for the variables defined above in `entities` property
      bytecode: {
        ...generateTemplateScenarioParametersFunctionIndex(abiFunction, contract.artifact.abi),
        ...generateTemplateScenarioParametersValues(abiFunction.inputs, encodedFunctionArgs),
        ...generateTemplateScenarioParametersValues(contract.artifact.constructorInputs, contract.encodedConstructorArgs),
      },
      keys: {
        privateKeys: generateTemplateScenarioKeys(abiFunction.inputs, encodedFunctionArgs),
      },
    },
  };
};

const getLockScriptName = (contract: Contract): string => {
  const result = decodeCashAddress(contract.address);
  if (typeof result === 'string') throw new Error(result);

  return `${contract.artifact.contractName}_${binToHex(result.payload)}_lock`;
};

const getUnlockScriptName = (contract: Contract, abiFunction: AbiFunction, inputIndex: number): string => {
  return `${contract.artifact.contractName}_${abiFunction.name}_input${inputIndex}_unlock`;
};

export const getBitauthUri = (template: WalletTemplate): string => {
  const base64toBase64Url = (base64: string): string => base64.replace(/\+/g, '-').replace(/\//g, '_');
  const payload = base64toBase64Url(binToBase64(deflate(utf8ToBin(extendedStringify(template)))));
  return `https://ide.bitauth.com/import-template/${payload}`;
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

export const addHexPrefixExceptEmpty = (value: string): string => {
  return value.length > 0 ? `0x${value}` : '';
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

// Used for generating the locking / unlocking bytecode for source outputs and inputs
export const generateTemplateScenarioBytecode = (
  input: Utxo,
  libauthInput: Input,
  inputIndex: number,
  p2pkhScriptNameTemplate: string,
  insertSlot?: boolean,
): WalletTemplateScenarioBytecode | ['slot'] => {
  if (insertSlot) return ['slot'];

  if (isUnlockableUtxo(input) && isStandardUnlockableUtxo(input)) {
    return generateUnlockingScriptParams(input, libauthInput, p2pkhScriptNameTemplate, inputIndex);
  }

  // 'slot' means that we are currently evaluating this specific input,
  // {} means that it is the same script type, but not being evaluated
  return {};
};

export const generateTemplateScenarioTransactionOutputLockingBytecode = (
  csOutput: Output,
  contract: Contract,
): string | {} => {
  if (csOutput.to instanceof Uint8Array) return binToHex(csOutput.to);
  if ([contract.address, contract.tokenAddress].includes(csOutput.to)) return {};
  return binToHex(addressToLockScript(csOutput.to));
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

export interface LibauthTemplateTokenDetails {
  amount: string;
  category: string;
  nft?: {
    capability: 'none' | 'mutable' | 'minting';
    commitment: string;
  };
}
