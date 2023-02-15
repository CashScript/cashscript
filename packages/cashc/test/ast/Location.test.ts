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
});
