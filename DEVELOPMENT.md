We use yarn workspaces + lerna for monorepo management. So to get started, clone this repository and run `yarn` in the root directory to install all dependencies for all packages.

When updating code in one package, you can run `yarn build` in the root directory to build all packages so the changes get propagated to the other packages as well. If you're already in a package directory, you can run the following command to do so:

```bash
pushd ../.. && yarn build && popd
```

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

### Running `cashproof`

Most of the bytecode optimisations that the `cashc` compiler uses can be verified for correctness using the [`cashproof` tool](https://github.com/EyeOfPython/cashproof). This tool needs to be installed separately by installing its dependencies using `pip` and cloning its repository from GitHub.

From there, you can run `python <cashproof_path> [filenames]` to verify that the optimisations contained in these files are provably correct.

Example:
```bash
python <cashproof_path> packages/cashc/test/cashproof/0.1.2=0.2.0.equiv
```

Note that if you want to run `cashproof` on the "main" CashScript optimisations file, you need to first extract the optimisations from the `cashc` compiler and save them in a separate file. This can be done using the following commands:

```bash
cp packages/utils/src/cashproof-optimisations.ts opt.equiv && sed -i '' '/`/d' opt.equiv
python <cashproof_path> opt.equiv
```

## cashscript

### Running tests

By default, running tests in the `cashscript` package runs against a local simulated `mocknet`. To run them against the real-world chipnet, you can use the `TESTS_USE_CHIPNET` environment variable. Thisuses chipnet contracts, which requires the test accounts to have some chipnet BCH.

```bash
# Run all tests using chipnet
TESTS_USE_CHIPNET=true yarn test
```

To run specific tests, you can use the `-t` flag to match the name mentioned in the `it` or `describe` block:

```bash
# Run all tests in the 'Transaction Builder' describe block (test/e2e/transaction-builder/TransactionBuilder.test.ts)
yarn test -t 'Transaction Builder'
```
