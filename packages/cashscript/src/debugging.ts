import { AuthenticationErrorCommon, AuthenticationInstruction, AuthenticationProgramCommon, AuthenticationProgramStateCommon, AuthenticationVirtualMachine, ResolvedTransactionCommon, WalletTemplate, WalletTemplateScriptUnlocking, binToHex, createCompiler, createVirtualMachineBch2025, encodeAuthenticationInstruction, walletTemplateToCompilerConfiguration } from '@bitauth/libauth';
import { Artifact, LogEntry, Op, PrimitiveType, StackItem, bytecodeToAsm, decodeBool, decodeInt, decodeString } from '@cashscript/utils';
import { findLastIndex, toRegExp } from './utils.js';
import { FailedRequireError, FailedTransactionError, FailedTransactionEvaluationError } from './Errors.js';
import { getBitauthUri } from './LibauthTemplate.js';

export type DebugResult = AuthenticationProgramStateCommon[];
export type DebugResults = Record<string, DebugResult>;

// debugs the template, optionally logging the execution data
export const debugTemplate = (template: WalletTemplate, artifacts: Artifact[]): DebugResults => {
  const results: DebugResults = {};
  const unlockingScriptIds = Object.keys(template.scripts).filter((key) => 'unlocks' in template.scripts[key]);

  for (const unlockingScriptId of unlockingScriptIds) {
    const scenarioIds = (template.scripts[unlockingScriptId] as WalletTemplateScriptUnlocking).passes ?? [];
    // There are no scenarios defined for P2PKH placeholder scripts, so we skip them
    if (scenarioIds.length === 0) continue;

    const matchingArtifact = artifacts.find((artifact) => unlockingScriptId.startsWith(artifact.contractName));

    if (!matchingArtifact) {
      throw new Error(`No artifact found for unlocking script ${unlockingScriptId}`);
    }

    for (const scenarioId of scenarioIds) {
      results[`${unlockingScriptId}.${scenarioId}`] = debugSingleScenario(template, matchingArtifact, unlockingScriptId, scenarioId);
    }
  }

  verifyFullTransaction(template);

  return results;
};

const debugSingleScenario = (
  template: WalletTemplate, artifact: Artifact, unlockingScriptId: string, scenarioId: string,
): DebugResult => {
  const { vm, program } = createProgram(template, unlockingScriptId, scenarioId);

  const fullDebugSteps = vm.debug(program);

  // P2SH executions have 3 phases, we only want the last one (locking script execution)
  // https://libauth.org/types/AuthenticationVirtualMachine.html#__type.debug
  const lockingScriptDebugResult = fullDebugSteps.slice(findLastIndex(fullDebugSteps, (state) => state.ip === 0));

  // The controlStack determines whether the current debug step is in the executed branch
  // https://libauth.org/types/AuthenticationProgramStateControlStack.html
  const executedDebugSteps = lockingScriptDebugResult
    .filter((debugStep) => debugStep.controlStack.every(item => item === true));

  const executedLogs = (artifact.debug?.logs ?? [])
    .filter((log) => executedDebugSteps.some((debugStep) => log.ip === debugStep.ip));

  for (const log of executedLogs) {
    logConsoleLogStatement(log, executedDebugSteps, artifact);
  }

  const lastExecutedDebugStep = executedDebugSteps[executedDebugSteps.length - 1];

  // If an error is present in the last step, that means a require statement in the middle of the function failed
  if (lastExecutedDebugStep.error) {
    // In Libauth any thrown error gets registered in the instruction that happens right *after* the instruction that
    // caused the error (in other words the OP_VERIFY). We need to decrement the instruction pointer to get the correct
    // failing instruction.
    const failingIp = lastExecutedDebugStep.ip - 1;
    const failingInstruction = lastExecutedDebugStep.instructions[failingIp];

    // With optimisations, the OP_CHECKSIG and OP_VERIFY instructions are merged into a single opcode (OP_CHECKSIGVERIFY).
    // However, for the final verify, the OP_VERIFY is not present. In most cases, the implicit final VERIFY is checked
    // later in the code. However, for NULLFAIL, the error is thrown in the OP_CHECKSIG opcode, rather than in the
    // implicit final VERIFY. The error message is registered in the next instruction, so we need to increment the
    // instruction pointer to get the correct error message from the require messages in the artifact.
    // Note that we do NOT use this adjusted IP when passing the failing IP into the FailedRequireError.
    const isNullFail = lastExecutedDebugStep.error.includes(AuthenticationErrorCommon.nonNullSignatureFailure);
    const requireStatementIp = failingIp + (isNullFail && isSignatureCheckWithoutVerify(failingInstruction) ? 1 : 0);

    const requireStatement = (artifact.debug?.requires ?? [])
      .find((statement) => statement.ip === requireStatementIp);

    const { program: { inputIndex }, error } = lastExecutedDebugStep;

    if (requireStatement) {
      // Note that we use failingIp here rather than requireStatementIp, see comment above
      throw new FailedRequireError(
        artifact, failingIp, requireStatement, inputIndex, getBitauthUri(template), error,
      );
    }

    // Note that we use failingIp here rather than requireStatementIp, see comment above
    throw new FailedTransactionEvaluationError(
      artifact, failingIp, inputIndex, getBitauthUri(template), error,
    );
  }

  // Evaluate the final program state to see if it evaluated successfully
  const evaluationResult = vm.stateSuccess(lastExecutedDebugStep);

  // Check if the evaluation failed matches any of the possible failure cases
  if (failedFinalVerify(evaluationResult)) {
    const finalExecutedVerifyIp = getFinalExecutedVerifyIp(executedDebugSteps);

    // The final executed verify instruction points to the "implicit" VERIFY that is added at the end of the script.
    // This instruction does not exist in the sourcemap, so we need to decrement the instruction pointer to get the
    // actual final executed statement (which is *not* the require statement, but the evaluation within)
    const sourcemapInstructionPointer = finalExecutedVerifyIp - 1;

    // logDebugSteps(executedDebugSteps, lastExecutedDebugStep.instructions);
    // console.warn('message', finalExecutedVerifyIp);
    // console.warn(artifact.debug?.requires);

    const requireStatement = (artifact.debug?.requires ?? [])
      .find((message) => message.ip === finalExecutedVerifyIp);

    const { program: { inputIndex } } = lastExecutedDebugStep;

    if (requireStatement) {
      throw new FailedRequireError(
        artifact, sourcemapInstructionPointer, requireStatement, inputIndex, getBitauthUri(template),
      );
    }

    throw new FailedTransactionEvaluationError(
      artifact, sourcemapInstructionPointer, inputIndex, getBitauthUri(template), evaluationResult,
    );
  }

  return fullDebugSteps;
};

/* eslint-disable @typescript-eslint/indent */
type VM = AuthenticationVirtualMachine<
  ResolvedTransactionCommon,
  AuthenticationProgramCommon,
  AuthenticationProgramStateCommon
>;
/* eslint-enable @typescript-eslint/indent */

type Program = AuthenticationProgramCommon;
type CreateProgramResult = { vm: VM, program: Program };

// internal util. instantiates the virtual machine and compiles the template into a program
const createProgram = (template: WalletTemplate, unlockingScriptId: string, scenarioId: string): CreateProgramResult => {
  const configuration = walletTemplateToCompilerConfiguration(template);
  const vm = createVirtualMachineBch2025();
  const compiler = createCompiler(configuration);

  if (!template.scripts[unlockingScriptId]) {
    throw new Error(`No unlock script found in template for ID ${unlockingScriptId}`);
  }

  if (!template.scenarios?.[scenarioId]) {
    throw new Error(`No scenario found in template for ID ${scenarioId}`);
  }

  const scenarioGeneration = compiler.generateScenario({
    debug: true,
    unlockingScriptId,
    scenarioId,
  });

  if (typeof scenarioGeneration === 'string') {
    throw new FailedTransactionError(scenarioGeneration, getBitauthUri(template));
  }

  if (typeof scenarioGeneration.scenario === 'string') {
    throw new FailedTransactionError(scenarioGeneration.scenario, getBitauthUri(template));
  }

  return { vm, program: scenarioGeneration.scenario.program };
};

const logConsoleLogStatement = (
  log: LogEntry,
  debugSteps: AuthenticationProgramStateCommon[],
  artifact: Artifact,
): void => {
  let line = `${artifact.contractName}.cash:${log.line}`;
  const decodedData = log.data.map((element) => {
    if (typeof element === 'string') return element;

    const debugStep = debugSteps.find((step) => step.ip === element.ip)!;
    return decodeStackItem(element, debugStep.stack);
  });
  console.log(`${line} ${decodedData.join(' ')}`);
};

const decodeStackItem = (element: StackItem, stack: Uint8Array[]): any => {
  // Reversed since stack is in reverse order
  const stackItem = [...stack].reverse()[element.stackIndex];

  if (!stackItem) {
    throw Error(`Stack item at index ${element.stackIndex} not found at instruction pointer ${element.ip}`);
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
    // TODO: Ask Jason to put these back into an enum and replace with the enum value
    'The CashAssembly internal evaluation completed with an unexpected number of items on the stack (must be exactly 1).', // AuthenticationErrorCommon.requiresCleanStack,
    'The CashAssembly internal evaluation completed with a non-empty control stack.', // AuthenticationErrorCommon.nonEmptyControlStack,
    AuthenticationErrorCommon.unsuccessfulEvaluation,
  ]).test(evaluationResult);
};

const calculateCleanupSize = (instructions: Array<AuthenticationInstruction | undefined>): number => {
  // OP_NIP (or OP_DROP/OP_2DROP in optimised bytecode) is used for cleanup at the end of a function,
  // OP_ENDIF and OP_ELSE are the end of branches. We need to remove all of these to get to the actual last
  // executed instruction of a function
  // TODO: What about OP_1??
  const cleanupOpcodes = [Op.OP_ENDIF, Op.OP_NIP, Op.OP_ELSE, Op.OP_DROP, Op.OP_2DROP];

  let cleanupSize = 0;
  for (const instruction of [...instructions].reverse()) {
    // The instructions array may contain undefined elements for the final executed debug steps that are not
    // technically instructions (e.g. the final *implicit* verify). We still want to get rid of these in the cleanup
    if (!instruction || cleanupOpcodes.includes(instruction.opcode)) {
      cleanupSize++;
    } else {
      break;
    }
  }

  return cleanupSize;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logDebugSteps = (
  debugSteps: AuthenticationProgramStateCommon[],
  instructions: AuthenticationInstruction[],
): void => {
  debugSteps.map((step) => {
    const opcode = instructions[step.ip] ? bytecodeToAsm(encodeAuthenticationInstruction(instructions[step.ip])) : 'null';
    console.warn(step.ip, opcode, step.stack, step.error);
  });
};

const getFinalExecutedVerifyIp = (executedDebugSteps: AuthenticationProgramStateCommon[]): number => {
  // Map every executed debug step to its corresponding instruction
  // (note that the last executed step(s) may not have a corresponding instruction and will be `undefined`)
  const executedInstructions = executedDebugSteps.map((step) => step.instructions[step.ip]);

  const finalExecutedDebugStepIndex = executedDebugSteps.length - 1;
  const cleanupSize = calculateCleanupSize(executedInstructions);
  const finalExecutedNonCleanupStep = executedDebugSteps[finalExecutedDebugStepIndex - cleanupSize];

  // The final verify in a function is dropped, so after cleanup, we get the final OP that was executed *before* the
  // final verify, so we need to add one to get the actual final verify instruction
  const finalExecutedVerifyIp = finalExecutedNonCleanupStep.ip + 1;
  return finalExecutedVerifyIp;
};

// After debugging, we want to verify the full transaction to ensure it is valid (this catches any errors that are not
// necessarily script errors)
const verifyFullTransaction = (template: WalletTemplate): void => {
  const placeholderScriptId = Object.keys(template.scripts).find((key) => 'unlocks' in template.scripts[key]);
  const placeholderScenarioId = (template.scripts[placeholderScriptId ?? ''] as WalletTemplateScriptUnlocking)?.passes?.[0];

  if (!placeholderScenarioId || !placeholderScriptId) {
    throw new Error('No placeholder scenario ID or script ID found');
  }

  const { vm, program } = createProgram(template, placeholderScriptId, placeholderScenarioId);

  const verificationResult = vm.verify({
    sourceOutputs: program.sourceOutputs,
    transaction: program.transaction,
  });

  if (typeof verificationResult === 'string') {
    throw new FailedTransactionError(verificationResult, getBitauthUri(template));
  }
};

const isSignatureCheckWithoutVerify = (instruction: AuthenticationInstruction): boolean => {
  return [Op.OP_CHECKSIG, Op.OP_CHECKMULTISIG, Op.OP_CHECKDATASIG].includes(instruction.opcode);
};
