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
`tx.age is used to create *relative* time locks. The value of `tx.age` can either represent a number of blocks, or a number of *chunks*, which are 512 seconds. The corresponding *transaction level* time lock determines which of the two options is used.

Due to limitations in the underlying Bitcoin Script, `tx.age` can only be used in the following way:

```solidity
require(tx.age >= <expression>);
```

Because of the way time locks work, **a corresponding time lock needs to be added to the transaction**. This can be done in the CashScript SDK using the [`withAge()`][withAge()] function. However, the value passed into this function will always be treated as a number of blocks, so **it is currently not supported to use `tx.age` as a number of second chunks**.

:::note
`tx.age` corresponds to the `nSequence` field of the current *UTXO* and the `OP_CHECKSEQUENCEVERIFY` opcode.
:::

## Global covenant variables
Covenants are a technique used to put constraints on spending the money inside a smart contract. The main use case of this is limiting the addresses where money can be sent and the amount sent. This technique works by passing the so-called *sighash preimage* into the smart contract and extracting its individual fields. Using the JavaScript SDK this preimage is passed in automatically by the SDK, but when constructing transactions manually, be sure to include the preimage when working with covenants.

To explore the possible uses of covenants inside smart contracts, read the [CashScript Covenants Guide](/docs/guides/covenants).

:::note
Because of the way covenants work in the underlying Bitcoin Script, the sighash preimage needs to be verified by the contract. This is done automatically by including a signature check statement anywhere in the code outside of if-statements. This statement is then used by the compiler to verify the preimage.

```solidity
require(checkSig(sig, pubkey));
```
:::

:::note
The explanations below use the default `SIGHASH_ALL` *hashtype*. Other hashtypes could assign slightly different meaning to these variables. For more specific information on the sighash preimage, refer to [BIP143][bip143] and the [sighash docs][sighash-docs].
:::

### tx.version
```solidity
bytes4 tx.version
```

Represents the version of the current transaction. Different transaction versions can have differences in functionality. Currently only version 1 and 2 exist, where only version 2 has support for [BIP68][bip68].

:::note
`tx.version` is of type `bytes4` so to use it as an integer it needs to be cast to `int` first.
:::

### tx.hashPrevouts
```solidity
bytes32 tx.hashPrevouts
```

Represents the double sha256 of the serialisation of all input outpoints.

### tx.hashSequence
```solidity
bytes32 tx.hashSequence
```

Represents the double sha256 of the serialisation of the `nSequence` field of all inputs.

### tx.outpoint
```solidity
bytes36 tx.outpoint
```

Represents the outpoint of the current input (`bytes32 txid` concatenated with `bytes4 vout`).

### tx.bytecode
```solidity
bytes tx.bytecode
```

Represents the Bitcoin Script bytecode of the current contract. This can be used to enforce sending money back to the contract in combination with `tx.hashOutputs`.

#### Example
```solidity
bytes32 output = new OutputP2SH(bytes8(10000), hash160(tx.bytecode));
require(hash256(output) == tx.hashOutputs);
```

### tx.value
```solidity
bytes8 value
```

Represents the value of current UTXO being spent. This can be used to enforce the full balance or a specific part of the contract's balance to be spent.

:::caution
`tx.value` is of type `bytes8` so its value could be too large to fit in an `int` (max ~21 BCH). So you should make sure that the value is small enough before casting it to an integer. For safety, casting `bytes8` to `int` is disabled and you need to *force cast* it by casting to `bytes` first.

```solidity
int intValue = int(bytes(tx.value))
```
:::

### tx.sequence
```solidity
bytes4 tx.sequence
```

Represents the `nSequence` field of the current input.

### tx.hashOutputs
```solidity
bytes32 tx.hashOutputs
```

Represents the double SHA-256 hash of the serialisation of all outputs (`bytes8` amount + `bytes` locking script). Can be used to enforce sending specific amounts to specific addresses.

#### Example
```solidity
bytes34 out1 = new OutputP2PKH(bytes8(10000), pkh);
bytes32 out2 = new OutputP2SH(bytes8(10000), hash160(tx.bytecode));
require(hash256(out1 + out2) == tx.hashOutputs);
```

### tx.locktime
```solidity
bytes4 tx.locktime
```

Represents the `nLocktime` field of the current input.

:::note
`tx.locktime` is similar to the [`tx.time`][tx.time] global variable. But for safety it is recommended to use [`tx.time`][tx.time] over `tx.locktime` in *almost* all cases.
:::

### tx.hashtype
```solidity
bytes4 tx.hashtype
```

Represents the hashtype used for the generation of the sighash and transaction signature. Can be used to enforce that the spender uses a specific hashtype. See the [sighash docs][sighash-docs] for the implications of different hashtypes.

## Output instantiation
One of the main use cases of covenants is enforcing transaction outputs (where money is sent and how much). To assist with enforcing these outputs, there is a number of `Output` objects that can be instantiated. These objects are then used in combination with `tx.hashOutputs` as shown in the [`tx.hashOutputs` section][tx.hashOutputs].

#### Example
```solidity
bytes34 out1 = new OutputP2PKH(bytes8(10000), pkh);
bytes32 out2 = new OutputP2SH(bytes8(10000), hash160(tx.bytecode));
require(hash256(out1 + out2) == tx.hashOutputs);
```

### OutputP2PKH
```solidity
new OutputP2PKH(bytes8 amount, bytes20 pkh): bytes34
```

Creates new P2PKH output serialisation for an output sending `amount` to `pkh`.

### OutputP2SH
```solidity
new OutputP2SH(bytes8 amount, bytes20 scriptHash): bytes32
```

Creates new P2SH output serialisation for an output sending `amount` to `scriptHash`.

### OutputNullData
```solidity
new OutputNullData(bytes[] chunks): bytes
```

Creates new OP_RETURN output serialisation for an output containing an OP_RETURN script with `chunks` as its data.

[bip143]: https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#specification
[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
[sighash-docs]: https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/replay-protected-sighash.md#digest-algorithm

[tx.time]: /docs/language/globals#txtime
[tx.hashOutputs]: /docs/language/globals#txhashoutputs

[withAge()]: /docs/sdk/transactions#withage
[withTime()]: /docs/sdk/transactions#withtime
