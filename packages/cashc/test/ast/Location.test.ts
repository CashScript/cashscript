import path from 'path';
import fs from 'fs';
import { parseCode } from '../../src/CashCompiler';
import { Location } from '../../src/ast/Location';

describe('Location', () => {
  it('should retrieve correct text from location', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'valid-contract-files', 'simple_functions.cash'), { encoding: 'utf-8' });
    const ast = parseCode(code);

    const f = ast.contract.functions[0];

    expect(f.location).toBeDefined();
    expect((f.location as Location).text(code)).toEqual('function hello(sig s, pubkey pk) {\n        require(checkSig(s, pk));\n    }');
  });
});
