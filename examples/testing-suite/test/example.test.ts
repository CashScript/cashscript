import artifact from '../artifacts/example.artifact.js';
import { Contract, MockNetworkProvider, TransactionBuilder, randomUtxo } from 'cashscript';
import 'cashscript/vitest';

describe('test example contract functions', () => {
  const provider = new MockNetworkProvider();
  const contract = new Contract(artifact, [], { provider });

  // Create a contract Utxo
  const contractUtxo = randomUtxo();
  provider.addUtxo(contract.address, contractUtxo);

  it('should succeed when correct parameter is passed', () => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.test(1n))
      .addOutput({ to: contract.address, amount: 10000n });

    expect(transaction).toLog(/1 test/);
    expect(transaction).not.toFailRequire();
  });

  it('should fail require statement and log when incorrect parameter is passed', () => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.test(0n))
      .addOutput({ to: contract.address, amount: 10000n });

    expect(transaction).toLog(/0 test/);
    expect(transaction).toFailRequireWith(/Wrong value passed/);
  });

});
