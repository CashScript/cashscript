/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import { URL } from 'url';
import { compileFile, compileString } from '../../src/index.js';
import { fixtures } from './fixtures.js';
import { Artifact, LogData, LogEntry, RequireStatement, StackItem } from '@cashscript/utils';

const stripFrameBytecodeFromLogData = (entry: LogData): LogData => {
  if (typeof entry === 'string') return entry;

  const stackItem: StackItem = {
    ip: entry.ip,
    stackIndex: entry.stackIndex,
    type: entry.type,
    ...(entry.transformations ? { transformations: entry.transformations } : {}),
  };

  return stackItem;
};

const stripFrameMetadataFromArtifact = (artifact: Artifact): Artifact => {
  if (!artifact.debug) {
    return artifact;
  }

  const debugWithoutFrames = Object.fromEntries(
    Object.entries(artifact.debug).filter(([key]) => key !== 'frames'),
  ) as typeof artifact.debug;
  const strippedDebug = {
    ...debugWithoutFrames,
    logs: artifact.debug.logs.map((log): LogEntry => ({
      ip: log.ip,
      line: log.line,
      data: log.data.map(stripFrameBytecodeFromLogData),
    })),
    requires: artifact.debug.requires.map((requireStatement): RequireStatement => ({
      ip: requireStatement.ip,
      line: requireStatement.line,
      ...(requireStatement.message ? { message: requireStatement.message } : {}),
    })),
  };

  return {
    ...artifact,
    debug: strippedDebug,
  };
};

const stripExtendedDebugMetadata = (artifact: Artifact): Artifact => {
  const strippedArtifact = stripFrameMetadataFromArtifact(artifact);
  return {
    ...strippedArtifact,
    ...(strippedArtifact.debug ? {
      debug: {
        ...strippedArtifact.debug,
        bytecode: strippedArtifact.debug.bytecode,
        sourceMap: strippedArtifact.debug.sourceMap,
        logs: strippedArtifact.debug.logs,
        requires: strippedArtifact.debug.requires,
      },
    } : {}),
  };
};

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = compileFile(new URL(`../valid-contract-files/${fixture.fn}`, import.meta.url), fixture.compilerOptions);
      expect(stripExtendedDebugMetadata(artifact)).toEqual({ ...fixture.artifact, updatedAt: expect.any(String) });
    });
  });

  it('should hide internal functions from the ABI and emit BCH function opcodes', () => {
    const artifact = compileString(`
contract InternalFunctions() {
  function spend(int x) public {
    require(isEven(x));
  }

  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).toContain('OP_DEFINE');
    expect(artifact.bytecode).toContain('OP_INVOKE');
  });

  it('should only emit OP_DEFINE for reachable internal functions', () => {
    const artifact = compileString(`
contract ReachableHelpers() {
  function spend(int x) public {
    require(doubleCheck(x));
  }

  function fallback(int x) public {
    require(isEven(x));
  }

  function doubleCheck(int value) internal {
    require(isEven(value));
  }

  function isEven(int value) internal {
    require(value % 2 == 0);
  }

  function unused(int value) internal {
    require(value == 42);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
      { name: 'fallback', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(2);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
  });

  it('should not emit BCH function opcodes for unused internal functions', () => {
    const artifact = compileString(`
contract UnusedHelpers() {
  function spend(int x) public {
    require(x == 7);
  }

  function helper(int value) internal {
    require(value == 7);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).not.toContain('OP_DEFINE');
    expect(artifact.bytecode).not.toContain('OP_INVOKE');
  });

  it('should ignore internal-only call chains that are unreachable from public entrypoints', () => {
    const artifact = compileString(`
contract DeadHelperChain() {
  function spend(int x) public {
    require(x == 7);
  }

  function helperA(int value) internal {
    require(helperB(value));
  }

  function helperB(int value) internal {
    require(value == 7);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).not.toContain('OP_DEFINE');
    expect(artifact.bytecode).not.toContain('OP_INVOKE');
    expect(artifact.compiler.target).toBeUndefined();
  });

  it('should support invoking a public function from another public function', () => {
    const artifact = compileString(`
contract PublicCalls() {
  function spend(int x) public {
    require(validate(x));
  }

  function validate(int value) public {
    require(value == 7);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
      { name: 'validate', inputs: [{ name: 'value', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(1);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
    expect(artifact.compiler.target).toBe('BCH_2026_05');
  });

  it('should treat function names literally rather than inferring visibility from underscores', () => {
    const artifact = compileString(`
contract LiteralNames() {
  function spend(int x) public {
    require(helper_check(x));
  }

  function helper_check(int value) public {
    require(value == 11);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
      { name: 'helper_check', inputs: [{ name: 'value', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(1);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
  });

  it('should reuse a shared frame when an internal helper invokes a public function', () => {
    const artifact = compileString(`
contract InternalCallsPublic() {
  function spend(int x) public {
    require(route(x));
  }

  function route(int value) internal {
    require(validate(value));
  }

  function validate(int value) public {
    require(value == 11);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
      { name: 'validate', inputs: [{ name: 'value', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(2);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
    expect(artifact.compiler.target).toBe('BCH_2026_05');
  });

  it('should reject explicit pre-2026 targets when internal-function opcodes are required', () => {
    expect(() => compileString(`
contract ExplicitLegacyTarget() {
  function spend(int x) public {
    require(isTen(x));
  }

  function isTen(int value) internal {
    require(value == 10);
  }
}
`, { target: 'BCH_2025_05' })).toThrow(/at least BCH_2026_05 is required/);
  });

  it('should allow BCH_SPEC when internal-function opcodes are required', () => {
    const artifact = compileString(`
contract SpecTarget() {
  function spend(int x) public {
    require(isTen(x));
  }

  function isTen(int value) internal {
    require(value == 10);
  }
}
`, { target: 'BCH_SPEC' });

    expect(artifact.compiler.target).toBe('BCH_SPEC');
  });

  it('should support explicit internal visibility without name decoration', () => {
    const artifact = compileString(`
contract ExplicitVisibility() {
  function spend(int x) public {
    require(checkValue(x));
  }

  function checkValue(int value) internal {
    require(value == 12);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).toContain('OP_DEFINE');
    expect(artifact.bytecode).toContain('OP_INVOKE');
  });

  it('should annotate debug metadata with frame bytecode and require locations', () => {
    const artifact = compileString(`
contract DebugMetadata() {
  function spend(int x) public {
    require(validate(x));
  }

  function validate(int value) internal {
    console.log('value:', value);
    require(value == 12, 'value must equal 12');
  }
}
`);

    expect(artifact.debug?.logs[0]?.frameBytecode).toBeDefined();
    expect((artifact.debug?.logs[0]?.data[1] as StackItem | undefined)?.frameBytecode).toBeDefined();
    const publicRequire = artifact.debug?.requires.find((requireStatement) => requireStatement.message === undefined);
    const internalRequire = artifact.debug?.requires.find((requireStatement) => (
      requireStatement.message === 'value must equal 12'
    ));

    expect(publicRequire?.frameBytecode).toBeDefined();
    expect(publicRequire?.location).toEqual({
      start: { line: 4, column: 4 },
      end: { line: 4, column: 25 },
    });
    expect(internalRequire?.frameBytecode).toBeDefined();
    expect(internalRequire?.location).toEqual({
      start: { line: 9, column: 4 },
      end: { line: 9, column: 48 },
    });
  });

  it('should lower imported library helpers to BCH function opcodes without exposing them in the ABI', () => {
    const artifact = compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    require(Math.isEven(value));
  }
}
`, {
      sourcePath: '/contracts/main.cash',
      resolveImport: () => `
library MathHelpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`,
    });

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
    ]);
    expect(artifact.bytecode).toContain('OP_DEFINE');
    expect(artifact.bytecode).toContain('OP_INVOKE');
    expect(artifact.compiler.target).toBe('BCH_2026_05');
  });

  it('should lower transitive imported library helpers without duplicating shared leaves', () => {
    const artifact = compileString(`
import "./math.cash" as Math;
import "./bits.cash" as Bits;

contract UsesLibraries() {
  function spend(int value) public {
    require(Math.isEven(value));
    require(Bits.isOdd(value + 1));
  }
}
`, {
      sourcePath: '/contracts/main.cash',
      resolveImport: (specifier) => {
        if (specifier === './math.cash') {
          return {
            path: '/contracts/math.cash',
            source: `
import "./shared.cash" as Shared;

library MathHelpers {
  function isEven(int value) internal {
    require(Shared.isParity(value, 0));
  }
}
`,
          };
        }

        if (specifier === './bits.cash') {
          return {
            path: '/contracts/bits.cash',
            source: `
import "./shared.cash" as Shared;

library BitHelpers {
  function isOdd(int value) internal {
    require(Shared.isParity(value, 1));
  }
}
`,
          };
        }

        return {
          path: '/contracts/shared.cash',
          source: `
library SharedHelpers {
  function isParity(int value, int parity) internal {
    require(value % 2 == parity);
  }
}
`,
        };
      },
    });

    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(3);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
  });

  it('should reject contracts whose helper frames would have ambiguous identical bytecode', () => {
    expect(() => compileString(`
contract AmbiguousHelpers() {
  function spendA() public {
    require(checkA());
  }

  function spendB() public {
    require(checkB());
  }

  function checkA() internal {
    require(true);
  }

  function checkB() internal {
    require(true);
  }
}
`)).toThrow(/identical helper bytecode/);
  });

  it('should support multiple imported libraries with overlapping helper names', () => {
    const artifact = compileString(`
import "./math.cash" as Math;
import "./bits.cash" as Bits;

contract UsesLibraries() {
  function spend(int value) public {
    require(Math.isEven(value));
    require(Bits.isEven(value));
  }
}
`, {
      sourcePath: '/contracts/main.cash',
      resolveImport: (specifier) => {
        if (specifier === './math.cash') {
          return `
library MathHelpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`;
        }

        return `
library BitHelpers {
  function isEven(int value) internal {
    require((value % 4) == 0 || (value % 4) == 2);
  }
}
`;
      },
    });

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(2);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
    expect(artifact.compiler.target).toBe('BCH_2026_05');
  });

  it('should emit only reachable imported helper call chains', () => {
    const artifact = compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    require(Math.isEven(value));
  }
}
`, {
      sourcePath: '/contracts/main.cash',
      resolveImport: () => `
library MathHelpers {
  function isEven(int value) internal {
    require(checkParity(value));
  }

  function checkParity(int value) internal {
    require(value % 2 == 0);
  }

  function unused(int value) internal {
    require(value == 123);
  }
}
`,
    });

    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(2);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(1);
  });
});
