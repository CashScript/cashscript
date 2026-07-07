import { AuthenticationProgramStateCommon, binToHex, encodeAuthenticationInstructions } from '@bitauth/libauth';
import { Artifact, LogEntry, RequireStatement } from '@cashscript/utils';

export interface ResolvedFrame {
  sourceMap: string;
  source: string;
  sourceName: string;
  ipOffset: number;
  requires: readonly RequireStatement[];
  logs: readonly LogEntry[];
  functionName?: string;
}

export const rootFrame = (artifact: Artifact): ResolvedFrame => ({
  sourceMap: artifact.debug?.sourceMap ?? '',
  source: artifact.source,
  sourceName: `${artifact.contractName}.cash`,
  ipOffset: artifact.constructorInputs.length,
  requires: artifact.debug?.requires ?? [],
  logs: artifact.debug?.logs ?? [],
});

export const getActiveBytecode = (step: AuthenticationProgramStateCommon): string =>
  binToHex(encodeAuthenticationInstructions(step.instructions));

export const resolveFrame = (
  artifact: Artifact,
  step: AuthenticationProgramStateCommon,
): ResolvedFrame => {
  const frames = artifact.debug?.functions ?? [];
  const activeBytecode = frames.length > 0 ? getActiveBytecode(step) : undefined;
  const frame = frames.find((candidate) => candidate.bytecode === activeBytecode);

  if (!frame) return rootFrame(artifact);

  return {
    sourceMap: frame.sourceMap,
    source: frame.source ?? artifact.source,
    sourceName: frame.sourceFile ?? `${artifact.contractName}.cash`,
    ipOffset: 0, // function bodies have no constructor-arg prefix; their ips start at 0
    requires: frame.requires,
    logs: frame.logs,
    ...(frame.sourceFile !== undefined ? { functionName: frame.name } : {}),
  };
};
