import {
  binToHex,
  TransactionBCH,
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
  Artifact,
} from '@cashscript/utils';
import { EncodedConstructorArgument, EncodedFunctionArgument, encodeFunctionArguments } from '../Argument.js';
import { Contract } from '../Contract.js';
import { DebugResult, debugTemplate } from '../debugging.js';
import {
  AddressType,
  UnlockableUtxo,
  Utxo,
} from '../interfaces.js';
import {
  formatBytecodeForDebugging,
  formatParametersForDebugging,
  generateTemplateScenarioBytecode,
  generateTemplateScenarioKeys,
  generateTemplateScenarioParametersValues,
  generateTemplateScenarioTransactionOutputLockingBytecode,
  getHashTypeName,
  getSignatureAlgorithmName,
  serialiseTokenDetails,
} from '../LibauthTemplate.js';
import SignatureTemplate from '../SignatureTemplate.js';
import { Transaction } from '../Transaction.js';
import { addressToLockScript, snakeCase, titleCase } from '../utils.js';
import { TransactionBuilder } from '../TransactionBuilder.js';


/**
 * Generates template entities for P2PKH (Pay to Public Key Hash) placeholder scripts.
 *
 * Follows the WalletTemplateEntity specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateEntitiesP2PKH = (
  index: number,
): WalletTemplate['entities'] => {
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
          name: `Placeholder Key ${index}`,
          type: 'HdKey',
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
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
): WalletTemplate['entities'] => {
  const functionParameters = Object.fromEntries<WalletTemplateVariable>(
    abiFunction.inputs.map((input, index) => ([
      snakeCase(input.name),
      {
        description: `"${input.name}" parameter of function "${abiFunction.name}"`,
        name: titleCase(input.name),
        type: encodedFunctionArgs[index] instanceof SignatureTemplate ? 'Key' : 'WalletData',
      },
    ])),
  );

  const constructorParameters = Object.fromEntries<WalletTemplateVariable>(
    artifact.constructorInputs.map((input) => ([
      snakeCase(input.name),
      {
        description: `"${input.name}" parameter of this contract`,
        name: titleCase(input.name),
        type: 'WalletData',
      },
    ])),
  );

  const entities = {
    [snakeCase(artifact.contractName + 'Parameters')]: {
      description: 'Contract creation and function parameters',
      name: titleCase(artifact.contractName),
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
      name: titleCase('function_index'),
      type: 'WalletData',
    };
  }

  return entities;
};

/**
 * Generates template scripts for P2PKH (Pay to Public Key Hash) placeholder scripts.
 *
 * Follows the WalletTemplateScript specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateScriptsP2PKH = (
  template: SignatureTemplate,
  index: number,
): WalletTemplate['scripts'] => {
  const scripts: WalletTemplate['scripts'] = {};
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

/**
 * Generates template scripts for P2SH (Pay to Script Hash) placeholder scripts.
 *
 * Follows the WalletTemplateScript specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
export const generateTemplateScriptsP2SH = (
  artifact: Artifact,
  addressType: AddressType,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  encodedConstructorArgs: EncodedConstructorArgument[],
  scenarioIdentifier: string,
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode
  return {
    [snakeCase(artifact.contractName + '_' + abiFunction.name + '_unlock')]: generateTemplateUnlockScript(artifact, abiFunction, encodedFunctionArgs, scenarioIdentifier),
    [snakeCase(artifact.contractName + '_lock')]: generateTemplateLockScript(artifact, addressType, encodedConstructorArgs),
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

/**
 * Generates a template unlock script for a P2SH (Pay to Script Hash) placeholder script.
 *
 * Follows the WalletTemplateScriptUnlocking specification from:
 * https://ide.bitauth.com/authentication-template-v0.schema.json
 *
 */
const generateTemplateUnlockScript = (
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedFunctionArgument[],
  scenarioIdentifier: string,
): WalletTemplateScriptUnlocking => {
  const functionIndex = artifact.abi.findIndex((func) => func.name === abiFunction.name);

  const functionIndexString = artifact.abi.length > 1
    ? ['// function index in contract', `<function_index> // int = <${functionIndex}>`, '']
    : [];

  return {
    // this unlocking script must pass our only scenario
    passes: [scenarioIdentifier],
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
  scenarioIdentifier: string,
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
    [scenarioIdentifier]: {
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

  if (artifact.abi.length > 1) {
    const functionIndex = artifact.abi.findIndex((func) => func.name === abiFunction.name);
    scenarios![scenarioIdentifier].data!.bytecode!.function_index = functionIndex.toString();
  }

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


/**
 * Creates a transaction object from a TransactionBuilder instance
 *
 * @param txn - The TransactionBuilder instance to convert
 * @returns A transaction object containing inputs, outputs, locktime and version
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createCSTransaction = (txn: TransactionBuilder) => {
  const csTransaction = {
    inputs: txn.inputs,
    locktime: txn.locktime,
    outputs: txn.outputs,
    version: 2,
  };

  return csTransaction;
};

export const getLibauthTemplates = (
  txn: TransactionBuilder,
): { template: WalletTemplate; debugResult: DebugResult[] } => {
  const libauthTransaction = txn.buildLibauthTransaction();
  const csTransaction = createCSTransaction(txn);

  const baseTemplate: WalletTemplate = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: 'CashScript Generated Debugging Template',
    supported: ['BCH_2023_05'],
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

  for (const [idx, input] of txn.inputs.entries()) {
    // If template exists on the input, it indicates this is a P2PKH (Pay to Public Key Hash) input
    if (input.unlocker?.template) {
      // @ts-ignore TODO: Remove UtxoP2PKH type and only use UnlockableUtxo in Libaith Template generation
      input.template = input.unlocker?.template;  // Added to support P2PKH inputs in buildTemplate
      Object.assign(p2pkhEntities, generateTemplateEntitiesP2PKH(idx));
      Object.assign(p2pkhScripts, generateTemplateScriptsP2PKH(input.unlocker.template, idx));

      continue;
    }

    // If contract exists on the input, it indicates this is a contract input
    if (input.unlocker?.contract) {
      const contract = input.unlocker?.contract;
      const abiFunction = input.unlocker?.abiFunction;

      if (!abiFunction) {
        throw new Error('No ABI function found in unlocker');
      }

      // Find matching function and index from contract.unlock Object, this uses Function Reference Comparison.
      // Generate unique scenario identifier by combining contract name, function name and counter
      const baseIdentifier = `${contract.artifact.contractName}_${abiFunction.name}Evaluate`;
      let scenarioIdentifier = baseIdentifier;
      let counter = 0;

      // Find first available unique identifier by incrementing counter
      while (scenarios[snakeCase(scenarioIdentifier)]) {
        counter++;
        scenarioIdentifier = `${baseIdentifier}${counter}`;
      }

      scenarioIdentifier = snakeCase(scenarioIdentifier);

      // Encode the function arguments for this contract input
      const encodedArgs = encodeFunctionArguments(
        abiFunction,
        input.unlocker.params ?? [],
      );

      // Generate a scenario object for this contract input
      Object.assign(scenarios,
        generateTemplateScenarios(
          scenarioIdentifier,
          contract,
          libauthTransaction,
          csTransaction as any,
          abiFunction,
          encodedArgs,
          idx,
        ),
      );

      // Generate entities for this contract input
      const entity = generateTemplateEntitiesP2SH(
        contract.artifact,
        abiFunction,
        encodedArgs,
      );

      // Generate scripts for this contract input
      const script = generateTemplateScriptsP2SH(
        contract.artifact,
        contract.addressType,
        abiFunction,
        encodedArgs,
        contract.encodedConstructorArgs,
        scenarioIdentifier,
      );

      // Find the lock script name for this contract input
      const lockScriptName = Object.keys(script).find(scriptName => scriptName.includes('_lock'));
      if (lockScriptName) {
        // Generate bytecodes for this contract input
        const csInput = csTransaction.inputs[idx];
        const unlockingBytecode = binToHex(libauthTransaction.inputs[idx].unlockingBytecode);
        const lockingScriptParams = generateLockingScriptParams(csInput.unlocker!.contract!, csInput, lockScriptName);

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

  // Merge P2PKH scripts
  for (const entity of Object.values(p2pkhEntities) as { scripts?: string[] }[]) {
    if (entity.scripts) { entity.scripts = [...Object.keys(scripts), ...entity.scripts]; }
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

  // Generate debug results
  const debugResult: DebugResult[] = txn.inputs
    .map(input => input.unlocker?.contract)
    .filter((contract): contract is Contract => !!contract)
    .map(contract => debugTemplate(finalTemplate, contract.artifact));

  return { template: finalTemplate, debugResult };
};

const generateLockingScriptParams = (
  contract: Contract,
  csInput: UnlockableUtxo,
  lockScriptName: string,
): WalletTemplateScenarioBytecode => {
  if (!csInput.unlocker?.contract) return {
    script: lockScriptName,
  };

  const constructorParamsEntries = contract.artifact.constructorInputs
    .map(({ name }, index) => [name, `0x${binToHex(csInput.unlocker!.contract!.encodedConstructorArgs[index])}`]);

  const constructorParams = Object.fromEntries(constructorParamsEntries);

  return {
    script: lockScriptName,
    overrides: {
      bytecode: { ...constructorParams },
    },
  };
};
