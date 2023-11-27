import artifact from '../artifacts/example.json' assert { type: "json" };
import { Contract, MockNetworkProvider } from 'cashscript/dist/src';
import { randomUtxo } from 'cashscript/dist/src/utils';
import 'cashscript/dist/test/JestExtensions';

describe("test example contract functions", () => {
  it("should check for output logs", async () => {
    const provider = new MockNetworkProvider();
    const contract = new Contract(artifact, [], { provider });
    provider.addUtxo(contract.address, randomUtxo());

    artifact.debug.logs[0].ip = 100;

    let transaction = contract.functions.test(0n).to(contract.address, 10000n);
    await (expect(transaction)).toLog(/0 test/);
    await (expect(transaction)).toFailRequireWith(/Wrong value passed/);

    transaction = contract.functions.test(1n).to(contract.address, 10000n);
    await expect(transaction.send()).resolves.not.toThrow();
  });
});
