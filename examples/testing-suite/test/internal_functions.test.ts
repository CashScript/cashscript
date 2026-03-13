import { compileFile } from 'cashc';
import { Contract, MockNetworkProvider, TransactionBuilder, randomUtxo, VmTarget } from 'cashscript';
import 'cashscript/vitest';
import { URL } from 'url';

const artifact = compileFile(new URL('../contracts/internal_functions.cash', import.meta.url));

describe('test internal function contract', () => {
  const provider = new MockNetworkProvider({ vmTarget: VmTarget.BCH_2026_05 });
  const contract = new Contract(artifact, [], { provider });

  it('should succeed when correct parameter is passed', () => {
    const contractUtxo = randomUtxo();
    provider.addUtxo(contract.address, contractUtxo);

    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.test(1n))
      .addOutput({ to: contract.address, amount: 10000n });

    expect(transaction).toLog(/1 internal/);
    expect(transaction).not.toFailRequire();
  });

  it('should fail require statement and log from the internal function when incorrect parameter is passed', () => {
    const contractUtxo = randomUtxo();
    provider.addUtxo(contract.address, contractUtxo);

    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.test(0n))
      .addOutput({ to: contract.address, amount: 10000n });

    expect(transaction).toLog(/0 internal/);
    expect(transaction).toFailRequireWith(/Wrong value passed/);
  });

  it('should expose only the public test function in the ABI', () => {
    expect(artifact.abi.map((func) => func.name)).toEqual(['test']);
  });
});
