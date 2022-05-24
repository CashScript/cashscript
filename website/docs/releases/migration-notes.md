---
title: Migration Notes
---

## v0.6 to v0.7
### cashc compiler
The older *preimage-based* introspection/covenants have been replaced with the newly supported *native* introspection/covenants. This has significant consequences for any existing covenant contracts, but in general this native introspection makes covenants more accessible, flexible and efficient. See below for a list of changes. In some cases there is no one to one mapping between the old introspection and the new introspection methods, so the logic of the smart contracts will need to be refactored as well.

Most importantly, it is now possible to access specific data for all individual inputs and outputs, rather than e.g. working with hashes of the outputs (`tx.hashOutputs`). This offers more flexibility around the data you want to enforce. For more information about this new *native* introspection functionality, refer to the [Global covenant variables](/docs/language/globals#introspection-variables) section of the documentation, the [Covenants guide](/docs/guides/covenants/) and the [Native Introspection CHIP](https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md).

#### Covenant variables
- `tx.version` and `tx.locktime` used to be `bytes4`, but are now `int`.
- `tx.hashtype` has been removed and can no longer be accessed.
- `tx.hashPrevouts` and `tx.outpoint` have been removed. Instead, the outpoints of individual inputs can be accessed with `tx.inputs[i].outpointTransactionHash` and `tx.inputs[i].outpointIndex`. The index of the *active* input can be accessed with `this.activeInputIndex`.
- `tx.hashSequence` and `tx.sequence` have been removed. Instead, the sequence numbers of individual inputs can be accessed with `tx.inputs[i].sequenceNumber`. The index of the *active* input can be accessed with `this.activeInputIndex`.
- `tx.bytecode` has been renamed to `this.activeBytecode`
- `tx.value` has been removed. Instead, the value of individual inputs can be accessed with `tx.inputs[i].value`. The index of the *active* input can be accessed with `this.activeInputIndex`.
- `tx.hashOutputs` has been removed. Instead, the value and locking bytecode of individual outputs can be accessed separately with `tx.outputs[i].value` and `tx.outputs[i].lockingBytecode`.

Additionally, it is now possible to access the *number* of inputs and outputs with `tx.inputs.length` and `tx.outputs.length`. It is also possible to access individual inputs' locking bytecode and unlocking bytecode with `tx.inputs[i].lockingBytecode` and `tx.inputs[i].unlockingBytecode`. It is also no longer a requirement to have a signature check somewhere in the contract in order to use this introspection/covenant functionality.

#### Utility classes
`OutputP2PKH`, `OutputP2SH` and `OutputNullData` have been replaced by `LockingBytecodeP2PKH`, `LockingBytecodeP2SH` and `LockingBytecodeNullData` respectively. These new classes *only* produce the locking bytecode, rather than the full output (including value). This means that the locking bytecode and value of outputs need to be checked separately.

#### Other changes
Casting from `sig` to `datasig` has been removed since that was only useful for old-style covenants. If, for any reason, you do want to cast a sig to a datasig you will need to manually cut the `hashtype` off the end and update `datasig(s)` to `s.split(s.length - 1)[0]`.

#### Example
Since the new covenant functionality is very different from the existing, it may be useful to see a complex covenant contract refactored from the old way to the new way.

```solidity title="Mecenas.cash v0.6.0"
pragma cashscript ^0.6.0;

contract Mecenas(bytes20 recipient, bytes20 funder, int pledge, int period) {
    function receive(pubkey pk, sig s) {
        require(checkSig(s, pk));
        require(tx.age >= period);

        int minerFee = 1000;
        int intValue = int(bytes(tx.value));

        if (intValue <= pledge + minerFee) {
            // The contract has less value than the pledge, or equal.
            // The recipient must claim all of of it.

            bytes8 amount1 = bytes8(intValue - minerFee);
            bytes34 out1 = new OutputP2PKH(amount1, recipient);
            require(hash256(out1) == tx.hashOutputs);
        } else {
            // The contract has more value than the pledge. The recipient must
            // also add one change output sending the remaining coins back
            // to the contract.

            bytes8 amount1 = bytes8(pledge);
            bytes8 amount2 = bytes8(intValue - pledge - minerFee);
            bytes34 out1 = new OutputP2PKH(amount1, recipient);
            bytes32 out2 = new OutputP2SH(amount2, hash160(tx.bytecode));
            require(hash256(out1 + out2) == tx.hashOutputs);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

```solidity title="Mecenas.cash 0.7.0"
contract Mecenas(bytes20 recipient, bytes20 funder, int pledge, int period) {
    function receive() {
        require(tx.age >= period);

        // Check that the first output sends to the recipient
        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

        // Calculate the value that's left
        int minerFee = 1000;
        int currentValue = tx.inputs[this.activeInputIndex].value;
        int changeValue = currentValue - pledge - minerFee;

        // If there is not enough left for *another* pledge after this one,
        // we send the remainder to the recipient. Otherwise we send the
        // remainder to the recipient and the change back to the contract
        if (changeValue <= pledge + minerFee) {
            require(tx.outputs[0].value == currentValue - minerFee);
        } else {
            require(tx.outputs[0].value == pledge);
            bytes changeBytecode = tx.inputs[this.activeInputIndex].lockingBytecode;
            require(tx.outputs[1].lockingBytecode == changeBytecode);
            require(tx.outputs[1].value == changeValue);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

## v0.5 to v0.6
### cashc compiler
The exports for library usage of `cashc` have been updated. All utility-type exports have been moved to the `@cashscript/utils` package, but they are still accessible from the `utils` export from `cashc`. Note that the recommended use of `cashc` is still the CLI, not the NPM package.

In v0.5 you could encode a string like this:
```js
const { Data } = require('cashc');

const encodedString = Data.encodeString('Hello World');
```

While for v0.6 you'd need to use the `utils` export or `@cashscript/utils`:
```js
const { utils } = require('cashc');
const { encodeString } = require('@cashscript/utils');

const encodedString = utils.encodeString('Hello World');
const encodedString = encodeString('Hello World');
```

---

Compilation functions used to be exported as part of the `CashCompiler` object, but are now exported as standalone functions.

In v0.5 compilation looked like this:
```js
const { CashCompiler } = require('cashc');

const Mecenas = CashCompiler.compileFile(path.join(__dirname, 'mecenas.cash'));
```

In v0.6, this needs to be changed to this:
```js
const { compileFile } = require('cashc');

const Mecenas = compileFile(path.join(__dirname, 'mecenas.cash'));
```

### CashScript SDK
The CashScript SDK no longer depends on `cashc` and no longer exports the `CashCompiler` object. This reflects the recommended usage where the CLI is used for compilation and the artifact JSON is saved. Then this artifact JSON can be imported into the CashScript SDK. If you prefer to compile your contracts from code, you need to add `cashc` as a dependency and use its compilation functionality.

## v0.4 to v0.5
### CashScript SDK
The contract instantiation flow has been refactored to enable compatibility with more BCH libraries and simplify the different classes involved.

---

In v0.4 a contract could be compiled or imported using `Contract.compile()` or `Contract.import()`, which returned a Contract object. On that Contract object `contract.new(...args)` could be called, which returned an Instance object. In the v0.5 release, the Contract and Instance objects have been merged and simplified, while the compilation has been extracted into its own class.

In v0.4, contract instantiation looked like this:
```js
const { Contract } = require('cashscript');

const Mecenas = Contract.compile(path.join(__dirname, 'mecenas.cash'), 'testnet');
const contract = Mecenas.new(alicePkh, bobPkh, 10000);
```

In v0.5, this needs to be changed to look like this:
```js
const { CashCompiler, ElectrumNetworkProvider, Contract } = require('cashscript');

const Mecenas = CashCompiler.compileFile(path.join(__dirname, 'mecenas.cash'));
const provider = new ElectrumNetworkProvider('testnet');
const contract = new Contract(Mecenas, [alicePkh, bobPkh, 10000], provider);
```

---

* Transaction object's `.send()` function now returns either a libauth Transaction or raw hex string rather than a BITBOX Transaction. If it is necessary, the raw hex string can be imported into libraries such as BITBOX to achieve similar functionality as before.

* In v0.4.1, `Sig` was deprecated in favour of `SignatureTemplate`. In v0.5.0, the deprecated class has been removed. All occurrences of `Sig` should be replaced with `SignatureTemplate`.

See the [release notes](/docs/releases/release-notes#v050) for an overview of other new changes.

## v0.3 to v0.4
### cashc compiler
In v0.3, casting an `int` type to a `bytes` would perform an `NUM2BIN` operation, padding the value to 8 bytes. This made `bytes(10)` equivalent to `bytes8(10)`. From v0.4.0 onwards, casting to an *unbounded* `bytes` type is only a semantic cast, indicating that the `int` value should be treated as a `bytes` value.

* If you need the old behaviour, you should change all occurrences of `bytes(x)` to `bytes8(x)`.

### CashScript SDK
The entire `Transaction` flow has been refactored to a more fluent chained TransactionBuilder API.

* All occurrences of `.send(to, amount)` should be replaced with `.to(to, amount).send()`.
* All occurrences of `.send(outputs)` should be replaced with `.to(outputs).send()`.
  * Alternatively, the list of `outputs` can be split up between several `.to()` calls.
  * If any of the outputs contain `opReturn` outputs, these should be added separately using `.withOpReturn(chunks)`
* The same transformations are applicable to all `.meep()` calls.
* The `meep()` function previously logged the meep command automatically, but now it returns the command as a string, so you should `console.log()` the command separately.
* All transaction options previously included in the `TxOptions` object should now be provided using chained functions.
  * The `time` option should be provided using the `.withTime(time)` function.
  * The `age` option should be provided using the `.withAge(age)` function.
  * The `fee` option should be provided using the `.withHardcodedFee(fee)` function.
  * The `minChange` option should be provided using the `.withMinChange(minChange)` function.

In v0.2.2, `Contract.fromCashFile()` and `Contract.fromArtifact()` were deprecated in favour of `Contract.compile()` and `Contract.import()`. In v0.4.0, the deprecated functions have been removed.

* All occurrences of `Contract.fromCashFile()` should be replaced with `Contract.compile()`.
* All occurrences of `Contract.fromArtifact()` should be replaced with `Contract.import()`.

See the [release notes](/docs/releases/release-notes#v040) for an overview of other new changes.
