import {
  binToBase64,
  binToHex,
  Input,
  TransactionBch,
  utf8ToBin,
  WalletTemplate,
  WalletTemplateScenario,
  WalletTemplateScenarioBytecode,
  WalletTemplateScenarioOutput,
  WalletTemplateScriptLocking,
  WalletTemplateScriptUnlocking,
  WalletTemplateVariable,
} from '@bitauth/libauth';
import {
  AbiFunction,
  AbiInput,
  Artifact,
} from '@cashscript/utils';
import { EncodedConstructorArgument, EncodedFunctionArgument, encodeFunctionArguments } from '../Argument.js';
import { Contract } from '../Contract.js';
import { DebugResults, debugTemplate } from '../debugging.js';
import {
  isContractUnlocker,
  isP2PKHUnlocker,
  isStandardUnlockableUtxo,
  isUnlockableUtxo,
  Output,
  StandardUnlockableUtxo,
  Utxo,
} from '../interfaces.js';
import SignatureTemplate from '../SignatureTemplate.js';
import { addressToLockScript, extendedStringify, zip } from '../utils.js';
import { TransactionBuilder } from '../TransactionBuilder.js';
import { deflate } from 'pako';
import MockNetworkProvider from '../network/MockNetworkProvider.js';
import { addHexPrefixExceptEmpty, DEFAULT_VM_TARGET, formatBytecodeForDebugging, formatParametersForDebugging, getLockScriptName, getSignatureAndPubkeyFromP2PKHInput, getUnlockScriptName, lockingBytecodeIsSetToSlot, serialiseTokenDetails } from './utils.js';

// TODO: Add / improve descriptions throughout the template generation

export const getLibauthTemplate = (
  transactionBuilder: TransactionBuilder,
): WalletTemplate => {
  if (transactionBuilder.inputs.some((input) => !isStandardUnlockableUtxo(input))) {
    throw new Error('Cannot use debugging functionality with a transaction that contains custom unlockers');
  }

  const libauthTransaction = transactionBuilder.buildLibauthTransaction();

  const vmTarget = transactionBuilder.provider instanceof MockNetworkProvider
    ? transactionBuilder.provider.vmTarget
    : DEFAULT_VM_TARGET;

  const template: WalletTemplate = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: 'CashScript Generated Debugging Template',
    supported: [vmTarget],
    version: 0,
    entities: generateAllTemplateEntities(transactionBuilder),
    scripts: generateAllTemplateScripts(transactionBuilder),
    scenarios: generateAllTemplateScenarios(libauthTransaction, transactionBuilder),
  };

  // TODO: Refactor the below code to not have deep reassignment of scenario.sourceOutputs and scenario.transaction.outputs

  // Initialize bytecode mappings, these will be used to map the locking and unlocking scripts and naming the scripts
  const unlockingBytecodeToLockingBytecodeParams: Record<string, WalletTemplateScenarioBytecode> = {};
  const lockingBytecodeToLockingBytecodeParams: Record<string, WalletTemplateScenarioBytecode> = {};

  // We can typecast this because we check that all inputs are standard unlockable at the top of this function
  for (const [inputIndex, input] of (transactionBuilder.inputs as StandardUnlockableUtxo[]).entries()) {
    if (isContractUnlocker(input.unlocker)) {
      const lockScriptName = getLockScriptName(input.unlocker.contract);
      if (!lockScriptName) continue;

      const lockingScriptParams = generateLockingScriptParams(input.unlocker.contract, input, lockScriptName);

      const unlockingBytecode = binToHex(libauthTransaction.inputs[inputIndex].unlockingBytecode);
      unlockingBytecodeToLockingBytecodeParams[unlockingBytecode] = lockingScriptParams;

      const lockingBytecode = binToHex(addressToLockScript(input.unlocker.contract.address));
      lockingBytecodeToLockingBytecodeParams[lockingBytecode] = lockingScriptParams;
    }
  }

  for (const scenario of Object.values(template.scenarios!)) {
    // For Inputs
    for (const [idx, input] of libauthTransaction.inputs.entries()) {
      const unlockingBytecode = binToHex(input.unlockingBytecode);
      const lockingBytecodeParams = unlockingBytecodeToLockingBytecodeParams[unlockingBytecode];

      // If lockingBytecodeParams is unknown, then it stays at default: {}
      if (!lockingBytecodeParams) continue;

      //  If locking bytecode is set to ['slot'] then this is being evaluated by the scenario, so we don't replace bytecode
      if (lockingBytecodeIsSetToSlot(scenario?.sourceOutputs?.[idx]?.lockingBytecode)) continue;

      // If lockingBytecodeParams is known, and this input is not ['slot'] then assign a locking bytecode as source output
      if (scenario.sourceOutputs?.[idx]) {
        scenario.sourceOutputs[idx] = {
          ...scenario.sourceOutputs[idx],
          lockingBytecode: lockingBytecodeParams,
        };
      }
    }

    // For Outputs
    for (const [idx, output] of libauthTransaction.outputs.entries()) {
      const lockingBytecode = binToHex(output.lockingBytecode);
      const lockingBytecodeParams = lockingBytecodeToLockingBytecodeParams[lockingBytecode];

      // If lockingBytecodeParams is unknown, then it stays at default: {}
      if (!lockingBytecodeParams) continue;

      //  If locking bytecode is set to ['slot'] then this is being evaluated by the scenario, so we don't replace bytecode
      if (lockingBytecodeIsSetToSlot(scenario?.transaction?.outputs?.[idx]?.lockingBytecode)) continue;

      // If lockingBytecodeParams is known, and this input is not ['slot'] then assign a locking bytecode as source output
      if (scenario?.transaction?.outputs?.[idx]) {
        scenario.transaction.outputs[idx] = {
          ...scenario.transaction.outputs[idx],
          lockingBytecode: lockingBytecodeParams,
        };
      }
    }
  }

  return template;
};

export const debugLibauthTemplate = (template: WalletTemplate, transaction: TransactionBuilder): DebugResults => {
  const allArtifacts = transaction.inputs
    .map(input => isContractUnlocker(input.unlocker) ? input.unlocker.contract : undefined)
    .filter((contract): contract is Contract => Boolean(contract))
    .map(contract => contract.artifact);

  return debugTemplate(template, allArtifacts);
};

export const getBitauthUri = (template: WalletTemplate): string => {
  const base64toBase64Url = (base64: string): string => base64.replace(/\+/g, '-').replace(/\//g, '_');
  const payload = base64toBase64Url(binToBase64(deflate(utf8ToBin(extendedStringify(template)))));
  return `https://ide.bitauth.com/import-template/${payload}`;
};

const generateAllTemplateEntities = (
  transactionBuilder: TransactionBuilder,
): WalletTemplate['entities'] => {
  const entities = transactionBuilder.inputs.map((input, inputIndex) => {
    if (isP2PKHUnlocker(input.unlocker)) {
      return generateTemplateEntitiesP2PKH(inputIndex);
    }

    if (isContractUnlocker(input.unlocker)) {
      const encodedArgs = encodeFunctionArguments(input.unlocker.abiFunction, input.unlocker.params ?? []);
      return generateTemplateEntitiesP2SH(input.unlocker.contract, input.unlocker.abiFunction, encodedArgs, inputIndex);
    }

    throw new Error('Unknown unlocker type');
  });

  return entities.reduce((acc, entity) => ({ ...acc, ...entity }), {});
};

const generateAllTemplateScripts = (
  transactionBuilder: TransactionBuilder,
): WalletTemplate['scripts'] => {
  const scripts = transactionBuilder.inputs.map((input, inputIndex) => {
    if (isP2PKHUnlocker(input.unlocker)) {
      return generateTemplateScriptsP2PKH(inputIndex);
    }

    if (isContractUnlocker(input.unlocker)) {
      const encodedArgs = encodeFunctionArguments(input.unlocker.abiFunction, input.unlocker.params ?? []);
      return generateTemplateScriptsP2SH(
        input.unlocker.contract,
        input.unlocker.abiFunction,
        encodedArgs,
        input.unlocker.contract.encodedConstructorArgs,
        inputIndex,
      );
    }

    throw new Error('Unknown unlocker type');
  });

  return scripts.reduce((acc, script) => ({ ...acc, ...script }), {});
};

const generateAllTemplateScenarios = (
  libauthTransaction: TransactionBch,
  transactionBuilder: TransactionBuilder,
): WalletTemplate['scenarios'] => {
  const scenarios = transactionBuilder.inputs.map((input, inputIndex) => {
    if (isP2PKHUnlocker(input.unlocker)) {
      return generateTemplateScenariosP2PKH(libauthTransaction, transactionBuilder, inputIndex);
    }

    if (isContractUnlocker(input.unlocker)) {
      const encodedArgs = encodeFunctionArguments(input.unlocker.abiFunction, input.unlocker.params ?? []);
      return generateTemplateScenarios(
        input.unlocker.contract,
        libauthTransaction,
        transactionBuilder,
        input.unlocker.abiFunction,
        encodedArgs,
        inputIndex,
      );
    }

    throw new Error('Unknown unlocker type');
  });

  return scenarios.reduce((acc, scenario) => ({ ...acc, ...scenario }), {});
};

const generateTemplateEntitiesP2PKH = (
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

const generateTemplateEntitiesP2SH = (
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
      variables: {
        ...createWalletTemplateVariables(contract.artifact, abiFunction, encodedFunctionArgs),
        ...generateFunctionIndexTemplateVariable(contract.artifact.abi),
      },
    },
  };

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

const generateTemplateScriptsP2PKH = (
  inputIndex: number,
): WalletTemplate['scripts'] => {
  const lockScriptName = `p2pkh_placeholder_lock_${inputIndex}`;
  const unlockScriptName = `p2pkh_placeholder_unlock_${inputIndex}`;

  const scripts = {
    [unlockScriptName]: {
      passes: [`P2PKH_spend_input${inputIndex}_evaluate`],
      name: `P2PKH Unlock (input #${inputIndex})`,
      script:
        `<signature_${inputIndex}>\n<public_key_${inputIndex}>`,
      unlocks: lockScriptName,
    },
    [lockScriptName]: {
      lockingType: 'standard',
      name: `P2PKH Lock (input #${inputIndex})`,
      script:
        `OP_DUP\nOP_HASH160 <$(<public_key_${inputIndex}> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG`,
    },
  };

  return scripts;
};

const generateTemplateScriptsP2SH = (
  contract: Contract,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  encodedConstructorArgs: EncodedConstructorArgument[],
  inputIndex: number,
): WalletTemplate['scripts'] => {
  const unlockingScriptName = getUnlockScriptName(contract, abiFunction, inputIndex);
  const lockingScriptName = getLockScriptName(contract);

  return {
    [unlockingScriptName]: generateTemplateUnlockScript(contract, abiFunction, encodedFunctionArgs, inputIndex),
    [lockingScriptName]: generateTemplateLockScript(contract, encodedConstructorArgs),
  };
};

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

const generateTemplateScenarios = (
  contract: Contract,
  libauthTransaction: TransactionBch,
  transactionBuilder: TransactionBuilder,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  inputIndex: number,
): WalletTemplate['scenarios'] => {
  const artifact = contract.artifact;
  const encodedConstructorArgs = contract.encodedConstructorArgs;
  const scenarioIdentifier = `${artifact.contractName}_${abiFunction.name}_input${inputIndex}_evaluate`;

  const scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    [scenarioIdentifier]: {
      name: `Evaluate ${artifact.contractName} ${abiFunction.name} (input #${inputIndex})`,
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: {
          ...generateTemplateScenarioParametersFunctionIndex(abiFunction, contract.artifact.abi),
          ...generateTemplateScenarioParametersValues(abiFunction.inputs, encodedFunctionArgs),
          ...generateTemplateScenarioParametersValues(artifact.constructorInputs, encodedConstructorArgs),
        },
        keys: {
          privateKeys: generateTemplateScenarioKeys(abiFunction.inputs, encodedFunctionArgs),
        },
      },
      transaction: generateTemplateScenarioTransaction(contract, libauthTransaction, transactionBuilder, inputIndex),
      sourceOutputs: generateTemplateScenarioSourceOutputs(transactionBuilder, libauthTransaction, inputIndex),
    },
  };

  return scenarios;
};

const generateTemplateScenariosP2PKH = (
  libauthTransaction: TransactionBch,
  transactionBuilder: TransactionBuilder,
  inputIndex: number,
): WalletTemplate['scenarios'] => {
  const scenarioIdentifier = `P2PKH_spend_input${inputIndex}_evaluate`;
  const { signature, publicKey } = getSignatureAndPubkeyFromP2PKHInput(libauthTransaction.inputs[inputIndex]);

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
      },
      transaction: generateTemplateScenarioTransaction(undefined, libauthTransaction, transactionBuilder, inputIndex),
      sourceOutputs: generateTemplateScenarioSourceOutputs(transactionBuilder, libauthTransaction, inputIndex),
    },
  };

  return scenarios;
};

const generateTemplateScenarioTransaction = (
  contract: Contract | undefined,
  libauthTransaction: TransactionBch,
  transactionBuilder: TransactionBuilder,
  slotIndex: number,
): WalletTemplateScenario['transaction'] => {
  const zippedInputs = zip(transactionBuilder.inputs, libauthTransaction.inputs);
  const inputs = zippedInputs.map(([csInput, libauthInput], inputIndex) => {
    return {
      outpointIndex: libauthInput.outpointIndex,
      outpointTransactionHash: binToHex(libauthInput.outpointTransactionHash),
      sequenceNumber: libauthInput.sequenceNumber,
      unlockingBytecode: generateTemplateScenarioBytecode(csInput, libauthInput, inputIndex, 'p2pkh_placeholder_unlock', slotIndex === inputIndex),
    };
  });

  const locktime = libauthTransaction.locktime;

  const zippedOutputs = zip(transactionBuilder.outputs, libauthTransaction.outputs);
  const outputs = zippedOutputs.map(([csOutput, libauthOutput]) => {
    if (csOutput && contract) {
      return {
        lockingBytecode: generateTemplateScenarioTransactionOutputLockingBytecode(csOutput, contract),
        token: serialiseTokenDetails(libauthOutput.token),
        valueSatoshis: Number(libauthOutput.valueSatoshis),
      };
    }

    return {
      lockingBytecode: `${binToHex(libauthOutput.lockingBytecode)}`,
      token: serialiseTokenDetails(libauthOutput.token),
      valueSatoshis: Number(libauthOutput.valueSatoshis),
    };
  });

  const version = libauthTransaction.version;

  return { inputs, locktime, outputs, version };
};

const generateTemplateScenarioSourceOutputs = (
  transactionBuilder: TransactionBuilder,
  libauthTransaction: TransactionBch,
  slotIndex: number,
): Array<WalletTemplateScenarioOutput<true>> => {
  const zippedInputs = zip(transactionBuilder.inputs, libauthTransaction.inputs);
  return zippedInputs.map(([csInput, libauthInput], inputIndex) => {
    return {
      lockingBytecode: generateTemplateScenarioBytecode(csInput, libauthInput, inputIndex, 'p2pkh_placeholder_lock', inputIndex === slotIndex),
      valueSatoshis: Number(csInput.satoshis),
      token: serialiseTokenDetails(csInput.token),
    };
  });
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

const generateUnlockingScriptParams = (
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

const generateTemplateScenarioParametersValues = (
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

const generateTemplateScenarioKeys = (
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
const generateTemplateScenarioBytecode = (
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

const generateTemplateScenarioTransactionOutputLockingBytecode = (
  csOutput: Output,
  contract: Contract,
): string | {} => {
  if (csOutput.to instanceof Uint8Array) return binToHex(csOutput.to);
  if ([contract.address, contract.tokenAddress].includes(csOutput.to)) return {};
  return binToHex(addressToLockScript(csOutput.to));
};

const generateTemplateScenarioParametersFunctionIndex = (
  abiFunction: AbiFunction,
  abi: readonly AbiFunction[],
): Record<string, string> => {
  const functionIndex = abi.length > 1
    ? abi.findIndex((func) => func.name === abiFunction.name)
    : undefined;

  return functionIndex !== undefined ? { function_index: functionIndex.toString() } : {};
};

const generateFunctionIndexTemplateVariable = (
  abi: readonly AbiFunction[],
): Record<string, WalletTemplateVariable> => {
  if (abi.length > 1) {
    return {
      function_index: {
        description: 'Script function index to execute',
        name: 'function_index',
        type: 'WalletData',
      },
    };
  }

  return {};
};
