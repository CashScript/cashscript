---
title: Types
---

CashScript is a statically typed language, which means that the type of each variable needs to be specified. Types can also be implicitly or explicitly cast to other types. For a quick reference of the various casting possibilities, see [Type Casting](#type-casting).

## Boolean
`bool`: The possible values are constants `true` and `false`.

Operators:

- `!` (logical negation)
- `&&` (logical conjunction, “and”)
- `||` (logical disjunction, “or”)
- `==` (equality)
- `!=` (inequality)

:::note
The operators `||` and `&&` don't apply common short-circuiting rules. This means that in the expression `f(x) || g(y)`, `g(y)` will still be executed even if `f(x)` evaluates to true.
:::

## Integer
`int`: Signed integer of 64 bit size.

Operators:

- Comparisons: `<=`, `<`, `==`, `!=`, `>=`, `>` (all evaluate to `bool`)
- Arithmetic operators: `+`, `-`, unary `-`, `*`, `/`, `%` (modulo).

Note the clear lack of the `**` (exponentiation) operator as well as any bitwise operators.

:::caution
The script will fail when the right hand side of Division and modulo operations is zero.
:::

### Date Parsing
Dates and times are always represented as integers. To get the UTC timestamp of a date use the built-in parser to avoid any potential errors. This will take a date in the format `date("YYYY-MM-DDThh:mm:ss")` and convert it to an integer timestamp.

#### Example

```solidity
int timestamp = date("2021-02-17T01:30:00");
require(timestamp == 1613554200);
```


## String
`string`: UTF8-encoded byte sequence.

Operators:

- `+` (concatenation)
- `==` (equality)
- `!=` (inequality)

Members:

- `length`: Number of characters in the string.
- `split(int)`: Splits the string at the specified index and returns a tuple with the two resulting strings.
- `reverse()`: Reverses the string.

:::caution
The script will fail if `split()` is called with an index that is out of bounds.
:::

## Bytes
`bytes`: Byte sequence. Can optionally be bound to a byte length by specifying e.g. `bytes4`, `bytes32`, `bytes64`. It is also possible to use `byte` as an alias for `bytes1`.

Operators:

- `+` (concatenation)
- `==` (equality)
- `!=` (inequality)

Members:

- `length`: Number of bytes in the sequence.
- `split(int)`: Splits the byte sequence at the specified index and returns a tuple with the two resulting byte sequences.
- `reverse()`: Reverses the byte sequence.

:::caution
The script will fail if `split()` is called with an index that is out of bounds.
:::

## Bytes types with semantic meaning
Some byte sequences hold specific meanings inside Bitcoin Cash contracts. These have been granted their own types separate from the regular `bytes` type.

### Public Key
`pubkey`: Byte sequence representing a public key. Generally 33 bytes long.

Operators:

- `==` (equality)
- `!=` (inequality)

### Transaction Signature
`sig`: Byte sequence representing a transaction signature. Generally 65 bytes long.

Operators:

- `==` (equality)
- `!=` (inequality)

### Data Signature
`datasig`: Byte sequence representing a data signature. Generally 64 bytes long.

Operators:

- `==` (equality)
- `!=` (inequality)

## Array
Arrays are not assignable and can only be used with the `checkMultisig` function using the following syntax:

```solidity
checkMultisig([sig1, sig2], [pk1, pk2, pk3]);
```

## Tuple
Tuples are the type that is returned when calling the `split` member function on a `string` or `bytes` type. Their first or second element can be accessed through an indexing syntax similar to other languages:

```solidity
string question = "What is Bitcoin Cash?";
string answer = question.split(15)[0].split(8)[1];
```

It is also possible to assign both sides of the tuple at once with a destructuring syntax:

```solidity
string bitcoin, string cash = "BitcoinCash".split(7);
require(bitcoin == cash);
```

## Type Casting
Type casting can be done both explicitly and implicitly as illustrated below. `pubkey`, `sig` and `datasig` can be implicitly cast to `bytes`, meaning they can be used anywhere where you would normally use a `bytes` type. Explicit type casting can be done with a broader range of types, but is still limited. The syntax of this explicit type casting is illustrated below. Note that you can also cast to bounded `bytes` types.

:::note
When casting integer types to bytes of a certain size, the integer value is padded with zeros. e.g. `bytes4(0) == 0x00000000`. It is also possible to pad with a variable number of zeros, by passing in a `size` parameter, which indicates the size of the output. e.g. `bytes(0, 4 - 2) == 0x0000`.
:::

:::caution
When casting bytes types to integer, you should be sure that the bytes value fits inside a 64-bit signed integer, or the script will fail.
:::

See the following table for information on which types can be cast to other which other types.

| Type    | Implicitly castable to | Explicitly castable to             |
| ------- | ---------------------- | ---------------------------------- |
| int     |                        | bytes, bool                        |
| bool    |                        | int                                |
| string  |                        | bytes                              |
| bytes   |                        | sig, pubkey, int                   |
| pubkey  | bytes                  | bytes                              |
| sig     | bytes                  | bytes                              |
| datasig | bytes                  | bytes                              |

#### Example
```solidity
pubkey pk = pubkey(0x0000);
bytes editedPk = bytes(pk) + 0x1234;
bytes4 integer = bytes4(25);
```
