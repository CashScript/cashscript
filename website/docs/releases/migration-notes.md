---
title: Migration Notes
---

## v0.3 to v0.4
#### cashc compiler
In v0.3, casting an `int` type to a `bytes` would perform an `NUM2BIN` operation, padding the value to 8 bytes. This made `bytes(10)` equivalent to `bytes8(10)`. From v0.4.0 onwards, casting to an *unbounded* `bytes` type is only a semantic cast, indicating that the `int` value should be treated as a `bytes` value.

* If you need the old behaviour, you should change all occurrances of `bytes(x)` to `bytes8(x)`.

#### CashScript SDK
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

See the [release notes](/docs/releases/release-notes#v040) for an overview of other new changes
