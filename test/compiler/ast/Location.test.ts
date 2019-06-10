import { assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import { Ast } from '../../../src/compiler/ast/AST';
import OutputSourceCodeTraversal from '../../../src/compiler/print/OutputSourceCodeTraversal';
import { parseCode } from '../../../src/util';
import { Location } from '../../../src/compiler/ast/Location';

function setup(input: string): Ast {
  const ast = parseCode(input);
  const traversal = new OutputSourceCodeTraversal();
  ast.accept(traversal);

  return ast;
}

describe('Location', () => {
  it('should retrieve correct text from location', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'syntax', 'success', 'simple_functions.cash'), { encoding: 'utf-8' });
    const ast = setup(code);
    const f = ast.contract.functions[0];
    assert.exists(f.location);
    assert.equal(
      (f.location as Location).text(code),
      'function hello(sig s, pubkey pk) {\n        require(checkSig(s, pk));\n    }',
    );
  });
});
