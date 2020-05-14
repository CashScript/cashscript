`cashc` can be used to compile CashScript `.cash` files into `.json` artifact files. These artifacts can be imported and used by any of the CashScript SDKs, or other libraries / applications that use CashScript. Check out the [Language Documentation](/cashscript/docs/language) for a full overview of this Artifact format.

### Installation
You can use `npm` to install the `cashc` command line tool gloablly.

```bash
npm install -g cashc
```

### Usage
The `cashc` CLI tool can be used to compile `.cash` files to JSON artifact files.

```bash
Usage: cashc [options] [source_file]

Options:
  --output, -o  Specify a file to output the generated artifact.        [string]
  --hex, -h     Compile the contract to hex format rather than a full artifact
                                                                       [boolean]
  --asm, -A     Compile the contract to ASM format rather than a full artifact
                                                                       [boolean]
  --args, -a    List of constructor arguments to pass into the contract. Can
                only be used in combination with either the --hex or --asm
                flags. When compiling to a JSON artifact, contract instantiation
                should be done through the CashScript SDK. Note that NO type
                checking is performed by the cashc CLI, so it is safer to use
                the CashScript SDK.                                      [array]
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
```
