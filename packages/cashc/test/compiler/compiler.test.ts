/*   Compiler.test.ts
 *
 * - This file is used to test the overall functioning of the compiler.
 * - It tests successful compilation using fixture .cash files in ../valid-contract-files.
 * - It tests compile errors using fixture .cash files in respective Error directories.
 */

import { URL } from 'url';
import { getSubdirectories, readCashFiles } from '../test-utils.js';
import * as Errors from '../../src/Errors.js';
import { compileString, parseCode } from '../../src/index.js';
import { FunctionVisibility } from '../../src/ast/Globals.js';

describe('Compiler', () => {
  describe('Successful compilation', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    readCashFiles(new URL('../valid-contract-files', import.meta.url)).forEach((file) => {
      it(`${file.fn} should succeed`, () => {
        expect(() => compileString(file.contents)).not.toThrow();
      });
    });
  });

  describe('Compilation errors', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    const errorTypes = getSubdirectories(new URL('.', import.meta.url));

    errorTypes.forEach((errorType) => {
      describe(errorType.toString(), () => {
        readCashFiles(new URL(errorType, import.meta.url)).forEach((file) => {
          it(`${file.fn} should throw ${errorType}`, () => {
            // Retrieve the correct Error constructor from the Errors.ts file
            const expectedError = Errors[errorType as keyof typeof Errors];

            if (!expectedError) throw new Error(`Invalid test configuration: error ${errorType} does not exist`);

            expect(() => compileString(file.contents)).toThrow(expectedError);
          });
        });
      });
    });
  });

  describe('Function visibility', () => {
    it('should default omitted visibility to public', () => {
      const ast = parseCode(`
contract Test() {
  function spend() {
    require(true);
  }
}
`);

      expect(ast.contract.functions[0]?.visibility).toBe(FunctionVisibility.PUBLIC);
    });

    it('should parse explicit visibility with newlines and comments', () => {
      const ast = parseCode(`
contract Test() {
  function spend(
    int value
  )
  /* public entrypoint */
  public {
    require(validate(value));
  }

  function validate(
    int value
  )
  // internal helper
  internal {
    require(value == 1);
  }
}
`);

      expect(ast.contract.functions.map((func) => func.visibility)).toEqual([
        FunctionVisibility.PUBLIC,
        FunctionVisibility.INTERNAL,
      ]);
    });

    it('should not infer visibility from underscores in names', () => {
      const artifact = compileString(`
contract Test() {
  function spend_value() {
    require(helper_value());
  }

  function helper_value() public {
    require(true);
  }
}
`);

      expect(artifact.abi.map((func) => func.name)).toEqual(['spend_value', 'helper_value']);
    });

    it('should reject duplicated visibility markers', () => {
      expect(() => compileString(`
contract Test() {
  function spend() public internal {
    require(true);
  }
}
`)).toThrow(Errors.ParseError);
    });

    it('should reject visibility before the function keyword', () => {
      expect(() => compileString(`
contract Test() {
  public function spend() {
    require(true);
  }
}
`)).toThrow(Errors.ParseError);
    });

    it('should warn when visibility is omitted', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      compileString(`
contract Test() {
  function spend() {
    require(true);
  }
}
`);

      expect(warnSpy).toHaveBeenCalledWith(
        'Warning: 1 function(s) omit visibility and default to public: spend (Line 3, Column 11).',
      );

      warnSpy.mockRestore();
    });

    it('should not warn when visibility is explicit', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      compileString(`
contract Test() {
  function spend() public {
    require(validate());
  }

  function validate() internal {
    require(true);
  }
}
`);

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('Libraries', () => {
    it('should parse top-level libraries as non-spendable helper containers', () => {
      const ast = parseCode(`
library MathHelpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`);

      expect(ast.contract.kind).toBe('library');
      expect(ast.contract.parameters).toEqual([]);
      expect(ast.contract.functions[0]?.visibility).toBe(FunctionVisibility.INTERNAL);
    });

    it('should reject compiling a top-level library to an artifact', () => {
      expect(() => compileString(`
library MathHelpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`)).toThrow(Errors.NonSpendableCompilationError);
    });

    it('should reject public functions inside a library', () => {
      expect(() => compileString(`
library BadHelpers {
  function isEven(int value) public {
    require(value % 2 == 0);
  }
}
`)).toThrow(Errors.ParseError);
    });

    it('should require internal functions inside a library', () => {
      expect(() => compileString(`
library BadHelpers {
  function isEven(int value) {
    require(value % 2 == 0);
  }
}
`)).toThrow(Errors.ParseError);
    });

    it('should compile contracts that import helper libraries', () => {
      const artifact = compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    require(Math.isEven(value));
  }
}
`, {
        sourcePath: '/contracts/main.cash',
        resolveImport: (specifier) => {
          expect(specifier).toBe('./math.cash');
          return `
library MathHelpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`;
        },
      });

      expect(artifact.abi).toEqual([
        { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
      ]);
    });

    it('should reject importing a spendable contract as a helper library', () => {
      expect(() => compileString(`
import "./other.cash" as Other;

contract UsesLibrary() {
  function spend(int value) public {
    require(Other.isEven(value));
  }
}
`, {
        sourcePath: '/contracts/main.cash',
        resolveImport: () => `
contract Other() {
  function isEven(int value) public {
    require(value % 2 == 0);
  }
}
`,
      })).toThrow(Errors.InvalidLibraryImportError);
    });

    it('should reject imported libraries with omitted visibility', () => {
      expect(() => compileString(`
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
  function isEven(int value) {
    require(value % 2 == 0);
  }
}
`,
      })).toThrow(Errors.InvalidLibraryImportError);
    });

    it('should reject imported libraries that reference non-library local functions', () => {
      expect(() => compileString(`
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
    require(check(value));
  }
}
`,
      })).toThrow(Errors.InvalidLibraryImportError);
    });

    it('should support transitive library imports', () => {
      const artifact = compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    require(Math.isEven(value));
  }
}
`, {
        sourcePath: '/contracts/main.cash',
        resolveImport: (specifier) => {
          if (specifier === './math.cash') {
            return {
              path: '/contracts/math.cash',
              source: `
import "./core.cash" as Core;

library MathHelpers {
  function isEven(int value) internal {
    require(Core.isZero(value % 2));
  }
}
`,
            };
          }

          return {
            path: '/contracts/core.cash',
            source: `
library CoreHelpers {
  function isZero(int value) internal {
    require(value == 0);
  }
}
`,
          };
        },
      });

      expect(artifact.abi).toEqual([
        { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
      ]);
    });

    it('should reject circular transitive library imports', () => {
      expect(() => compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    require(Math.isEven(value));
  }
}
`, {
        sourcePath: '/contracts/main.cash',
        resolveImport: (specifier) => {
          if (specifier === './math.cash') {
            return {
              path: '/contracts/math.cash',
              source: `
import "./core.cash" as Core;

library MathHelpers {
  function isEven(int value) internal {
    require(Core.isZero(value % 2));
  }
}
`,
            };
          }

          return {
            path: '/contracts/core.cash',
            source: `
import "./math.cash" as Math;

library CoreHelpers {
  function isZero(int value) internal {
    require(Math.isEven(value));
  }
}
`,
          };
        },
      })).toThrow(Errors.InvalidLibraryImportError);
    });

    it('should reject duplicate import aliases', () => {
      expect(() => compileString(`
import "./math.cash" as Helpers;
import "./bits.cash" as Helpers;

contract UsesLibraries() {
  function spend(int value) public {
    require(Helpers.isEven(value));
  }
}
`, {
        sourcePath: '/contracts/main.cash',
        resolveImport: () => `
library Helpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
`,
      })).toThrow(Errors.InvalidImportDirectiveError);
    });

    it('should reject calls to missing imported library functions', () => {
      expect(() => compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    require(Math.isOdd(value));
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
      })).toThrow(Errors.InvalidImportDirectiveError);
    });

    it('should reject imported libraries that attempt namespaced external helper calls', () => {
      expect(() => compileString(`
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
    require(Other.check(value));
  }
}
`,
      })).toThrow(Errors.InvalidLibraryImportError);
    });

    it('should not rewrite imported helper references inside comments or strings', () => {
      const artifact = compileString(`
import "./math.cash" as Math;

contract UsesLibrary() {
  function spend(int value) public {
    console.log("Math.isEven(value) should stay literal");
    // Math.isEven(value) should stay in the comment too
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
    });

    it('should canonicalise shared transitive libraries by resolved file identity', () => {
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

      expect(artifact.abi).toEqual([
        { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
      ]);
    });
  });
});
