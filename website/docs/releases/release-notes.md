---
title: Release Notes
---

## v0.5.0
#### CashScript SDK
CashScript used to be very tightly coupled with BITBOX. This proved to be problematic after maintenance for BITBOX was stopped. The main objective of this update is to allow CashScript to be used with many different BCH libraries.

- :sparkles: Add `withoutChange()` function to disable change outputs for a transaction.
- :sparkles: `SignatureTemplate` can now be used with BITBOX keypairs, `bitcore-lib-cash` private keys, WIF strings, and raw private key buffers, rather than *only* BITBOX.
- :boom: Remove `Sig` alias for `SignatureTemplate` that was deprecated in v0.4.1.
- :boom: **BREAKING**: Refactor contract instantiation flow
  - A contract is now instantiated by providing a compiled artifact, constructor arguments and an optional network provider.
  - Anyone can implement the NetworkProvider interface to create a custom provider. The CashScript SDK offers three providers out of the box: one based on electrum-cash (default), one based on FullStack.cash' infrastructure, and one based on BITBOX. See the [NetworkProvider docs](/docs/sdk/instantiation#networkprovider) for details.
  - See the [migration notes](/docs/releases/migration-notes#v04-to-v05) for details on migrating from the old contract instantiation flow.
- :boom: **BREAKING**: Remove the artifacts `'networks'` field and `.deployed()` functionality, This proved to be confusing and is better suited to be handled outside of the CashScript SDK.
- :boom: **BREAKING**: `.send()` now returns a libauth Transaction instead of a BITBOX Transaction object. Alternatively a `raw` flag can be passed into the function to return a raw hex string.
- :hammer_and_wrench: Removed BITBOX as a dependency in favour of libauth for utility functions.

## v0.4.4
#### cashc compiler
- :bug: Fix a bug where covenants would not always get verified correctly when the first `require(checkSig(...))` statement was inside a branch.

## v0.4.3
#### cashc compiler
- :racehorse: Add compiler optimisations.

## v0.4.2
- Re-add README files to NPM that were accidentally removed in the v0.4.0 release.

## v0.4.1
#### cashc compiler
- :racehorse: Add optimisations to bitwise operators.
- :shell: New CLI arguments.
  - Add `--opcount|-c` flag that displays the number of opcodes in the compiled bytecode.
  - Add `--size|-s` flag that displays the size in bytes of the compiled bytecode.
- :symbols: Add trailing comma support.

#### CashScript SDK
- :name_badge: Rename `Sig` to `SignatureTemplate` to better convey its meaning.
  - `Sig` still exists for backward compatibility, but is deprecated and will be removed in a later release.

---
https://twitter.com/RoscoKalis/status/1267440143624884227

## v0.4.0
#### cashc compiler
- :sparkles: Add `.reverse()` member function to `bytes` and `string` types.
- :sparkles: Add bitwise operators `&`, `^`, `|`.
- :sparkles: Allow casting `int` to variable size `bytes` based on `size` parameter.
- :boom: **BREAKING**: Casting from `int` to unbounded `bytes` type now does not perform `OP_NUM2BIN`. Instead it is a purely semantic cast to signal that an integer value should be treated as a bytes value.
- :horse_racing: Compiler optimisations.
  - Use `NUMEQUALVERIFY` for the final function in a contract.
  - Only drop the final `VERIFY` if the remaining stack size is less than 5.
  - Pre-calculate `OutputNullData` argument size.
- :bug: Fix a bug where return type of `sha1` was incorrectly marked as `bytes32`.
- :bug: `Data.decodeBool` only treated numerical zero as false, now any zero-representation is considered false (e.g. 0x0000, -0, ...).

#### CashScript SDK
- :sparkles: Add ability to provide hardcoded inputs to the transaction rather than use CashScript's coin selection.
- :boom: **BREAKING**: Refactor the transaction flow to a fluent API
  - Remove the `TxOptions` argument and other arguments to the Transaction `send()` function.
  - Instead these parameters are passed in through fluent functions `from()`, `to()`, `withOpReturn()`, `withAge()`, `withTime()`, `withHardcodedFee()`, `withFeePerByte()` and `withMinChange()`.
  - After specifying at least one output with either `to()` or `withOpReturn()`the transaction is ready. From here the transaction can be sent to the network with the `send()` function, the transaction hex can be returned with the `build()` function, or the meep debugging command can be returned with the `meep()` function.
- :boom: Remove `Contract.fromCashFile()` and `Contract.fromArtifact()` which were deprecated in favour or `Contract.compile()` and `Contract.import()` in v0.2.2.

#### Migration
This update contains several breaking changes. See the [migration notes](/docs/releases/migration-notes#v03-to-v04) for a full migration guide.

---
https://twitter.com/RoscoKalis/status/1264921879346917376

## v0.3.3
#### cashc compiler
- :bug: Fix bug where variables could not reliably be used inside `OutputNullData` instantiation.

---
https://twitter.com/RoscoKalis/status/1224389493769342979

## v0.3.2
#### cashc compiler
- :sparkles: Add `OutputNullData(bytes[] chunks)`, an output type to enforce `OP_RETURN` outputs.
- :shell: CLI improvements
  - The `--output|-o` flag is now optional, if it is omitted or manually set to `-`, the artifact will be written to stdout rather than a file.
  - Add `--asm|-A` flag that outputs only Script in ASM format instead of a full JSON artifact.
  - Add `--hex|-h` flag that outputs only Script in hex format instead of a full JSON artifact.
  - Add `--args|-a` flag that allows you to specify constructor arguments that are added to the generated bytecode.
    - :warning: The CLI **does not** perform type checking on these arguments, so it is recommended to use the CashScript SDK for type safety.
- :bug: Fix a compilation bug that allowed compilation of "unverified covenants" (#56).
- :bug: Fix a compilation bug that allowed compilation of `OutputP2PKH(...)` without `new` keyword (#57).

#### CashScript SDK
- :globe_with_meridians: Browser support! You can now use CashScript inside web projects. Filesystem-based functionality such as compilation from file are not supported due to the nature of web, so CashScript files have to be read in a different way (e.g. Fetch API) and then passed into the CashScript SDK.
- :purse: Add `minChange` to transaction options. If this `minChange` is not reached, the change will be added to the transaction fee instead.

---
https://twitter.com/RoscoKalis/status/1223280232343515136

## v0.3.1
#### cashc compiler
* :warning: Add warnings when a contract exceeds 201 opcodes or 520 bytes.
* :bug: Fix a bug where an incorrect number of items were dropped from the stack after execution of a branch.

#### CashScript SDK
* :sparkles: Improve error handling.
  * Further specified `FailedTransactionError` into `FailedRequireError`, `FailedSigCheckError`, `FailedTimeCheckError` and a general fallback `FailedTransactionError`.
  * Add `Reason` enum with all possible reasons for a Script failure - can be used to catch specific errors.
* :mag: Add `instance.opcount` and `instance.bytesize` fields to all contract instances.
* :bug: Fix a bug where the size of a preimage was not accounted for in fee calculation for covenants.

---
https://twitter.com/RoscoKalis/status/1217101473743544320

## v0.3.0
#### cashc compiler
* :sparkles: Covenants abstraction! All individual preimage fields can be accessed without manual decoding, passing, and verification.
  * Available fields: `tx.version`, `tx.hashPrevouts`, `tx.hashSequence`, `tx.outpoint`, `tx.bytecode`, `tx.value`, `tx.sequence`, `tx.hashOutputs`, `tx.locktime`, `tx.hashtype`.
  * When any of these fields is used inside a function, this function is marked `covenant: true`, and requires a preimage as parameter (automatically passed by CashScript SDK).
  * The correct fields are efficiently cut out of the preimage and made available.
  * The first occurrence of `require(checkSig(sig, pubkey));` is identified, and preimage verification is inserted using the same sig/pubkey. **Important**: if you have multiple `checkSig` statements, keep in mind that the first will be used for verification.
  * Automatically cuts off VarInt from `scriptCode`, so `tx.bytecode` contains the actual contract bytecode.
* :sparkles: Output instantiation! Automatically construct output formats for covenant transactions.
  * `new OutputP2PKH(bytes8 amount, bytes20 pkh)`
  * `new OutputP2SH(bytes8 amount, bytes20 scriptHash)`
* :bug: Fix bug with invalid output when the final statement in a contract is an if-statement.

#### CashScript SDK
* :sparkles: Add `fee` option to TransactionOptions. This allows you to specify a hardcoded fee for your transaction.
* :sparkles: Automatically pass in sighash preimage into covenant functions. **Important**: uses the hashtype of the first signature in the parameters for generation of this preimage.
* :dizzy: Better fee estimation for transactions with many inputs.

---
https://twitter.com/RoscoKalis/status/1204765863062188033

## v0.2.3
#### cashc compiler
* :bug: Fix a bug where unequal bytes types (e.g. `bytes3` & `bytes8`) could not be concatenated together, as they were considered different types.

---
https://twitter.com/RoscoKalis/status/1202220857566908416

## v0.2.2
#### CashScript SDK
* :bug: Remove minimaldata encoding in `OP_RETURN` outputs that caused incompatibility with SLP.
* :name_badge: Renamed `Contract.fromCashFile` to `Contract.compile`.
  * The new function allows to pass in a path to a `.cash` file, or a string of the contract source code.
  * `Contract.fromCashFile` still exists for backward compatibility, but is deprecated and will be removed in a later release.
* :name_badge: Renamed `Contract.fromArtifact` to `Contract.import`.
  * The new function allows to pass in a path to a `.json` artifact file, or a JSON object of the artifact.
  * `Contract.fromArtifact` still exists for backward compatibility, but is deprecated and will be removed in a later release.
* :hammer_and_wrench: `instance.export`'s `file` argument is now optional.
  * If it is provided, the artifact is written to the file, if not, it is returned as an object.

---
https://twitter.com/RoscoKalis/status/1192900277105389568

## v0.2.1
#### cashc compiler
* :sparkles: Support `bytes` types with bounded size, e.g. `bytes1`, `bytes13`, `bytes32`.
* :bug: Fix bug in bytecode optimisation

#### CashScript SDK
* :sparkles: Support `bytes` types with bounded size, e.g. `bytes1`, `bytes13`, `bytes32`.
* :bird: Automatically output meep command on failed transaction error.
* :hammer:  Make the `hashtype` parameter in signature placeholders optional.

---
https://twitter.com/RoscoKalis/status/1186554051720167424

## v0.2.0
#### cashc compiler
* :racehorse: Implement compiler optimisations
  * For the final use of a variable, it is retrieved with `OP_ROLL` rather than `OP_PICK`. This removes the need to clean the stack at the end of a contract.
  * Final `OP_VERIFY OP_TRUE` is removed as there is an implicit `OP_VERIFY` at the end of a Script.
  * `OP_VERIFY` is merged with preceding opcode where applicable.
  * Shallow `OP_PICK` and `OP_ROLL` are replaced by hardcoded opcodes (e.g. `OP_SWAP`, `OP_DUP`).
  * Several other bytecode optimisations.
* :sparkles: Add `pragma` keyword to specify intended compiler version.
  * Example: `pragma cashscript ^0.2.0;`
  * Contract fails to compile when compiler version does not satisfy constraints.
* :rotating_light: Add CashProof for all individual bytecode optimisations and for example contracts from 0.1.2 to 0.2.0.
* :bug: Add "default case" for function selection that fixes a vulnerability where people could spend funds by not calling any function.
* :arrow_up: Update dependencies.

#### CashScript SDK
* :arrow_up: Update `cashc` and other dependencies.

---
https://twitter.com/RoscoKalis/status/1178843657069154305

## v0.1.2
#### CashScript SDK
* :sparkles: Add support for `OP_RETURN` outputs.
* :bug: Improved error handling.
* :bug: Poll for transaction details to make sure it's available.
* :fire: Enable optional mainnet - **NOT RECOMMENDED**
* :hammer: UTXO selection refactor
* :rotating_light: Improve Transaction testing

---
https://twitter.com/RoscoKalis/status/1174910060691984385

## v0.1.1
#### CashScript SDK
* :bug: Bug fixes with incorrect parameter encoding for string/bool/int types.

## v0.1.0
* :tada: Initial release.
