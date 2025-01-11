import {
  AbiFunction,
  Artifact,
} from '@cashscript/utils';
import {
  binToHex,
  TransactionBCH,
  WalletTemplate,
  WalletTemplateEntity,
  WalletTemplateScenario,
  WalletTemplateScenarioInput,
  WalletTemplateScenarioOutput,
  WalletTemplateScenarioTransactionOutput,
  WalletTemplateScript,
  WalletTemplateScriptLocking,
  WalletTemplateScriptUnlocking,
  WalletTemplateVariable,
} from '@bitauth/libauth';
import { EncodedConstructorArgument, EncodedFunctionArgument, encodeFunctionArguments } from '../Argument.js';
import { Contract } from '../Contract.js';
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
import {
  AddressType,
  Utxo,
} from '../interfaces.js';
import SignatureTemplate from '../SignatureTemplate.js';
import { debugTemplate } from '../debugging.js';
import { Transaction } from '../Transaction.js';
import { addressToLockScript, snakeCase } from '../utils.js';
import { DebugResult } from '../debugging.js';
import { TransactionBuilder } from './Builder.js';


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
  scenarioIdentifier: string,
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode

  return {
    [snakeCase(artifact.contractName + '_' + abiFunction.name + '_unlock')]: generateTemplateUnlockScript(artifact, abiFunction, encodedFunctionArgs, scenarioIdentifier),
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


const createCSTransaction = (txn: TransactionBuilder): any => {
  const csTransaction = {
    inputs: txn.inputs,
    locktime: txn.locktime,
    outputs: txn.outputs,
    version: 2,
  };

  return csTransaction;
};

export const getLibauthTemplates = async (
  txn: TransactionBuilder,
): Promise<{ template: WalletTemplate; debugResult: DebugResult[] }> => {
  const libauthTransaction = await txn.buildTransaction();
  const csTransaction = createCSTransaction(txn);

  const baseTemplate: WalletTemplate = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: 'Advanced Debugging',
    supported: ['BCH_2023_05'],
    version: 0,
    entities: {},
    scripts: {},
    scenarios: {},
  };

  // const finalDebugResult: DebugResult[] = [];
  // Initialize collections for entities, scripts, and scenarios
  const entities: Record<string, WalletTemplateEntity> = {};
  const scripts: Record<string, WalletTemplateScript> = {};
  const scenarios: Record<string, WalletTemplateScenario> = {};

  // Initialize collections for P2PKH entities and scripts
  const p2pkhEntities: Record<string, WalletTemplateEntity> = {};
  const p2pkhScripts: Record<string, WalletTemplateScript> = {};

  // Initialize bytecode mappings
  const unlockingBytecodes: Record<string, string> = {};
  const lockingBytecodes: Record<string, string> = {};

  
  for (const [idx, input] of txn.inputs.entries()) {    
    if (input.options?.template) {
      // @ts-ignore
      input.template = input.options?.template;
      const index = Object.keys(p2pkhEntities).length;
      Object.assign(p2pkhEntities, generateTemplateEntitiesP2PKH(index));
      Object.assign(p2pkhScripts, generateTemplateScriptsP2PKH(input.options.template, index));

      continue;
    }

    if (input.options?.contract) {
      const contract = input.options?.contract;

      // Find matching function and index from contract.unlock array
      const matchingUnlockerIndex = Object.values(contract.unlock)
        .findIndex(fn => fn === input.unlocker);

      if (matchingUnlockerIndex === -1) {
        throw new Error('Could not find matching unlock function');
      }

      // Generate unique scenario identifier by combining contract name, function name and counter
      const baseIdentifier = `${contract.artifact.contractName}_${contract.artifact.abi[matchingUnlockerIndex].name}EvaluateFunction`;
      let scenarioIdentifier = baseIdentifier;
      let counter = 0;

      // Find first available unique identifier by incrementing counter
      while (scenarios[snakeCase(scenarioIdentifier)]) {
        counter++;
        scenarioIdentifier = `${baseIdentifier}${counter}`;
      }
      
      scenarioIdentifier = snakeCase(scenarioIdentifier);

      Object.assign(scenarios,
        generateTemplateScenarios(
          scenarioIdentifier,
          contract,
          libauthTransaction,
          csTransaction,
          contract?.artifact.abi[matchingUnlockerIndex],
          input.options?.params ?? [],
          idx,
        ),
      );

      const encodedArgs = encodeFunctionArguments(
        contract.artifact.abi[matchingUnlockerIndex],
        input.options?.params ?? [],
      );

      const entity = generateTemplateEntities(
        contract.artifact,
        contract.artifact.abi[matchingUnlockerIndex],
        encodedArgs,
      );
      const script = generateTemplateScripts(
        contract.artifact,
        contract.addressType,
        contract.artifact.abi[matchingUnlockerIndex],
        encodedArgs,
        contract.encodedConstructorArgs,
        scenarioIdentifier,
      );

      const lockScriptName = Object.keys(script).find(scriptName => scriptName.includes('_lock'));
      if (lockScriptName) {
        const unlockingBytecode = binToHex(libauthTransaction.inputs[idx].unlockingBytecode);
        unlockingBytecodes[unlockingBytecode] = lockScriptName;
        lockingBytecodes[binToHex(addressToLockScript(contract.address))] = lockScriptName;
      }

      Object.assign(entities, entity);
      Object.assign(scripts, script);
    }
  }

  // Merge P2PKH scripts
  for (const entity of Object.values(p2pkhEntities) as { scripts?: string[] }[]) {
    if (entity.scripts) {entity.scripts = [...Object.keys(scripts), ...entity.scripts]; }
  }

  Object.assign(entities, p2pkhEntities);
  Object.assign(scripts, p2pkhScripts);

  const finalTemplate = { ...baseTemplate, entities, scripts, scenarios };

  for (const scenario of Object.values(scenarios)) {
    for (const [idx, input] of libauthTransaction.inputs.entries()) {
      const unlockingBytecode = binToHex(input.unlockingBytecode);
      if (unlockingBytecodes[unlockingBytecode]) {

        // @ts-ignore
        if (Array.isArray(scenario.sourceOutputs[idx].lockingBytecode)) continue;

        // @ts-ignore
        scenario.sourceOutputs[idx].lockingBytecode = {
          script: unlockingBytecodes[unlockingBytecode],
        };
      }
    }

    for (const [idx, output] of libauthTransaction.outputs.entries()) {
      const lockingBytecode = binToHex(output.lockingBytecode);
      if (lockingBytecodes[lockingBytecode]) {

        // @ts-ignore
        if (Array.isArray(scenario.transaction.outputs[idx].lockingBytecode)) continue;
        // @ts-ignore
        scenario.transaction.outputs[idx].lockingBytecode = {
          script: lockingBytecodes[lockingBytecode],
        };
      }
    }

  }

  // Generate debug results
  const debugResult: DebugResult[] = txn.inputs
    .map(input => input.options?.contract)
    .filter((contract): contract is Contract => !!contract)
    .map(contract => debugTemplate(finalTemplate, contract.artifact));


  return { template: finalTemplate, debugResult };
};
