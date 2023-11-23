import fs from 'fs';
import { URL } from 'url';
import { compileString, parseCode } from '../../src/compiler.js';
import { binToHex, hexToBin, vmNumberToBigInt } from '@bitauth/libauth';

describe('Location', () => {
  it('should retrieve correct text from location', () => {
    const code = fs.readFileSync(new URL('../valid-contract-files/simple_functions.cash', import.meta.url), { encoding: 'utf-8' });
    const ast = parseCode(code);

    const f = ast.contract.functions[0];

    expect(f.location).toBeDefined();
    expect((f.location!).text(code)).toEqual('function hello(sig s, pubkey pk) {\n        require(checkSig(s, pk));\n    }');
  });

  it('kek', () => {
    const code = `
pragma cashscript ^0.9.0;

contract TransferWithTimeout(
    pubkey sender,
    pubkey recipient,
    int timeout
) {
    // Require recipient's signature to match
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    // Require timeout time to be reached and sender's signature to match
    function timeout(sig senderSig) {
      console.log(senderSig, "a", senderSig);
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
`;
    const artifact = compileString(code);
    console.log(artifact);
    // console.log(hexToBin(""), `'${binToHex(Uint8Array.from([]))}'`, vmNumberToBigInt(Uint8Array.from([])));

  });
});
