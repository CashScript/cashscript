import {
  Artifact,
  DebugFrame,
  formatArtifact,
  getDebugFrameSource,
} from '../src/index.js';

const frame = (overrides: Partial<DebugFrame>): DebugFrame => ({
  name: 'f',
  inputs: [],
  bytecode: '',
  sourceMap: '',
  logs: [],
  requires: [],
  ...overrides,
});

describe('artifact utilities', () => {
  describe('getDebugFrameSource()', () => {
    it('should return undefined for a frame from the contract\'s own file', () => {
      expect(getDebugFrameSource({ 'lib.cash': 'lib text' }, frame({}))).toBeUndefined();
    });

    it('should read an imported frame\'s source from debug.sources', () => {
      expect(getDebugFrameSource({ 'lib.cash': 'lib text' }, frame({ sourceFile: 'lib.cash' }))).toEqual('lib text');
    });

    it('should prefer a source on the frame itself, as written by 0.14.0-next pre-releases', () => {
      const legacyFrame = frame({ sourceFile: 'lib.cash', source: 'legacy text' });
      expect(getDebugFrameSource(undefined, legacyFrame)).toEqual('legacy text');
    });
  });

  describe('formatArtifact()', () => {
    const artifact: Artifact = {
      contractName: 'Test',
      constructorInputs: [],
      abi: [],
      bytecode: 'OP_1',
      source: 'contract Test() {}',
      debug: {
        bytecode: '51',
        sourceMap: '',
        logs: [],
        requires: [],
        sources: { 'lib.cash': 'int constant A = 1;', '@scope/pkg/lib.cash': 'int constant B = 2;' },
      },
      compiler: { name: 'cashc', version: '0.14.0' },
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    it('should quote debug.sources file names as keys in TS output', () => {
      const ts = formatArtifact(artifact, 'ts');
      expect(ts).toContain('\'lib.cash\': \'int constant A = 1;\'');
      expect(ts).toContain('\'@scope/pkg/lib.cash\': \'int constant B = 2;\'');
      expect(ts).toContain('contractName: \'Test\'');
    });

    it('should round-trip debug.sources through JSON output', () => {
      expect(JSON.parse(formatArtifact(artifact, 'json')).debug.sources).toEqual(artifact.debug?.sources);
    });
  });
});
