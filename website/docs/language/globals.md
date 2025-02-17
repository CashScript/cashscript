---
title: Global Variables
---

## Global time lock variables
Bitcoin Cash has support for different kinds of time locks, which can be used to specify time-based conditions inside Bitcoin Cash contracts. These time locks can be separated by **three main attributes**: location, targeting and metric. The *location* can be the *transaction level* or the *contract level*, but *contract level* locks also require you to use a corresponding *transaction level* lock. The targeting can be *relative* (e.g. at least 4 hours have passed) or *absolute* (e.g. the block number is at least 600,000). The metric can be blocks or seconds.

It can be difficult to fully grasp the intricacies of time locks, so if you're starting out it is recommended to start off with the simplest version: absolute block-based time locks. If you do want to dive into the more advanced uses of time locks, James Prestwich wrote [**the best** article explaining time locks in Bitcoin](https://prestwi.ch/bitcoin-time-locks/) that also fully applies to Bitcoin Cash.


### tx.time
`tx.time` is used to create *absolute* time locks. The value of `tx.time` can either represent the block number of the spending transaction or its timestamp. When comparing it with values below `500,000,000`, it is treated as a blocknumber, while higher values are treated as a timestamp.

`tx.time` corresponds to the `nLocktime` field of the current transaction using the `OP_CHECKLOCKTIMEVERIFY` opcode. Because of this `tx.time` can only be used in the following way:

```solidity
require(tx.time >= <expression>);
```

:::note
To access the value of the `nLocktime` field for assignment, use the `tx.locktime` introspection variable.
:::

Because of the way time locks work, **a corresponding time lock needs to be added to the transaction**. The CashScript SDK automatically sets this *transaction level* time lock to the most recent block number, as this is the most common use case. If you need to use a different block number or timestamp, this should be passed into the CashScript SDK using the [`withTime()`][withTime()] function. If the default matches your use case, **no additional actions are required**.

### tx.age
`tx.age` is used to create *relative* time locks. The value of `tx.age` can either represent a number of blocks, or a number of *chunks*, which are 512 seconds. The corresponding *transaction level* time lock determines which of the two options is used.

`tx.age` corresponds to the `nSequence` field of the current *UTXO* using the `OP_CHECKSEQUENCEVERIFY` opcode. Because of this `tx.age` can only be used in the following way:

```solidity
require(tx.age >= <expression>);
```

:::note
To access the value of the `nSequence` field for variable assignment, use the [`sequenceNumber` introspection variable](#txinputsisequencenumber).
:::

Because of the way time locks work, **a corresponding time lock needs to be added to the transaction**. This can be done in the CashScript SDK using the [`withAge()`][withAge()] function. However, the value passed into this function will always be treated as a number of blocks, so **it is currently not supported to use `tx.age` as a number of second chunks**.

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

Represents the `nLocktime` field of the transaction. This is similar to the [`tx.time`][tx.time] global variable but `tx.time` can only be used in `require` statements, not for variable declaration.

:::tip
 The use case for `tx.locktime` is to read the `nLocktime` value and add to the local state. Example usage for this is demonstrated in the [Sablier example](/docs/guides/covenants#keeping-local-state-in-nfts).
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

Represents the `nSequence` number of a specific input. This value of the input's `sequenceNumber` is only consensus-enforced as a relative timelock when using transaction verion 2.

#### tx.inputs[i].tokenCategory
```solidity
bytes tx.inputs[i].tokenCategory
```

Represents the `tokenCategory` of a specific input. Returns 0 when that specific input contains no tokens. When the input contains an NFT with a capability, the 32-byte `tokenCategory` is concatenated together with `0x01` for a mutable NFT and `0x02` for a minting NFT.

:::caution
The `tokenCategory` introspection variable returns the tokenCategory in the original unreversed order, this is unlike wallets and explorers which use the reversed byte-order. So be careful about the byte-order of `tokenCategory` when working with BCH smart contracts.
:::

#### tx.inputs[i].nftCommitment
```solidity
bytes tx.inputs[i].nftCommitment
```

Represents the NFT commitment data of a specific input.

#### tx.inputs[i].tokenAmount
```solidity
int tx.inputs[i].tokenAmount
```

Represents the amount of fungible tokens of a specific input.

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

#### tx.output[i].tokenCategory
```solidity
bytes tx.output[i].tokenCategory
```

Represents the `tokenCategory` of a specific output. Returns 0 when that specific output contains no tokens. When the output contains an NFT with a capability, the 32-byte `tokenCategory` is concatenated together with `0x01` for a mutable NFT and `0x02` for a minting NFT.

:::caution
The `tokenCategory` introspection variable returns the tokenCategory in the original unreversed order, this is unlike wallets and explorers which use the reversed byte-order. So be careful about the byte-order of `tokenCategory` when working with BCH smart contracts.
:::

#### tx.output[i].nftCommitment
```solidity
bytes tx.output[i].nftCommitment
```

Represents the NFT commitment data of a specific output.

#### tx.output[i].tokenAmount
```solidity
int tx.output[i].tokenAmount
```

Represents the amount of fungible tokens of a specific output.

## Constructing locking bytecode
One of the main use cases of covenants is enforcing transaction outputs (where money is sent). To assist with enforcing these outputs, there is a number of `LockingBytecode` objects that can be instantiated. These locking bytecodes can then be compared to the locking bytecodes of transaction outputs.

#### Example
```solidity
bytes25 lockingBytecode = new LockingBytecodeP2PKH(pkh);
int value = 10_000;
require(tx.outputs[0].lockingBytecode == lockingBytecode);
require(tx.outputs[0].value == value);
```

### LockingBytecodeP2PKH
```solidity
new LockingBytecodeP2PKH(bytes20 pkh): bytes25
```

Creates new P2PKH locking bytecode for the public key hash `pkh`.

### LockingBytecodeP2SH20
```solidity
new LockingBytecodeP2SH20(bytes20 scriptHash): bytes23
```

Creates new P2SH20 locking bytecode for the script hash, where `scriptHash` is the hash160() of your script.

:::caution
Because the old P2SH20 addresses use hashes which are only 20-bytes in length, they are vulnerable to hash collision in situations where an attacker can introduce arbitrary data to a contract. To solve these security issues P2SH32 has been introduced. It is recommended to always use `LockingBytecodeP2SH32` from now on.
:::

### LockingBytecodeP2SH32
```solidity
new LockingBytecodeP2SH32(bytes32 scriptHash): bytes35
```

Creates new P2SH32 locking bytecode for the script hash, where `scriptHash` is the hash256() of your script.

### LockingBytecodeNullData
```solidity
new LockingBytecodeNullData(bytes[] chunks): bytes
```

Creates new OP_RETURN locking bytecode with `chunks` as its OP_RETURN data.

:::note
`LockingBytecodeNullData` outputs are provably unspendable, so any BCH sent there would be burned. For these outputs no dust-minimum is enforced so often `LockingBytecodeNullData` outputs have 0 BCH on them.
:::

## Globally available units

An integer literal can take a suffix of either monetary or temporary units to add semantic value to these integers and to simplify arithmetic. When these units are used, the underlying integer is automatically multiplied by the value of the unit.

### BCH Units

The units `sats`, `finney`, `bits` and `bitcoin` can be used to denominate Bitcoin Cash amounts.

#### Example
```solidity
require(1 sats == 1);
require(1 finney == 10);
require(1 bits == 100);
require(1 bitcoin == 1e8);
```

### Time Units

The units `seconds`, `minutes`, `hours`, `days` and `weeks` can be used to denote time.

:::caution
Be careful when using these units in precise calendar calculations though, because not every year equals 365 days and not even every minute has 60 seconds because of [leap seconds](https://en.wikipedia.org/wiki/Leap_second).
:::

#### Example
```solidity
require(1 seconds == 1);
require(1 minutes == 60 seconds);
require(1 hours == 60 minutes);
require(1 days == 24 hours);
require(1 weeks == 7 days);
```

[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
[withAge()]: /docs/sdk/transactions#withage
[withTime()]: /docs/sdk/transactions#withtime
[covenants-guide]: /docs/guides/covenants
[tx.time]: #txtime
