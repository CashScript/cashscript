import fs from 'fs';
import { URL } from 'url';
import { parseCode } from '../../src/compiler.js';

describe('Location', () => {
  it('should retrieve correct text from location', () => {
    const code = fs.readFileSync(new URL('../valid-contract-files/simple_functions.cash', import.meta.url), { encoding: 'utf-8' });
    const ast = parseCode(code);

    const f = ast.contract.functions[0];

    expect(f.location).toBeDefined();
    expect((f.location!).text(code)).toEqual('function hello(sig s, pubkey pk) {\n        require(checkSig(s, pk));\n    }');
  });

  it('should set the correct location points', () => {
    const code = fs.readFileSync(new URL('../valid-contract-files/simple_functions.cash', import.meta.url), { encoding: 'utf-8' });
    const ast = parseCode(code);

    const secondFunction = ast.contract.functions[1];

    expect(secondFunction.location).toBeDefined();
    expect(secondFunction.location!.start).toEqual({ line: 6, column: 4 });
    expect(secondFunction.location!.end).toEqual({ line: 8, column: 5 });

    const firstStatement = secondFunction.body.statements![0];

    expect(firstStatement.location).toBeDefined();
    expect(firstStatement.location!.start).toEqual({ line: 7, column: 8 });
    expect(firstStatement.location!.end).toEqual({ line: 7, column: 29 });
  });
});
