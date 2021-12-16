---
title: Global Functions & Operators
---

CashScript has several functions builtin for things like cryptographic and arithmetic applications. It also includes many common operators, although some important ones are notably missing due to the limitations of the underlying Bitcoin Script.

## Arithmetic functions
### abs()
```solidity
int abs(int a)
```

Returns the absolute value of argument `a`.

### min()
```solidity
int min(int a, int b)
```

Returns the minimum value of arguments `a` and `b`.

### max()
```solidity
int max(int a, int b)
```

Returns the maximum value of arguments `a` and `b`.

### within()
```solidity
bool within(int x, int lower, int upper)
```

Returns `true` if and only if `x >= lower && x < upper`.

## Hashing functions
### ripemd160()
```solidity
bytes20 ripemd160(any x)
```

Returns the RIPEMD-160 hash of argument `x`.

### sha1()
```solidity
bytes20 sha1(any x)
```

Returns the SHA-1 hash of argument `x`.

### sha256()
```solidity
bytes32 sha256(any x)
```

Returns the SHA-256 hash of argument `x`.

### hash160()
```solidity
bytes20 hash160(any x)
```

Returns the RIPEMD-160 hash of the SHA-256 hash of argument `x`.

### hash256()
```solidity
bytes32 hash256(any x)
```

Returns the double SHA-256 hash of argument `x`.

## Signature checking functions
:::caution
All signature checking functions must comply with the [NULLFAIL][bip146] rule. This means that if you want to use the output of a signature check inside the condition of an if-statement, the input signature needs to either be correct, or an empty byte array. When you use an incorrect signature as an input, the script will fail.
:::

### checkSig()
```solidity
bool checksig(sig s, pubkey pk)
```

Checks that transaction signature `s` is valid for the current transaction and matches with public key `pk`.

### checkMultiSig()
```solidity
bool checkMultiSig(sig[] sigs, pubkey[] pks)
```

Performs a multi-signature check using a list of transaction signatures and public keys.

:::note
While this function can be used inside your smart contracts, it is not supported by the JavaScript SDK, so it is recommended not to use it. Instead a `checkMultiSig()` call can be simulated using multiple `checkSig()` calls.
:::

### checkDataSig()
```solidity
bool checkDataSig(datasig s, bytes msg, pubkey pk)
```

Checks that sig `s` is a valid signature for message `msg` and matches with public key `pk`.

## Operators
An overview of all supported operators and their precedence is included below. Notable is a lack of exponentiation, since these operations are not supported by the underlying Bitcoin Script.

| Precedence | Description                         | Operator                 |
| ---------- | ----------------------------------- | ------------------------ |
| 1          | Parentheses                         | `(<expression>)`         |
| 2          | Type cast                           | `<type>(<expression>)`   |
| 3          | Object instantiation                | `new <class>(<args...>)` |
| 4          | Function call                       | `<function>(<args...>)`  |
| 5          | Tuple index                         | `<tuple>[<index>]`       |
| 6          | Member access                       | `<object>.<member>`      |
| 7          | Unary minus                         | `-`                      |
| 7          | Logical NOT                         | `!`                      |
| 8          | Multiplication, division and modulo | `*`, `/`, `%`            |
| 9          | Addition and subtraction            | `+`, `-`                 |
| 9          | String / bytes concatenation        | `+`                      |
| 10         | Numeric comparison                  | `<`, `>`, `<=`, `>=`     |
| 11         | Equality and inequality             | `==`, `!=`               |
| 12         | Bitwise AND                         | `&`                      |
| 13         | Bitwise XOR                         | `^`                      |
| 14         | Bitwise OR                          | \|                       |
| 15         | Logical AND                         | `&&`                     |
| 16         | Logical OR                          | \|\|                     |
| 17         | Assignment                          | `=`                      |

[bip146]: https://github.com/bitcoin/bips/blob/master/bip-0146.mediawiki
