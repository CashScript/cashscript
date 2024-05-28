import { AuthenticationErrorCommon, AuthenticationInstruction, AuthenticationProgramCommon, AuthenticationProgramStateBCHCHIPs, AuthenticationVirtualMachine, ResolvedTransactionCommon, WalletTemplate, binToHex, createCompiler, createVirtualMachineBCHCHIPs, walletTemplateToCompilerConfiguration } from '@bitauth/libauth';
import { Artifact, LogData, LogEntry, Op, PrimitiveType, decodeBool, decodeInt, decodeString } from '@cashscript/utils';
import { findLastIndex, toRegExp } from './utils.js';

// evaluates the fully defined template, throws upon error
export const evaluateTemplate = (template: WalletTemplate): boolean => {
  const { vm, program } = createProgram(template);

  const verifyResult = vm.verify(program);
  if (typeof verifyResult === 'string') {
    throw new Error(verifyResult);
  }

  return verifyResult;
};

export type DebugResult = AuthenticationProgramStateBCHCHIPs[];

// debugs the template, optionally logging the execution data
export const debugTemplate = (template: WalletTemplate, artifact: Artifact): DebugResult => {
  const { vm, program } = createProgram(template);

  const fullDebugSteps = vm.debug(program);

  // P2SH executions have 3 phases, we only want the last one (locking script execution)
  // https://libauth.org/types/AuthenticationVirtualMachine.html#__type.debug
  const lockingScriptDebugResult = fullDebugSteps.slice(findLastIndex(fullDebugSteps, (state) => state.ip === 0));

  // The controlStack determines whether the current debug step is in the executed branch
  // https://libauth.org/types/AuthenticationProgramStateControlStack.html
  const executedDebugSteps = lockingScriptDebugResult
    .filter((debugStep) => debugStep.controlStack.every(item => item === true));

  const executedLogs = (artifact.debug?.logs ?? [])
    .filter((debugStep) => executedDebugSteps.some((log) => log.ip === debugStep.ip));

  for (const log of executedLogs) {
    const correspondingDebugStep = executedDebugSteps.find((debugStep) => debugStep.ip === log.ip)!;
    logConsoleLogStatement(log, correspondingDebugStep, artifact);
  }

  const lastExecutedDebugStep = executedDebugSteps[executedDebugSteps.length - 1];

  // If an error is present in the last step, that means a require statement in the middle of the function failed
  if (lastExecutedDebugStep.error) {
    const isNullFail = lastExecutedDebugStep.error === AuthenticationErrorCommon.nonNullSignatureFailure;
    const messageIp = lastExecutedDebugStep.ip + (isNullFail ? 1 : 0);

    const requireStatement = (artifact.debug?.requireMessages ?? [])
      .find((message) => message.ip === messageIp);

    if (requireStatement) {
      throw new Error(`${artifact.contractName}.cash:${requireStatement.line} Error in evaluating input index ${lastExecutedDebugStep.program.inputIndex} with the following message: ${requireStatement.message}.\n${lastExecutedDebugStep.error}`);
    }

    throw new Error(`Error in evaluating input index ${lastExecutedDebugStep.program.inputIndex}.\n${lastExecutedDebugStep.error}`);
  }

  const evaluationResult = vm.verify(program);

  if (failedFinalVerify(evaluationResult)) {
    const stackContents = lastExecutedDebugStep.stack.map(item => `0x${binToHex(item)}`).join(', ');
    const stackContentsMessage = `\nStack contents after evaluation: ${lastExecutedDebugStep.stack.length ? stackContents : 'empty'}`;

    const executedInstructions = lastExecutedDebugStep.instructions
      .filter((_, i) => executedDebugSteps.map((step) => step.ip).includes(i));

    const cleanupSize = calculateCleanupSize(executedInstructions);
    const finalExecutedVerify = executedDebugSteps[executedDebugSteps.length - cleanupSize - 1];

    const finalVerifyMessage = artifact.debug?.requireMessages.find((message) => message.ip === finalExecutedVerify.ip);

    if (finalVerifyMessage) {
      throw new Error(`${artifact.contractName}.cash:${finalVerifyMessage.line} Error in evaluating input index ${lastExecutedDebugStep.program.inputIndex} with the following message: ${finalVerifyMessage.message}.\n${evaluationResult.replace(/Error in evaluating input index \d: /, '')}` + stackContentsMessage);
    }

    throw new Error(evaluationResult + stackContentsMessage);
  }

  return fullDebugSteps;
};

type VM = AuthenticationVirtualMachine<
ResolvedTransactionCommon,
AuthenticationProgramCommon,
AuthenticationProgramStateBCHCHIPs
>;
type Program = AuthenticationProgramCommon;
type CreateProgramResult = { vm: VM, program: Program };

// internal util. instantiates the virtual machine and compiles the template into a program
const createProgram = (template: WalletTemplate): CreateProgramResult => {
  const configuration = walletTemplateToCompilerConfiguration(template);
  // TODO: We disabled standardness checks due to an issue with Libauth (https://github.com/bitauth/libauth/issues/133).
  // We should re-enable this once the issue is resolved.
  const vm = createVirtualMachineBCHCHIPs(false);
  const compiler = createCompiler(configuration);

  const scenarioGeneration = compiler.generateScenario({
    debug: true,
    lockingScriptId: undefined,
    unlockingScriptId: 'unlock_lock',
    scenarioId: 'evaluate_function',
  });

  if (typeof scenarioGeneration === 'string') {
    throw new Error(scenarioGeneration);
  }

  if (typeof scenarioGeneration.scenario === 'string') {
    throw new Error(scenarioGeneration.scenario);
  }

  return { vm, program: scenarioGeneration.scenario.program };
};

const logConsoleLogStatement = (
  log: LogEntry,
  debugStep: AuthenticationProgramStateBCHCHIPs,
  artifact: Artifact,
): void => {
  let line = `${artifact.contractName}.cash:${log.line}`;
  const decodedData = log.data.map((element) => decodeLogData(element, debugStep.stack, log.ip));
  console.log(`${line} ${decodedData.join(' ')}`);
};

const decodeLogData = (element: LogData, stack: Uint8Array[], ip: number): any => {
  if (typeof element === 'string') return element;

  // Reversed since stack is in reverse order
  const stackItem = [...stack].reverse()[element.stackIndex];

  if (!stackItem) {
    throw Error(`Stack item at index ${element.stackIndex} not found at instruction pointer ${ip}`);
  }

  if (element.type === PrimitiveType.BOOL) return decodeBool(stackItem);
  if (element.type === PrimitiveType.INT) return decodeInt(stackItem);
  if (element.type === PrimitiveType.STRING) return decodeString(stackItem);

  return `0x${binToHex(stackItem)}`;
};

const failedFinalVerify = (evaluationResult: string | true): evaluationResult is string => {
  // true indicates a successful evaluation (so no failed final verify)
  if (evaluationResult === true) return false;

  // If any of the following errors occurred, then the final verify failed - any other messages
  // indicate other kinds of failures
  return toRegExp([
    AuthenticationErrorCommon.requiresCleanStack,
    AuthenticationErrorCommon.nonEmptyControlStack,
    AuthenticationErrorCommon.unsuccessfulEvaluation,
  ]).test(evaluationResult);
};

const calculateCleanupSize = (instructions: AuthenticationInstruction[]): number => {
  // OP_NIP is used for cleanup at the end of a function, OP_ENDIF and OP_ELSE are the end of branches
  // We need to remove all of these to get to the actual last executed instruction of a function
  const cleanupOpcodes = [Op.OP_ENDIF, Op.OP_NIP, Op.OP_ELSE];

  let cleanupSize = 0;
  for (const instruction of [...instructions].reverse()) {
    if (cleanupOpcodes.includes(instruction.opcode)) {
      cleanupSize++;
    } else {
      break;
    }
  }

  return cleanupSize;
};
