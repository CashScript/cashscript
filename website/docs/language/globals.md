---
title: Global Variables
---

## Globally available units
An integer literal can take a suffix of either monetary or temporary units to add semantic value to these integers and to simplify arithmetic. When these units are used, the underlying integer is automatically multiplied by the value of the unit. The units `sats`, `finney`, `bits` and `bitcoin` are used to denote monetary value, while the units `seconds`, `minutes`, `hours`, `days` and `weeks` are used to denote time.

:::caution
Be careful when using these units in precise calendar calculations though, because not every year equals 365 days and not even every minute has 60 seconds because of [leap seconds](https://en.wikipedia.org/wiki/Leap_second).
:::

### Example
```solidity
require(1 sats == 1);
require(1 finney == 10);
require(1 bit == 100);
require(1 bitcoin == 1e8);

require(1 seconds == 1);
require(1 minutes == 60 seconds);
require(1 hours == 60 minutes);
require(1 days == 24 hours);
require(1 weeks == 7 days);
```

## Global time lock variables
Bitcoin Cash has support for different kinds of time locks, which can be used to specify time-based conditions inside Bitcoin Cash contracts. These time locks can be separated by **three main attributes**: location, targeting and metric. The *location* can be the *transaction level* or the *contract level*, but *contract level* locks also require you to use a corresponding *transaction level* lock. The targeting can be *relative* (e.g. at least 4 hours have passed) or *absolute* (e.g. the block number is at least 600,000). The metric can be blocks or seconds.

It can be difficult to fully grasp the intricacies of time locks, so if you're starting out it is recommended to start off with the simplest version: absolute block-based time locks. If you do want to dive into the more advanced uses of time locks, James Prestwich wrote [**the best** article explaining time locks in Bitcoin](https://prestwi.ch/bitcoin-time-locks/) that also fully applies to Bitcoin Cash.


### tx.time
`tx.time` is used to create *absolute* time locks. The value of `tx.time` can either represent the block number of the spending transaction or its timestamp. When comparing it with values below `500,000,000`, it is treated as a blocknumber, while higher values are treated as a timestamp.

Due to limitations in the underlying Bitcoin Script, `tx.time` can only be used in the following way:

```solidity
require(tx.time >= <expression>);
```

Because of the way time locks work, **a corresponding time lock needs to be added to the transaction**. The CashScript SDK automatically sets this *transaction level* time lock to the most recent block number, as this is the most common use case. If you need to use a different block number or timestamp, this should be passed into the CashScript SDK using the [`withTime()`][withTime()] function. If the default matches your use case, **no additional actions are required**.

:::note
`tx.time` corresponds to the `nLocktime` field of the current transaction and the `OP_CHECKLOCKTIMEVERIFY` opcode.
:::

### tx.age
`tx.age` is used to create *relative* time locks. The value of `tx.age` can either represent a number of blocks, or a number of *chunks*, which are 512 seconds. The corresponding *transaction level* time lock determines which of the two options is used.

Due to limitations in the underlying Bitcoin Script, `tx.age` can only be used in the following way:

```solidity
require(tx.age >= <expression>);
```

Because of the way time locks work, **a corresponding time lock needs to be added to the transaction**. This can be done in the CashScript SDK using the [`withAge()`][withAge()] function. However, the value passed into this function will always be treated as a number of blocks, so **it is currently not supported to use `tx.age` as a number of second chunks**.

:::note
`tx.age` corresponds to the `nSequence` field of the current *UTXO* and the `OP_CHECKSEQUENCEVERIFY` opcode.
:::

## Introspection variables
Introspection functionality is used to create *covenant* contracts. Covenants are a technique used to put constraints on spending the money inside a smart contract. The main use case of this is limiting the addresses where money can be sent and the amount sent. To explore the possible uses of covenants inside smart contracts, read the [CashScript Covenants Guide][covenants-guide].

### this.activeInputIndex
```solidity
int this.activeInputIndex
```

During the validation of a BCH transaction, every transaction input is evaluated in order, and the contract's code is evaluated in the context of the different inputs. `this.activeInputIndex` represents the index of the input that is currently being evaluated. This can be used in conjunction with the properties under `tx.inputs`.

### this.activeBytecode
```solidity
bytes this.activeBytecode
```

During the validation of a BCH transaction, every transaction input is evaluated in order, and the contract's code is evaluated in the context of the different inputs. `this.activeBytecode` represents the contract bytecode of the input that is currently being evaluated.


### tx.version
```solidity
int tx.version
```

Represents the version of the current transaction. Different transaction versions can have differences in functionality. Currently only version 1 and 2 exist, where only version 2 has support for [BIP68][bip68].

### tx.locktime
```solidity
int tx.locktime
```

Represents the `nLocktime` field of the transaction.

:::note
`tx.locktime` is similar to the [`tx.time`][tx.time] global variable. It is recommended to only use `tx.locktime` for adding `nLocktime` to simulated state and [`tx.time`][tx.time] in all other cases.
:::

### tx.inputs
Represents the list of inputs of the evaluated transaction. This is an array, and cannot be used on itself. You need to access an input with a specific index and specify the properties you want to access.

#### tx.inputs.length
```solidity
int tx.inputs.length
```

Represents the number of inputs in the transaction.

#### tx.inputs[i].value
```solidity
int tx.inputs[i].value
```

Represents the value of a specific input (in satoshis).

#### tx.inputs[i].lockingBytecode
```solidity
bytes tx.inputs[i].lockingBytecode
```

Represents the locking bytecode (`scriptPubKey`) of a specific input.

#### tx.inputs[i].unlockingBytecode
```solidity
bytes tx.inputs[i].unlockingBytecode
```

Represents the unlocking bytecode (`scriptSig`) of a specific input.

#### tx.inputs[i].outpointTransactionHash
```solidity
bytes32 tx.inputs[i].outpointTransactionHash
```

Represents the outpoint transaction hash where a specific input was initially locked.

#### tx.inputs[i].outpointIndex
```solidity
int tx.inputs[i].outpointIndex
```

Represents the outpoint index where a specific input was initially locked.

#### tx.inputs[i].sequenceNumber
```solidity
int tx.inputs[i].sequenceNumber
```

Represents the `nSequence` number of a specific input.

### tx.outputs
Represents the list of outputs of the evaluated transaction. This is an array, and cannot be used on itself. You need to access an output with a specific index and specify the properties you want to access.

#### tx.outputs.length
```solidity
int tx.outputs.length
```

Represents the number of outputs in the transaction.

#### tx.outputs[i].value
```solidity
int tx.outputs[i].value
```

Represents the value of a specific output (in satoshis).

#### tx.outputs[i].lockingBytecode
```solidity
bytes tx.outputs[i].lockingBytecode
```

Represents the locking bytecode (`scriptPubKey`) of a specific output.

## Constructing locking bytecode
One of the main use cases of covenants is enforcing transaction outputs (where money is sent). To assist with enforcing these outputs, there is a number of `LockingBytecode` objects that can be instantiated. These locking bytecodes can then be compared to the locking bytecodes of transaction outputs.

#### Example
```solidity
bytes25 lockingBytecode = new LockingBytecodeP2PKH(pkh);
int value = 10000;
require(tx.outputs[0].lockingBytecode == lockingBytecode);
require(tx.outputs[0].value == value);
```

### LockingBytecodeP2PKH
```solidity
new LockingBytecodeP2PKH(bytes20 pkh): bytes25
```

Creates new P2PKH locking bytecode for the public key hash `pkh`.

### LockingBytecodeP2SH
```solidity
new LockingBytecodeP2SH(bytes20 scriptHash): bytes23
```

Creates new P2SH locking bytecode for the script hash `scriptHash`.

### LockingBytecodeNullData
```solidity
new LockingBytecodeNullData(bytes[] chunks): bytes
```

Creates new OP_RETURN locking bytecode with `chunks` as its OP_RETURN data.

[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
[withAge()]: /docs/sdk/transactions#withage
[withTime()]: /docs/sdk/transactions#withtime
[covenants-guide]: /docs/guides/covenants
[tx.time]: #txtime
