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
``````
