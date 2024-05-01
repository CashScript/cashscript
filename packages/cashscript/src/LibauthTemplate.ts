import {
  AbiFunction,
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
import { extendedStringify, snakeCase } from './utils.js';

// wtf is this
const merge = (array: any): any => array.reduce(
  (prev: any, cur: any) => ({
    ...prev,
    ...{ [Object.keys(cur)[0]]: cur[Object.keys(cur)[0]] },
  }),
  {},
);

const zip = <T, U>(a: T[], b: U[]): [T, U][] => Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);


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

  const constructorInputs = contract.artifact.constructorInputs.slice().reverse();
  const contractParameters = contract.constructorArgs.slice().reverse();

  const abiFunction = transaction.abiFunction;
  const funcName = abiFunction.name;
  const functionIndex = contract.artifact.abi.findIndex(
    (func) => func.name === funcName,
  )!;
  const func: AbiFunction = contract.artifact.abi[functionIndex];
  const functionInputs = func.inputs.slice().reverse();
  const args = transaction.args.slice().reverse();

  const hasSignatureTemplates = transaction.inputs.filter(
    (input) => isUtxoP2PKH(input),
  ).length;

  const template = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: contract.artifact.contractName,
    supported: ['BCH_SPEC'],
    version: 0,
  } as WalletTemplate;

  // declaration of template variables and their types
  template.entities = {
    parameters: {
      description: 'Contract creation and function parameters',
      name: 'parameters',
      scripts: [
        'lock',
        'unlock_lock',
      ],
      variables: merge([
        ...functionInputs.map((input) => ({
          [snakeCase(input.name)]: {
            description: `"${input.name}" parameter of function "${func.name}"`,
            name: input.name,
            type: input.type === PrimitiveType.SIG ? 'Key' : 'WalletData',
          },
        })),
        {
          function_index: {
            description: 'Script function index to execute',
            name: 'function_index',
            type: 'WalletData',
          },
        },
        ...constructorInputs.map((input) => ({
          [snakeCase(input.name)]: {
            description: `"${input.name}" parameter of this contract`,
            name: input.name,
            type: 'WalletData',
          },
        })),
      ]),
    },
  };

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
  }

  template.scenarios = {
    // single scenario to spend out transaction under test given the CashScript parameters provided
    evaluate_function: {
      name: 'Evaluate',
      description: 'An example evaluation where this script execution passes.',
      data: {
        // encode values for the variables defined above in `entities` property
        bytecode: merge([
          ...zip(functionInputs, args)
            .filter(([input]) => input.type !== PrimitiveType.SIG)
            .map(([input, arg]) => {
              const hex = binToHex(arg as Uint8Array);
              const result = hex.length ? `0x${hex}` : hex;
              return {
                [snakeCase(input.name)]: result,
              };
            }),
          { function_index: functionIndex.toString() },
          ...constructorInputs.map((input, index) => {
            const hex = binToHex(
              encodeArgumentForLibauthTemplate(
                contractParameters[index],
                constructorInputs[index].type,
              ) as Uint8Array,
            );
            const result = hex.length ? `0x${hex}` : hex;
            return {
              [snakeCase(input.name)]: result,
            };
          }),
        ]),
        currentBlockHeight: 2,
        currentBlockTime: Math.round(+new Date() / 1000),
        keys: {
          privateKeys: merge([
            ...zip(functionInputs, args)
              .filter(([input]) => input.type === PrimitiveType.SIG)
              .map(([input, arg]) => ({
                [snakeCase(input.name)]: arg instanceof SignatureTemplate
                  ? binToHex(arg.privateKey)
                  : binToHex((arg)), // TODO: Double check if this makes sense
              })),
            ...(hasSignatureTemplates
              ? [
                {
                  // placeholder will be replaced by a key for each respective P2PKH input spent
                  placeholder_key:
                      '<Uint8Array: 0x0000000000000000000000000000000000000000000000000000000000000000>',
                },
              ]
              : []),
          ]),
        },
      },
      transaction: createScenarioTransaction(libauthTransaction, transaction),
      sourceOutputs: createScenarioSourceOutputs(transaction),
    },
  };

  // definition of locking scripts and unlocking scripts with their respective bytecode
  template.scripts = {
    unlock_lock: {
      // this unlocking script must pass our only scenario
      passes: ['evaluate_function'],
      name: 'unlock',
      // unlocking script contains the CashScript function parameters and function selector
      // we output these values as pushdata, comment will contain the type and the value of the variable
      // example: '<timeout> // int = <0xa08601>'
      script: [
        `// "${func.name}" function parameters`,
        ...(functionInputs.length
          ? zip(functionInputs, args).map(([input, arg]) => (input.type === PrimitiveType.SIG
            ? `<${snakeCase(
              input.name,
            )}.schnorr_signature.all_outputs> // ${input.type}`
            : `<${snakeCase(input.name)}> // ${input.type} = <${
              `0x${binToHex(arg as any)}` // TODO: remove any cast
            }>`))
          : ['// none']),
        '',
        ...(contract.artifact.abi.length > 1
          ? [
            '// function index in contract',
            `<function_index> // int = <${functionIndex.toString()}>`,
            '',
          ]
          : []),
      ].join('\n'),
      unlocks: 'lock',
    },
    lock: {
      lockingType: 'p2sh20', //transaction.contract.addressType,
      name: 'lock',
      script: formatBitAuthScriptForDebugging(contract.artifact, contract.constructorArgs),
    },
  };

  // add extra unlocking and locking script for P2PKH inputs spent alongside our contract
  // this is needed for correct cross-referrences in the template
  if (hasSignatureTemplates) {
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

const formatBitAuthScriptForDebugging = (artifact: Artifact, constructorArguments: Argument[]): string => {
  // locking script contains the CashScript contract parameters followed by the contract opcodes
  // we output these values as pushdata, comment will contain the type and the value of the variable
  return [
    `// "${artifact.contractName}" contract constructor parameters`,
    formatConstructorParametersForDebugging(artifact, constructorArguments),
    '',
    '// bytecode',
    formatBytecodeForDebugging(artifact),
  ].join('\n');
};

const formatConstructorParametersForDebugging = (artifact: Artifact, constructorArguments: Argument[]): string => {
  const constructorTypesReversed = [...artifact.constructorInputs].reverse();
  const constructorArgumentsReversed = [...constructorArguments].reverse();

  if (constructorArgumentsReversed.length === 0) {
    return '// none';
  }

  return constructorTypesReversed.map((input, index) => {
    const encodedArgument = encodeArgumentForLibauthTemplate(
      constructorArgumentsReversed[index],
      constructorTypesReversed[index].type,
    ) as Uint8Array;

    const typeStr = input.type === 'bytes' ? `bytes${encodedArgument.length}` : input.type;

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
