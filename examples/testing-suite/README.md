# CashScript Testing Suite

This is an example project to demonstrate how to write and compile CashScript contracts and test them using the CashScript SDK and Vitest.

## Writing a CashScript contract

We have included two simple example contracts in the `contracts/` directory that can be used as a starting point to write your own contracts. The contracts demonstrate logs, require statements and transaction signatures.

## Compiling the contracts

We have included a task to compile the contracts in the `tasks/` directory called `compile.ts`. This task will compile all the contracts in the `contracts/` directory and save the artifacts in the `artifacts/` directory. This includes both the JSON and TypeScript artifacts. It is recommended to use the TypeScript artifacts for proper type-safety.

You can run the task with `yarn compile`.

## Running the tests

We have included test files in the `test/` directory, which test the expected functionality of the contracts. For key management, we have included a utility file in the `utils/` directory which exports testing keys for Alice and Bob.

You can run the tests with `yarn test`.

## Next steps

Once you're getting comfortable writing, compiling and testing CashScript contracts, you can copy the `testing-suite` directory into your own project to use as a starting point. From there you can start writing more complex contracts and integrate them into full applications.

We recommend checking out the [CashScript SDK documentation](https://cashscript.org/docs/sdk/) for more information on how to use the CashScript SDK, and the specific section on the [testing setup](https://cashscript.org/docs/sdk/testing-setup) for more information on how to test your contracts.
