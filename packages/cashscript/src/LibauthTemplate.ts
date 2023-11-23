import { Contract } from "./Contract.js";
import { AbiFunction, Artifact, PrimitiveType, asmToScript, decodeBool, decodeInt, decodeString, formatLibauthScript } from "@cashscript/utils";
import {
  hash160,
  hexToBin,
  AuthenticationTemplateScenarioBytecode,
  AuthenticationTemplateScenarioTransactionOutput,
  AuthenticationTemplateScenario,
  AuthenticationTemplateScenarioSourceOutput,
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
} from "@bitauth/libauth";
import { deflate } from "pako";
import {
  UtxoP2PKH,
  LibauthOutput,
  Output,
  Network,
  Utxo,
  isUtxoP2PKH,
} from "../src/interfaces.js";
import { Argument, encodeArgument as csEncodeArgument } from "./Argument.js";
import SignatureTemplate from "./SignatureTemplate.js";
import { Transaction } from "./Transaction.js";

// all bitauth variables must be in snake case
function snake_case(str: string) {
  return (
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )!
      .map((s) => s.toLowerCase())
      .join("_")
  );
}
const merge = (array: any) =>
  array.reduce(
    (prev: any, cur: any) => ({
      ...prev,
      ...{ [Object.keys(cur)[0]]: cur[Object.keys(cur)[0]] },
    }),
    {}
  );

const encodeArgument = (
  argument: Argument,
  typeStr: string
): Uint8Array | SignatureTemplate => {
  if (typeStr === PrimitiveType.INT && argument === 0n) {
    return Uint8Array.from([0]);
  }
  return csEncodeArgument(argument, typeStr);
};

// stringify version which can serialize otherwise unsupported types
export const stringify = (any: any, spaces?: number) =>
  JSON.stringify(
    any,
    (_, v) => {
      if (typeof v === "bigint") {
        return `${v.toString()}`;
      }
      if (v instanceof Uint8Array) {
        return `${binToHex(v)}`;
      }
      return v;
    },
    spaces
  );

export const buildTemplate = async ({
  contract,
  transaction,
  transactionHex = undefined,
  manglePrivateKeys,
  includeSource = false,
}: {
  contract: Contract;
  transaction: Transaction;
  transactionHex?: string;
  manglePrivateKeys?: boolean;
  includeSource?: boolean;
}): Promise<AuthenticationTemplate> => {
  if (manglePrivateKeys === undefined && contract.provider.network !== Network.REGTEST) {
    manglePrivateKeys = true;
  } else {
    manglePrivateKeys = false;
  }

  const txHex = transactionHex ?? await transaction.build();

  const libauthTransaction = decodeTransaction(hexToBin(txHex));
  if (typeof libauthTransaction === "string") {
    throw libauthTransaction;
  }

  const constructorInputs = contract.artifact.constructorInputs
    .slice()
    .reverse();
  const contractParameters = contract.constructorArgs.slice().reverse();

  const abiFunction = (transaction as any).abiFunction as AbiFunction;
  const funcName = abiFunction.name;
  const functionIndex = contract.artifact.abi.findIndex(
    (val) => val.name === funcName
  )!;
  const func: AbiFunction = contract.artifact.abi[functionIndex];
  const functionInputs = func.inputs.slice().reverse();
  const args = ((transaction as any).args as (Uint8Array | SignatureTemplate)[])
    .slice()
    .reverse();

  const hasSignatureTemplates = ((transaction as any).inputs as Utxo[]).filter(
    (val) => isUtxoP2PKH(val)
  ).length;

  const zip = (a: any[], b: any[]) =>
    Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

  const formattedBytecode = 
    contract.artifact.debug ?
      formatLibauthScript(asmToScript(contract.artifact.debug.bytecode), contract.artifact.debug?.sourceMap!, contract.artifact.source).split("\n") :
      contract.artifact.bytecode.split(" ").map((val) => {
        try {
          return `<0x${BigInt("0x" + val).toString(16)}>`;
        } catch {
          return val;
        }
      });

  return {
    $schema: "https://ide.bitauth.com/authentication-template-v0.schema.json",
    description: `Imported from cashscript${
      includeSource ? contract.artifact.source : ""
    }`,
    name: contract.artifact.contractName,
    entities: {
      parameters: {
        description: "Contract creation and function parameters",
        name: "parameters",
        scripts: [
          "lock",
          "unlock_lock",
          ...(hasSignatureTemplates
            ? ["p2pkh_placeholder_lock", "p2pkh_placeholder_unlock"]
            : []),
        ],
        variables: merge([
          ...(hasSignatureTemplates
            ? [
                {
                  placeholder_key: {
                    description: "placeholder_key",
                    name: "placeholder_key",
                    type: "Key",
                  },
                },
              ]
            : []),
          {
            function_index: {
              description: "Script function index to execute",
              name: "function_index",
              type: "WalletData",
            },
          },
          ...constructorInputs.map((input) => ({
            [snake_case(input.name)]: {
              description: `"${input.name}" parameter of this contract`,
              name: input.name,
              type: "WalletData",
            },
          })),
          ...functionInputs.map((input) => ({
            [snake_case(input.name)]: {
              description: `"${input.name}" parameter of function "${func.name}"`,
              name: input.name,
              type: input.type === PrimitiveType.SIG ? "Key" : "WalletData",
            },
          })),
        ]),
      },
    },
    scenarios: {
      evaluate_function: {
        data: {
          bytecode: merge([
            ...zip(functionInputs, args)
              .filter(([input]) => input.type !== PrimitiveType.SIG)
              .map(([input, arg]) => {
                const hex = binToHex(arg as Uint8Array);
                const result = hex.length ? `0x${hex}` : hex;
                return {
                  [snake_case(input.name)]: result,
                };
              }),
            { function_index: functionIndex.toString() },
            ...constructorInputs.map((input, index) => {
              const hex = binToHex(
                encodeArgument(
                  contractParameters[index],
                  constructorInputs[index].type
                ) as Uint8Array
              );
              const result = hex.length ? `0x${hex}` : hex;
              return {
                [snake_case(input.name)]: result,
              };
            }),
          ]),
          currentBlockHeight: 2,
          currentBlockTime: Math.round(+new Date() / 1000),
          keys: {
            privateKeys: merge([
              ...(hasSignatureTemplates
                ? [
                    {
                      placeholder_key:
                        "<Uint8Array: 0x0000000000000000000000000000000000000000000000000000000000000000>",
                    },
                  ]
                : []),
              ...zip(functionInputs, args)
                .filter(([input]) => input.type === PrimitiveType.SIG)
                .map(([input, arg]) => {
                  return {
                    [snake_case(input.name)]: binToHex(
                      manglePrivateKeys
                        ? (arg as SignatureTemplate)
                            .getPublicKey()
                            .slice(0, 32)
                            .slice(0, 32)
                        : (arg as SignatureTemplate | any).privateKey
                    ),
                  };
                }),
            ]),
          },
        },
        transaction: [libauthTransaction].map((val: TransactionBCH) => {
          const result = {} as AuthenticationTemplateScenario["transaction"];
          let inputSlotInserted = false;
          result!.inputs = val!.inputs!.map((input, index) => {
            const csInput = (transaction as any).inputs[index] as Utxo;
            const signable = isUtxoP2PKH(csInput);
            let unlockingBytecode = {};
            if (signable) {
              unlockingBytecode = {
                script: "p2pkh_placeholder_unlock",
                overrides: {
                  keys: {
                    privateKeys: {
                      placeholder_key: binToHex(
                        manglePrivateKeys
                          ? (csInput as UtxoP2PKH).template
                              .getPublicKey()
                              .slice(0, 32)
                          : ((csInput as UtxoP2PKH).template as any)
                              .privateKey
                      ),
                    },
                  },
                },
              };
            } else {
              // assume it is our contract's input
              if (!inputSlotInserted) {
                unlockingBytecode = ["slot"];
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
              unlockingBytecode: unlockingBytecode,
            } as AuthenticationTemplateScenarioInput;
          });
          result!.locktime = val?.locktime;

          result!.outputs = val?.outputs?.map(
            (output: LibauthOutput, index) => {
              const csOutput = (transaction as any).outputs[index] as Output;
              let lockingBytecode: any = output.lockingBytecode;
              if (typeof csOutput.to === "string") {
                if (
                  [
                    contract.address,
                    contract.tokenAddress,
                  ].includes(csOutput.to)
                ) {
                  lockingBytecode = {};
                } else {
                  for (const csInput of (transaction as any).inputs as Utxo[]) {
                    if (isUtxoP2PKH(csInput)) {
                      const inputPkh = hash160(csInput.template.getPublicKey());
                      if (
                        binToHex(output.lockingBytecode).slice(6, 46) ===
                        binToHex(inputPkh)
                      ) {
                        lockingBytecode = {
                          script: "p2pkh_placeholder_lock",
                          overrides: {
                            keys: {
                              privateKeys: {
                                placeholder_key: binToHex(
                                  manglePrivateKeys
                                    ? csInput.template
                                        .getPublicKey()
                                        .slice(0, 32)
                                    : (csInput.template as any).privateKey
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
            }
          );
          result!.version = libauthTransaction.version;
          return result;
        })[0] as AuthenticationTemplateScenario["transaction"],
        sourceOutputs: [transaction].map((val: Transaction) => {
          let inputSlotInserted = false;
          return ((val as any).inputs as Utxo[]).map(
          (_, index) => {
            const result = {} as
              | AuthenticationTemplateScenarioSourceOutput
              | any;
            const csInput = (transaction as any).inputs[index] as Utxo;
            const signable = isUtxoP2PKH(csInput);
            let unlockingBytecode = {};
            if (signable) {
              unlockingBytecode = {
                script: "p2pkh_placeholder_lock",
                overrides: {
                  keys: {
                    privateKeys: {
                      placeholder_key: binToHex(
                        manglePrivateKeys
                          ? csInput.template.getPublicKey().slice(0, 32)
                          : (csInput.template as any).privateKey
                      ),
                    },
                  },
                },
              } as AuthenticationTemplateScenarioBytecode;
            } else {
              // assume it is our contract's input
              if (!inputSlotInserted) {
                unlockingBytecode = ["slot"];
                inputSlotInserted = true;
              }
            }

            result.lockingBytecode = unlockingBytecode;
            result.valueSatoshis = Number(csInput.satoshis);
            result.token = csInput.token;
            return result;
          });
        })[0],
        description:
          "An example evaluation where this script execution passes.",
        name: "Evaluate",
      },
    },
    scripts: {
      unlock_lock: {
        passes: ["evaluate_function"],
        name: "unlock",
        script: [
          `// "${func.name}" function parameters`,
          ...(functionInputs.length
            ? zip(functionInputs, args).map(([input, arg]) =>
                input.type === PrimitiveType.SIG
                  ? `<${snake_case(
                      input.name
                    )}.schnorr_signature.all_outputs> // ${input.type}`
                  : `<${snake_case(input.name)}> // ${input.type} = <${
                      "0x" + binToHex(arg)
                    }>`
              )
            : ["// none"]),
          "",

          ...(contract.artifact.abi.length > 1
            ? [
                "// function index in contract",
                `<function_index> // int = <${functionIndex.toString()}>`,
                "",
              ]
            : []),
        ].join("\n"),
        unlocks: "lock",
      },
      lock: {
        lockingType: "p2sh20",
        name: "lock",
        script: [
          `// "${contract.artifact.contractName}" contract constructor parameters`,
          ...(constructorInputs.length
            ? constructorInputs.map((input, index) => {
                const encoded = encodeArgument(
                  contractParameters[index],
                  constructorInputs[index].type
                ) as Uint8Array;
                return `<${snake_case(input.name)}> // ${
                  input.type === "bytes" ? "bytes" + encoded.length : input.type
                } = <${"0x" + binToHex(encoded)}>`;
              })
            : ["// none"]),
          "",
          "// bytecode",
          ...formattedBytecode,
        ].join("\n"),
      },
      ...(hasSignatureTemplates
        ? {
            p2pkh_placeholder_unlock: {
              name: "p2pkh_placeholder_unlock",
              script:
                "<placeholder_key.schnorr_signature.all_outputs>\n<placeholder_key.public_key>",
              unlocks: "p2pkh_placeholder_lock",
            },
            p2pkh_placeholder_lock: {
              lockingType: "standard",
              name: "p2pkh_placeholder_lock",
              script:
                "OP_DUP\nOP_HASH160 <$(<placeholder_key.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG",
            },
          }
        : {}),
    },
    supported: ["BCH_SPEC"],
    version: 0,
  } as AuthenticationTemplate;
};

export const getBitauthUri = (template: AuthenticationTemplate) => {
  const base64toBase64Url = (base64: string) =>
    base64.replace(/\+/g, "-").replace(/\//g, "_");
  const payload = base64toBase64Url(
    binToBase64(deflate(utf8ToBin(stringify(template))))
  );
  return `https://ide.bitauth.com/import-template/${payload}`;
};

// internal util. instantiates the virtual machine and compiles the template into a program
const createProgram = (template: AuthenticationTemplate) => {
  const configuration = authenticationTemplateToCompilerConfiguration(template);
  const vm = createVirtualMachineBCHCHIPs();
  const compiler = createCompiler(configuration);

  const scenarioGeneration = compiler.generateScenario({
    debug: true,
    lockingScriptId: undefined,
    unlockingScriptId: "unlock_lock",
    scenarioId: "evaluate_function",
  });

  if (
    typeof scenarioGeneration === "string" ||
    typeof scenarioGeneration.scenario === "string"
  ) {
    throw scenarioGeneration;
  }

  return { vm, program: scenarioGeneration.scenario.program };
}

// evaluates the fully defined template, throws upon error
export const evaluateTemplate = (template: AuthenticationTemplate) => {
  const { vm, program } = createProgram(template);

  const verifyResult = vm.verify(program);
  if (typeof verifyResult === "string") {
    throw verifyResult;
  }

  return verifyResult;
};

// debugs the template, optionally logging the execution data
export const debugTemplate = (template: AuthenticationTemplate, artifact: Artifact) => {
  const { vm, program } = createProgram(template);

  const debugResult = vm.debug(program);

  for (const log of artifact.debug?.logs ?? []) {
    const state = debugResult.find(state => state.ip === log.ip)!;

    let line = `${artifact.contractName}.cash:${log.line}`
    log.data.forEach(element => {
      let value: any;
      if (typeof element === "string") {
        value = element;
      } else {
        const stackItem = state.stack.slice().reverse()[element.stackIndex];
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
  }

  const lastState = debugResult[debugResult.length - 1];
  if (lastState.error) {
    const requireMessage = (artifact.debug?.requireMessages ?? []).filter(message => message.ip === lastState.ip)[0];
    if (requireMessage) {
      throw `${artifact.contractName}.cash:${requireMessage.line} Error in evaluating input index ${lastState.program.inputIndex} with the following message: ${requireMessage.message}.
${lastState.error}`;
    } else {
      throw `Error in evaluating input index ${lastState.program.inputIndex}.
${lastState.error}`;
    }
  }

  return debugResult;
};

