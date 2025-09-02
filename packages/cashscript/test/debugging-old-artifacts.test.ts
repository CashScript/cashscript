import { Contract, MockNetworkProvider, randomUtxo, SignatureTemplate, TransactionBuilder } from '../src/index.js';
import { alicePkh, alicePriv, alicePub, bobPriv } from './fixture/vars.js';

const artifact = {
  contractName: 'P2PKH',
  constructorInputs: [
    { name: 'pkh', type: 'bytes20' },
  ],
  abi: [
    {
      name: 'spend',
      inputs: [
        { name: 'pk', type: 'pubkey' },
        { name: 's', type: 'sig' },
      ],
    },
  ],
  bytecode: 'OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG',
  source: 'pragma cashscript ^0.7.0;\n\ncontract P2PKH(bytes20 pkh) {\n    // Require pk to match stored pkh and signature to match\n    function spend(pubkey pk, sig s) {\n        require(hash160(pk) == pkh);\n        require(checkSig(s, pk));\n    }\n}\n',
  compiler: {
    name: 'cashc',
    version: '0.7.0',
  },
  updatedAt: '2025-08-05T09:04:50.388Z',
};

describe('Debugging tests - old artifacts', () => {
  it('should succeed when passing the correct parameters', () => {
    const provider = new MockNetworkProvider();
    const contractTestLogs = new Contract(artifact, [alicePkh], { provider });
    const contractUtxo = randomUtxo();
    provider.addUtxo(contractTestLogs.address, contractUtxo);

    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contractTestLogs.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
      .addOutput({ to: contractTestLogs.address, amount: 10000n });

    console.warn(transaction.bitauthUri());

    expect(() => transaction.debug()).not.toThrow();
  });

  it('should fail when passing the wrong parameters', () => {
    const provider = new MockNetworkProvider();
    const contractTestLogs = new Contract(artifact, [alicePkh], { provider });
    const contractUtxo = randomUtxo();
    provider.addUtxo(contractTestLogs.address, contractUtxo);

    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contractTestLogs.unlock.spend(alicePub, new SignatureTemplate(bobPriv)))
      .addOutput({ to: contractTestLogs.address, amount: 10000n });

    console.warn(transaction.bitauthUri());

    expect(() => transaction.debug()).toThrow();
  });
});
