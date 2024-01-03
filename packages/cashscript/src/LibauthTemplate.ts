import {
  AbiFunction, Artifact, Op, PrimitiveType, bytecodeToScript, decodeBool, decodeInt, decodeString, formatBitAuthScript,
} from '@cashscript/utils';
import {
  hash160,
  hexToBin,
  AuthenticationTemplateScenarioTransactionOutput,
  AuthenticationTemplateScenario,
  decodeTransaction,
  binToHex,
  AuthenticationTemplate,
  AuthenticationTemplateScenarioInput,
  TransactionBCH,
  authenticationTemplateToCompilerConfiguration,
  createCompiler,
  createVirtualMachineBCHCHIPs,
  binToBase64,
  utf8ToBin,
  isHex,
  AuthenticationProgramStateBCHCHIPs,
  AuthenticationProgramCommon,
  AuthenticationVirtualMachine,
  ResolvedTransactionCommon,
  AuthenticationErrorCommon,
  AuthenticationTemplateScenarioOutput,
} from '@bitauth/libauth';
import { deflate } from 'pako';
import {
  UtxoP2PKH,
  LibauthOutput,
  Utxo,
  isUtxoP2PKH,
} from '../src/interfaces.js';
import { Argument, encodeArgument as csEncodeArgument } from './Argument.js';
import SignatureTemplate from './SignatureTemplate.js';
import { Transaction } from './Transaction.js';
import { toRegExp } from './utils.js';

// all bitauth variables must be in snake case
const snakeCase = (str: string): string => (
  str
    && str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
      )!
      .map((s) => s.toLowerCase())
      .join('_')
);
const merge = (array: any): any => array.reduce(
  (prev: any, cur: any) => ({
    ...prev,
    ...{ [Object.keys(cur)[0]]: cur[Object.keys(cur)[0]] },
  }),
  {},
);

const encodeArgument = (
  argument: Argument,
  typeStr: string,
): Uint8Array | SignatureTemplate => {
  if (typeStr === PrimitiveType.INT && argument === 0n) {
    return Uint8Array.from([0]);
  }
  return csEncodeArgument(argument, typeStr);
};

// stringify version which can serialize otherwise unsupported types
export const stringify = (any: any, spaces?: number): string => JSON.stringify(
  any,
  (_, v) => {
    if (typeof v === 'bigint') {
      return `${v.toString()}`;
    }
    if (v instanceof Uint8Array) {
      return `${binToHex(v)}`;
    }
    return v;
  },
  spaces,
);

const zip = (a: any[], b: any[]): any[] => Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

const createScenarioTransaction = (libauthTransaction: TransactionBCH, csTransaction: Transaction): AuthenticationTemplateScenario['transaction'] => {
  const contract = csTransaction.contract;
  const result = ({} as AuthenticationTemplateScenario['transaction'])!;

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
    } as AuthenticationTemplateScenarioInput;
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
        token: output.token,
        valueSatoshis: Number(output.valueSatoshis),
      } as AuthenticationTemplateScenarioTransactionOutput;
    },
  );
  result.version = libauthTransaction.version;
  return result;
};

const createScenarioSourceOutputs = (csTransaction: Transaction): Array<AuthenticationTemplateScenarioOutput<true>> => {
  // only one 'slot' is allowed, otherwise {} must be used
  let inputSlotInserted = false;
  return csTransaction.inputs.map(
    (csInput) => {
      const signable = isUtxoP2PKH(csInput);
      let lockingBytecode = {} as AuthenticationTemplateScenarioOutput<true>['lockingBytecode'];
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
      } as AuthenticationTemplateScenarioOutput<true>;

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

export const buildTemplate = async ({
  transaction,
  transactionHex = undefined, // set this argument to prevent unnecessary call `transaction.build()`
}: {
  transaction: Transaction;
  transactionHex?: string;
}): Promise<AuthenticationTemplate> => {
  const contract = transaction.contract;
  const txHex = transactionHex ?? await transaction.build();

  const libauthTransaction = decodeTransaction(hexToBin(txHex));
  if (typeof libauthTransaction === 'string') {
    throw Error(libauthTransaction);
  }

  const constructorInputs = contract.artifact.constructorInputs
    .slice()
    .reverse();
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

  const formattedBytecode = contract.artifact.debug
    ? formatBitAuthScript(
      bytecodeToScript(hexToBin(contract.artifact.debug.bytecode)),
      contract.artifact.debug.sourceMap,
      contract.artifact.source,
    ).split('\n')
    : contract.artifact.bytecode.split(' ').map((asmElement) => {
      if (isHex(asmElement)) {
        return `<0x${asmElement}>`;
      }
      return asmElement;
    });

  const template = {
    $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
    description: 'Imported from cashscript',
    name: contract.artifact.contractName,
    supported: ['BCH_SPEC'],
    version: 0,
  } as AuthenticationTemplate;

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
              encodeArgument(
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
                [snakeCase(input.name)]: binToHex(
                  (arg as SignatureTemplate).privateKey,
                ),
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
              `0x${binToHex(arg)}`
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
      // locking script contains the CashScript contract parameters followed by the contract opcodes
      // we output these values as pushdata, comment will contain the type and the value of the variable
      // example: '<timeout> // int = <0xa08601>'
      script: [
        `// "${contract.artifact.contractName}" contract constructor parameters`,
        ...(constructorInputs.length
          ? constructorInputs.map((input, index) => {
            const encoded = encodeArgument(
              contractParameters[index],
              constructorInputs[index].type,
            ) as Uint8Array;
            return `<${snakeCase(input.name)}> // ${
              input.type === 'bytes' ? `bytes${encoded.length}` : input.type
            } = <${`0x${binToHex(encoded)}`}>`;
          })
          : ['// none']),
        '',
        '// bytecode',
        ...formattedBytecode,
      ].join('\n'),
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

export const getBitauthUri = (template: AuthenticationTemplate): string => {
  const base64toBase64Url = (base64: string): string => base64.replace(/\+/g, '-').replace(/\//g, '_');
  const payload = base64toBase64Url(
    binToBase64(deflate(utf8ToBin(stringify(template)))),
  );
  return `https://ide.bitauth.com/import-template/${payload}`;
};

type VM = AuthenticationVirtualMachine<
ResolvedTransactionCommon,
AuthenticationProgramCommon,
AuthenticationProgramStateBCHCHIPs
>;
type Program = AuthenticationProgramCommon;
type CreateProgramResult = { vm: VM, program: Program };

// internal util. instantiates the virtual machine and compiles the template into a program
const createProgram = (template: AuthenticationTemplate): CreateProgramResult => {
  const configuration = authenticationTemplateToCompilerConfiguration(template);
  const vm = createVirtualMachineBCHCHIPs();
  const compiler = createCompiler(configuration);

  const scenarioGeneration = compiler.generateScenario({
    debug: true,
    lockingScriptId: undefined,
    unlockingScriptId: 'unlock_lock',
    scenarioId: 'evaluate_function',
  });

  if (
    typeof scenarioGeneration === 'string'
    || typeof scenarioGeneration.scenario === 'string'
  ) {
    // eslint-disable-next-line
    throw scenarioGeneration;
  }

  return { vm, program: scenarioGeneration.scenario.program };
};

// evaluates the fully defined template, throws upon error
export const evaluateTemplate = (template: AuthenticationTemplate): boolean => {
  const { vm, program } = createProgram(template);

  const verifyResult = vm.verify(program);
  if (typeof verifyResult === 'string') {
    // eslint-disable-next-line
    throw verifyResult;
  }

  return verifyResult;
};

export type DebugResult = AuthenticationProgramStateBCHCHIPs[];

// debugs the template, optionally logging the execution data
export const debugTemplate = (template: AuthenticationTemplate, artifact: Artifact): DebugResult => {
  const { vm, program } = createProgram(template);

  const debugResult = vm.debug(program);

  for (const log of artifact.debug?.logs ?? []) {
    // there might be 2 elements with same instruction pointer, first from unllocking script, second from locking
    const state = debugResult
      .filter((debugState: AuthenticationProgramStateBCHCHIPs) => debugState.ip === log.ip)!
      .slice().reverse()[0];

    if (!state) {
      throw Error(`Instruction pointer ${log.ip} points to a non-existing state of the program`);
    }

    let line = `${artifact.contractName}.cash:${log.line}`;
    log.data.forEach((element) => {
      let value: any;
      if (typeof element === 'string') {
        value = element;
      } else {
        const stackItem = state.stack.slice().reverse()[element.stackIndex];
        if (!stackItem) {
          throw Error(`Stack item at index ${element.stackIndex} not found at instruction pointer ${log.ip}`);
        }
        switch (element.type) {
          case PrimitiveType.BOOL:
            value = decodeBool(stackItem);
            break;
          case PrimitiveType.INT:
            value = decodeInt(stackItem);
            break;
          case PrimitiveType.STRING:
            value = decodeString(stackItem);
            break;
          default:
            value = `0x${binToHex(stackItem)}`;
            break;
        }
      }

      line += ` ${value}`;
    });

    // actual log, do not delete :)
    console.log(line);
  }

  const lastState = debugResult[debugResult.length - 1];
  if (lastState.error) {
    const requireMessage = (artifact.debug?.requireMessages ?? []).filter((message) => message.ip === lastState.ip)[0];
    if (requireMessage) {
      // eslint-disable-next-line
      throw `${artifact.contractName}.cash:${requireMessage.line} Error in evaluating input index ${lastState.program.inputIndex} with the following message: ${requireMessage.message}.
${lastState.error}`;
    } else {
      // eslint-disable-next-line
      throw `Error in evaluating input index ${lastState.program.inputIndex}.
${lastState.error}`;
    }
  } else {
    // one last pass of verifications not covered by the above debugging
    // checks for removed final verify
    const evaluationResult = vm.verify(program);

    if (typeof evaluationResult === 'string' && toRegExp([
      AuthenticationErrorCommon.requiresCleanStack,
      AuthenticationErrorCommon.nonEmptyControlStack,
      AuthenticationErrorCommon.unsuccessfulEvaluation,
    ]).test(evaluationResult)) {
      const stackContents = lastState.stack.map(item => `0x${binToHex(item)}`).join(', ');
      const stackContentsMessage = `\nStack contents after evaluation: ${lastState.stack.length ? stackContents : 'empty'}`;

      const lastMessage = artifact.debug?.requireMessages.sort((a, b) => b.ip - a.ip)[0];
      if (!lastMessage) {
        // eslint-disable-next-line
        throw evaluationResult + stackContentsMessage;
      }

      const instructionsLeft = lastState.instructions.slice(lastMessage.ip);
      if (instructionsLeft.length === 0
          || instructionsLeft.every(instruction => [Op.OP_NIP, Op.OP_ENDIF].includes(instruction.opcode))
      ) {
        // eslint-disable-next-line
        throw `${artifact.contractName}.cash:${lastMessage.line} Error in evaluating input index ${lastState.program.inputIndex} with the following message: ${lastMessage.message}.
${evaluationResult.replace(/Error in evaluating input index \d: /, '')}` + stackContentsMessage;
      }

      // eslint-disable-next-line
      throw evaluationResult + stackContentsMessage;
    }
  }

  return debugResult;
};
