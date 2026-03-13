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
});
