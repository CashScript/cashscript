import {
  AbiFunction,
  AbiInput,
  Artifact,
  PrimitiveType,
  bytecodeToScript,
  formatBitAuthScript,
} from '@cashscript/utils';
import {
  hash160,
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
} from '@bitauth/libauth';
import { deflate } from 'pako';
import {
  UtxoP2PKH,
  LibauthOutput,
  Utxo,
  isUtxoP2PKH,
} from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';
import { Transaction } from './Transaction.js';
import { Argument, encodeArgumentForLibauthTemplate } from './Argument.js';
import { extendedStringify, snakeCase, zip } from './utils.js';

const createScenarioTransaction = (libauthTransaction: TransactionBCH, csTransaction: Transaction): WalletTemplateScenario['transaction'] => {
  const contract = csTransaction.contract;
  const result = ({} as WalletTemplateScenario['transaction'])!;

  // only one 'slot' is allowed, otherwise {} must be used
  let inputSlotInserted = false;
  result.inputs = libauthTransaction.inputs.map((input, index) => {
    const csInput = csTransaction.inputs[index] as Utxo;
    const signable = isUtxoP2PKH(csInput);
    let unlockingBytecode = {};
    if (signable) {
      unlockingBytecode = {
        script: 'p2pkh_placeholder_unlock',
        overrides: {
          keys: {
            privateKeys: {
              placeholder_key: binToHex((csInput as UtxoP2PKH).template.privateKey),
            },
          },
        },
      };
    } else {
      // assume it is our contract's input
      // eslint-disable-next-line
      if (!inputSlotInserted) {
        unlockingBytecode = ['slot'];
        inputSlotInserted = true;
      }
    }
    return {
      outpointIndex: input.outpointIndex,
      outpointTransactionHash:
        input.outpointTransactionHash instanceof Uint8Array
          ? binToHex(input.outpointTransactionHash)
          : input.outpointTransactionHash,
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode,
    } as WalletTemplateScenarioInput;
  });
  result.locktime = libauthTransaction.locktime;

  result.outputs = libauthTransaction.outputs.map(
    (output: LibauthOutput, index) => {
      const csOutput = csTransaction.outputs[index];
      let { lockingBytecode }: any = output;
      if (typeof csOutput.to === 'string') {
        if (
          [
            contract.address,
            contract.tokenAddress,
          ].includes(csOutput.to)
        ) {
          lockingBytecode = {};
        } else {
          for (const csInput of csTransaction.inputs) {
            if (isUtxoP2PKH(csInput)) {
              const inputPkh = hash160(csInput.template.getPublicKey());
              if (
                binToHex(output.lockingBytecode).slice(6, 46)
                === binToHex(inputPkh)
              ) {
                lockingBytecode = {
                  script: 'p2pkh_placeholder_lock',
                  overrides: {
                    keys: {
                      privateKeys: {
                        placeholder_key: binToHex(
                          csInput.template.privateKey,
                        ),
                      },
                    },
                  },
                };
              }
            }
          }
        }
      }
      return {
        lockingBytecode:
          lockingBytecode instanceof Uint8Array
            ? binToHex(lockingBytecode)
            : lockingBytecode,
        token: output.token ? {
          amount: output.token.amount.toString(),
          category: binToHex(output.token.category),
          nft: output.token.nft ? {
            capability: output.token.nft.capability,
            commitment: binToHex(output.token.nft.commitment),
          } : undefined,
        } : undefined,
        valueSatoshis: Number(output.valueSatoshis),
      } as WalletTemplateScenarioTransactionOutput;
    },
  );
  result.version = libauthTransaction.version;
  return result;
};

const createScenarioSourceOutputs = (csTransaction: Transaction): Array<WalletTemplateScenarioOutput<true>> => {
  // only one 'slot' is allowed, otherwise {} must be used
  let inputSlotInserted = false;
  return csTransaction.inputs.map(
    (csInput) => {
      const signable = isUtxoP2PKH(csInput);
      let lockingBytecode = {} as WalletTemplateScenarioOutput<true>['lockingBytecode'];
      if (signable) {
        lockingBytecode = {
          script: 'p2pkh_placeholder_lock',
          overrides: {
            keys: {
              privateKeys: {
                placeholder_key: binToHex(
                  csInput.template.privateKey,
                ),
              },
            },
          },
        };
      } else {
        // assume it is our contract's input
        // eslint-disable-next-line
        if (!inputSlotInserted) {
          lockingBytecode = ['slot'];
          inputSlotInserted = true;
        }
      }

      const result = {
        lockingBytecode: lockingBytecode,
        valueSatoshis: Number(csInput.satoshis),
      } as WalletTemplateScenarioOutput<true>;

      if (csInput.token) {
        result.token = {
          amount: csInput.token.amount.toString(),
          category: csInput.token.category,
        };

        if (csInput.token.nft) {
          result.token.nft = {
            capability: csInput.token.nft.capability,
            commitment: csInput.token.nft.commitment,
          };
        }
      }

      return result;
    },
  );
};

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

  const libauthTransaction = decodeTransaction(hexToBin(txHex));
  if (typeof libauthTransaction === 'string') throw Error(libauthTransaction);

  const abiFunction = transaction.abiFunction;
  const funcName = abiFunction.name;
  const functionIndex = contract.artifact.abi.findIndex(
    (func) => func.name === funcName,
  )!;
  const func: AbiFunction = contract.artifact.abi[functionIndex];
  const functionInputs = func.inputs.slice().reverse();
  const args = transaction.args.slice().reverse();

  const hasSignatureTemplates = transaction.inputs.filter((input) => isUtxoP2PKH(input)).length > 0;

  const template = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: contract.artifact.contractName,
    supported: ['BCH_SPEC'],
    version: 0,
    entities: generateTemplateEntities(contract.artifact, abiFunction),
    scripts: generateTemplateScripts(contract.artifact, abiFunction, transaction.args, contract.constructorArgs),
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

  template.scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    evaluate_function: {
      name: 'Evaluate',
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: {
          ...generateTemplateScenarioParametersValues(abiFunction.inputs, transaction.args),
          ...generateTemplateScenarioParametersValues(contract.artifact.constructorInputs, contract.constructorArgs),
        },
        currentBlockHeight: 2,
        currentBlockTime: Math.round(+new Date() / 1000),
        keys: {
          privateKeys: generateTemplateScenarioKeys(functionInputs, args, hasSignatureTemplates),
        },
      },
      transaction: createScenarioTransaction(libauthTransaction, transaction),
      sourceOutputs: createScenarioSourceOutputs(transaction),
    },
  };

  if (contract.artifact.abi.length > 1) {
    template.scenarios!.evaluate_function!.data!.bytecode!.function_index = functionIndex.toString();
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
  functionArguments: Argument[],
  constructorArguments: Argument[],
): WalletTemplate['scripts'] => {
  // definition of locking scripts and unlocking scripts with their respective bytecode
  return {
    unlock_lock: generateTemplateUnlockScript(artifact, abiFunction, functionArguments),
    lock: generateTemplateLockScript(artifact, constructorArguments),
  };
};

const generateTemplateLockScript = (
  artifact: Artifact,
  constructorArguments: Argument[],
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
  functionArguments: Argument[],
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
      formatParametersForDebugging(abiFunction.inputs, functionArguments),
      '',
      ...functionIndexString,
    ].join('\n'),
    unlocks: 'lock',
  };
};

const generateTemplateScenarioParametersValues = (types: AbiInput[], args: Argument[]): Record<string, string> => {
  const typesAndArguments = zip(types, args);

  const entries = typesAndArguments
    // SignatureTemplates are handled by the 'keys' object in the scenario
    .filter(([, arg]) => !(arg instanceof SignatureTemplate))
    .map(([input, arg]) => {
      const encodedArgument = binToHex(encodeArgumentForLibauthTemplate(arg, input.type) as Uint8Array);
      // TODO: Is this really necessary?
      const prefixedEncodedArgument = encodedArgument.length ? `0x${encodedArgument}` : encodedArgument;
      return [snakeCase(input.name), prefixedEncodedArgument] as const;
    });

  return Object.fromEntries(entries);
};

const generateTemplateScenarioKeys = (
  types: AbiInput[],
  args: Argument[],
  hasSignatureTemplates: boolean,
): Record<string, string> => {
  const typesAndArguments = zip(types, args);

  const entries = typesAndArguments
    .filter(([, arg]) => arg instanceof SignatureTemplate)
    .map(([input, arg]) => ([snakeCase(input.name), binToHex((arg as SignatureTemplate).privateKey)] as const));

  const placeholderKey = hasSignatureTemplates
    ? [['placeholder_key', '0x0000000000000000000000000000000000000000000000000000000000000000']]
    : [];

  return Object.fromEntries([...entries, ...placeholderKey]);
};

const formatParametersForDebugging = (types: AbiInput[], args: Argument[]): string => {
  if (types.length === 0) return '// none';

  const typesAndArguments = zip(types, args).reverse();

  return typesAndArguments.map(([input, arg]) => {
    const encodedArgument = encodeArgumentForLibauthTemplate(arg, input.type);
    const typeStr = input.type === 'bytes' && encodedArgument instanceof Uint8Array
      ? `bytes${encodedArgument.length}`
      : input.type;

    if (encodedArgument instanceof SignatureTemplate) {
      // TODO: Different signing algorithms / hashtypes
      return `<${snakeCase(input.name)}.schnorr_signature.all_outputs> // ${input.type}`;
    }

    // we output these values as pushdata, comment will contain the type and the value of the variable
    // e.g. <timeout> // int = <0xa08601>
    return `<${snakeCase(input.name)}> // ${typeStr} = <${`0x${binToHex(encodedArgument)}`}>`;
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
