We use yarn workspaces + lerna for monorepo management. So to get started, clone this repository and run `yarn` in the root directory to install all dependencies for all packages.

When updating code in one package, you can run `yarn build` in the root directory to build all packages so the changes get propagated to the other packages as well.

### Publishing a release

To publish a new release, we use `yarn update-version 'x.x.x'` in the root directory to bump the version before release, and then `yarn publish-all` in the root directory to publish the release. In case of a tagged release (such as `next`), we use `yarn publish-all --dist-tag <tag name>` to publish the release with the specified tag.

## cashc

### Prerequisites

In order to use the `antlr` command line tool when updating CashScript's grammar file, you need to have it installed.

On macOS you can install it using Homebrew:

```bash
brew install antlr
```

On Linux you can install it using apt:

```bash
sudo apt install antlr4
```

For other platforms, refer to the [Antlr website](https://www.antlr.org/).

### Updating the grammar

When updating the grammar file in `src/grammar/CashScript.g4`, we also need to make sure that the generated parser is updated. To do this, run the following command in the `packages/cashc` directory:

```bash
yarn antlr
```

## cashscript

### Running tests

By default, running tests in the `cashscript` package uses chipnet contracts, which requires the test accounts to have some chipnet BCH. To run the tests against a local "mock network", you can use the `TESTS_USE_MOCKNET` environment variable.

```bash
# Run all tests using the mock network
TESTS_USE_MOCKNET=true yarn test
```

To run specific tests, you can use the `-t` flag to match the name mentioned in the `it` or `describe` block:

```bash
# Run all tests in the 'Transaction Builder' describe block (test/e2e/transaction-builder/TransactionBuilder.test.ts)
yarn test -t 'Transaction Builder'
```
