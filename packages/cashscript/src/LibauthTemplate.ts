import {
  AbiFunction,
  AbiInput,
  Artifact,
  PrimitiveType,
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
} from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';
import { Transaction } from './Transaction.js';
import { EncodedArgument } from './Argument.js';
import { addressToLockScript, extendedStringify, snakeCase, zip } from './utils.js';

interface BuildTemplateOptions {
  transaction: Transaction;
  transactionHex?: string;
}

// TODO: Can we change this so we don't need to pass in both the transaction and the transactionHex?
export const buildTemplate = async ({
  transaction,
  transactionHex = undefined, // set this argument to prevent unnecessary call `transaction.build()`
}: BuildTemplateOptions): Promise<WalletTemplate> => {
  const contract = transaction.contract;
  const txHex = transactionHex ?? await transaction.build();

  const hasSignatureTemplates = transaction.inputs.filter((input) => isUtxoP2PKH(input)).length > 0;

  const template = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: contract.artifact.contractName,
    supported: ['BCH_SPEC'],
    version: 0,
    entities: generateTemplateEntities(contract.artifact, transaction.abiFunction),
    scripts: generateTemplateScripts(
      contract.artifact, transaction.abiFunction, transaction.encodedFunctionArgs, contract.encodedConstructorArgs,
    ),
    scenarios: generateTemplateScenarios(
      transaction,
      txHex,
      contract.artifact,
      transaction.abiFunction,
      transaction.encodedFunctionArgs,
      contract.encodedConstructorArgs,
      hasSignatureTemplates,
    ),
  } as WalletTemplate;

  // add extra variables for the p2pkh utxos spent together with our contract
  if (hasSignatureTemplates) {
    template.entities.parameters.scripts!.push('p2pkh_placeholder_lock', 'p2pkh_placeholder_unlock');
    template.entities.parameters.variables = {
      ...template.entities.parameters.variables,
      placeholder_key: {
        description: 'placeholder_key',
        name: 'placeholder_key',
        type: 'Key',
      },
    };

    // add extra unlocking and locking script for P2PKH inputs spent alongside our contract
    // this is needed for correct cross-referrences in the template
    template.scripts.p2pkh_placeholder_unlock = {
      name: 'p2pkh_placeholder_unlock',
      script:
          '<placeholder_key.schnorr_signature.all_outputs>\n<placeholder_key.public_key>',
      unlocks: 'p2pkh_placeholder_lock',
    };
    template.scripts.p2pkh_placeholder_lock = {
      lockingType: 'standard',
      name: 'p2pkh_placeholder_lock',
      script:
          'OP_DUP\nOP_HASH160 <$(<placeholder_key.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
    };
  }

  return template;
};

export const getBitauthUri = (template: WalletTemplate): string => {
  const base64toBase64Url = (base64: string): string => base64.replace(/\+/g, '-').replace(/\//g, '_');
  const payload = base64toBase64Url(binToBase64(deflate(utf8ToBin(extendedStringify(template)))));
  return `https://ide.bitauth.com/import-template/${payload}`;
};


const generateTemplateEntities = (artifact: Artifact, abiFunction: AbiFunction): WalletTemplate['entities'] => {
  const functionParameters = Object.fromEntries<WalletTemplateVariable>(
    abiFunction.inputs.map((input) => ([
      snakeCase(input.name),
      {
        description: `"${input.name}" parameter of function "${abiFunction.name}"`,
        name: input.name,
        type: input.type === PrimitiveType.SIG ? 'Key' : 'WalletData',
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
    parameters: {
      description: 'Contract creation and function parameters',
      name: 'parameters',
      scripts: [
        'lock',
        'unlock_lock',
      ],
      variables: {
        ...functionParameters,
        ...constructorParameters,
      },
    },
  };

  // function_index is a special variable that indicates the function to execute
  if (artifact.abi.length > 1) {
    entities.parameters.variables.function_index = {
      description: 'Script function index to execute',
      name: 'function_index',
      type: 'WalletData',
    };
  }

  return entities;
};

const generateTemplateScripts = (
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedArgument[],
  encodedConstructorArgs: EncodedArgument[],
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode
  return {
    unlock_lock: generateTemplateUnlockScript(artifact, abiFunction, encodedFunctionArgs),
    lock: generateTemplateLockScript(artifact, encodedConstructorArgs),
  };
};

const generateTemplateLockScript = (
  artifact: Artifact,
  constructorArguments: EncodedArgument[],
): WalletTemplateScriptLocking => {
  return {
    lockingType: 'p2sh20', // TODO: use 'transaction.contract.addressType',
    name: 'lock',
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
  encodedFunctionArgs: EncodedArgument[],
): WalletTemplateScriptUnlocking => {
  const functionIndex = artifact.abi.findIndex((func) => func.name === abiFunction.name);

  const functionIndexString = artifact.abi.length > 1
    ? ['// function index in contract', `<function_index> // int = <${functionIndex}>`, '']
    : [];

  return {
    // this unlocking script must pass our only scenario
    passes: ['evaluate_function'],
    name: 'unlock',
    script: [
      `// "${abiFunction.name}" function parameters`,
      formatParametersForDebugging(abiFunction.inputs, encodedFunctionArgs),
      '',
      ...functionIndexString,
    ].join('\n'),
    unlocks: 'lock',
  };
};

const generateTemplateScenarios = (
  transaction: Transaction,
  transactionHex: string,
  artifact: Artifact,
  abiFunction: AbiFunction,
  encodedFunctionArgs: EncodedArgument[],
  encodedConstructorArgs: EncodedArgument[],
  hasSignatureTemplates: boolean,
): WalletTemplate['scenarios'] => {
  const libauthTransaction = decodeTransaction(hexToBin(transactionHex));
  if (typeof libauthTransaction === 'string') throw Error(libauthTransaction);

  const scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    evaluate_function: {
      name: 'Evaluate',
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: {
          ...generateTemplateScenarioParametersValues(abiFunction.inputs, encodedFunctionArgs),
          ...generateTemplateScenarioParametersValues(artifact.constructorInputs, encodedConstructorArgs),
        },
        // TODO: Don't hardcode these values
        currentBlockHeight: 2,
        currentBlockTime: Math.round(+new Date() / 1000),
        keys: {
          privateKeys: generateTemplateScenarioKeys(
            abiFunction.inputs, encodedFunctionArgs, hasSignatureTemplates,
          ),
        },
      },
      transaction: generateTemplateScenarioTransaction(libauthTransaction, transaction),
      sourceOutputs: generateTemplateScenarioSourceOutputs(transaction),
    },
  };


  if (artifact.abi.length > 1) {
    const functionIndex = artifact.abi.findIndex((func) => func.name === transaction.abiFunction.name);
    scenarios!.evaluate_function!.data!.bytecode!.function_index = functionIndex.toString();
  }

  return scenarios;
};

const generateTemplateScenarioTransaction = (
  libauthTransaction: TransactionBCH,
  csTransaction: Transaction,
): WalletTemplateScenario['transaction'] => {
  const slotIndex = csTransaction.inputs.findIndex((input) => !isUtxoP2PKH(input));

  const inputs = libauthTransaction.inputs.map((input, index) => {
    const csInput = csTransaction.inputs[index] as Utxo; // TODO: Change

    return {
      outpointIndex: input.outpointIndex,
      outpointTransactionHash:
      // TODO: This should always be Uint8Array according to the libauth transaction types
        input.outpointTransactionHash instanceof Uint8Array
          ? binToHex(input.outpointTransactionHash)
          : input.outpointTransactionHash,
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode: generateTemplateScenarioBytecode(csInput, 'p2pkh_placeholder_unlock', index === slotIndex),
    } as WalletTemplateScenarioInput;
  });

  const locktime = libauthTransaction.locktime;

  const outputs = libauthTransaction.outputs.map((output, index) => {
    const csOutput = csTransaction.outputs[index]; // TODO: Change

    return {
      lockingBytecode: generateTemplateScenarioTransactionOutputLockingBytecode(csOutput),
      token: serialiseTokenDetails(output.token),
      valueSatoshis: Number(output.valueSatoshis),
    } as WalletTemplateScenarioTransactionOutput;
  });

  const version = libauthTransaction.version;

  return { inputs, locktime, outputs, version };
};

const generateTemplateScenarioTransactionOutputLockingBytecode = (
  csOutput: Output,
): string => {
  if (csOutput.to instanceof Uint8Array) return binToHex(csOutput.to);
  return binToHex(addressToLockScript(csOutput.to));
};

const generateTemplateScenarioSourceOutputs = (
  csTransaction: Transaction,
): Array<WalletTemplateScenarioOutput<true>> => {
  const slotIndex = csTransaction.inputs.findIndex((input) => !isUtxoP2PKH(input));

  return csTransaction.inputs.map((input, index) => {
    return {
      lockingBytecode: generateTemplateScenarioBytecode(input, 'p2pkh_placeholder_lock', index === slotIndex),
      valueSatoshis: Number(input.satoshis),
      token: serialiseTokenDetails(input.token),
    };
  });
};

// Used for generating the locking / unlocking bytecode for source outputs and inputs
const generateTemplateScenarioBytecode = (
  input: Utxo, p2pkhScriptName: string, insertSlot?: boolean,
): WalletTemplateScenarioBytecode | ['slot'] => {
  if (isUtxoP2PKH(input)) {
    return {
      script: p2pkhScriptName,
      overrides: {
        keys: {
          privateKeys: {
            placeholder_key: binToHex(input.template.privateKey),
          },
        },
      },
    };
  }

  return insertSlot ? ['slot'] : {};
};

const generateTemplateScenarioParametersValues = (
  types: AbiInput[],
  encodedArgs: EncodedArgument[],
): Record<string, string> => {
  const typesAndArguments = zip(types, encodedArgs);

  const entries = typesAndArguments
    // SignatureTemplates are handled by the 'keys' object in the scenario
    .filter(([, arg]) => !(arg instanceof SignatureTemplate))
    .map(([input, arg]) => {
      const encodedArgumentHex = binToHex(arg as Uint8Array);
      // TODO: Is this really necessary?
      const prefixedEncodedArgument = encodedArgumentHex.length ? `0x${encodedArgumentHex}` : encodedArgumentHex;
      return [snakeCase(input.name), prefixedEncodedArgument] as const;
    });

  return Object.fromEntries(entries);
};

const generateTemplateScenarioKeys = (
  types: AbiInput[],
  encodedArgs: EncodedArgument[],
  hasSignatureTemplates: boolean,
): Record<string, string> => {
  const typesAndArguments = zip(types, encodedArgs);

  const entries = typesAndArguments
    .filter(([, arg]) => arg instanceof SignatureTemplate)
    .map(([input, arg]) => ([snakeCase(input.name), binToHex((arg as SignatureTemplate).privateKey)] as const));

  const placeholderKey = hasSignatureTemplates
    ? [['placeholder_key', '0x0000000000000000000000000000000000000000000000000000000000000000']]
    : [];

  return Object.fromEntries([...entries, ...placeholderKey]);
};

const formatParametersForDebugging = (types: AbiInput[], args: EncodedArgument[]): string => {
  if (types.length === 0) return '// none';

  // We reverse the arguments because the order of the arguments in the bytecode is reversed
  const typesAndArguments = zip(types, args).reverse();

  return typesAndArguments.map(([input, arg]) => {
    if (arg instanceof SignatureTemplate) {
      // TODO: Different signing algorithms / hashtypes
      return `<${snakeCase(input.name)}.schnorr_signature.all_outputs> // ${input.type}`;
    }

    const typeStr = input.type === 'bytes' ? `bytes${arg.length}` : input.type;

    // we output these values as pushdata, comment will contain the type and the value of the variable
    // e.g. <timeout> // int = <0xa08601>
    return `<${snakeCase(input.name)}> // ${typeStr} = <${`0x${binToHex(arg)}`}>`;
  }).join('\n');
};

const formatBytecodeForDebugging = (artifact: Artifact): string => {
  if (!artifact.debug) {
    // TODO: See if we can merge this with code from @cashscript/utils -> script.ts
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

// TODO: Maybe move / refactor
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
