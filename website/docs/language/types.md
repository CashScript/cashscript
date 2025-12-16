---
title: Types & Operators
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
`int`: Signed integer of arbitrary size (BigInt).

Operators:

- Comparisons: `<=`, `<`, `==`, `!=`, `>=`, `>` (all evaluate to `bool`)
- Arithmetic operators: `+`, `-`, unary `-`, `*`, `/`, `%` (modulo).

Note the lack of the `**` (exponentiation) operator as well as any shifting operators.

#### Number Formatting

Underscores can be used to separate the digits of a numeric literal to aid readability, e.g. `1_000_000`. Numbers can also be formatted in scientific notation, e.g. `1e6` or `1E6`. These can also be combined, e.g. `1_000e6`.

#### Division by Zero

The script will fail when the right hand side of division or modulo operations is zero.

:::caution
Contract authors should always consider whether `/` and `%` operations have division-by-zero edge cases and how this would impact contract security.
:::

#### Date Parsing
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
- `slice(int,int)`: Returns a substring from the start index up to (but excluding) the end index.
- `reverse()`: Reverses the string.

:::caution
The script will fail if `split()`or `slice()` is called with an index that is out of bounds.
:::

## Bytes
`bytes`: Byte sequence. Prefixed with `0x` to indicate hexadecimal sequence. Can optionally be bound to a byte length by specifying e.g. `bytes4`, `bytes32`, `bytes64`. It is also possible to use `byte` as an alias for `bytes1`.

Operators:

- `+` (concatenation)
- `==` (equality)
- `!=` (inequality)
- `&` (bitwise AND)
- `|` (bitwise OR)
- `^` (bitwise XOR)

Note the lack of the bitshift operators (`<<` and `>>`) as well as bitwise INVERT (`~`).

Members:

- `length`: Number of bytes in the sequence.
- `split(int)`: Splits the byte sequence at the specified index and returns a tuple with the two resulting byte sequences.
- `slice(int,int)`: Returns the part of the byte sequence from the start index up to (but excluding) the end index.
- `reverse()`: Reverses the byte sequence.

:::caution
The script will fail if `split()` or `slice()` is called with an index that is out of bounds.
:::

#### Example
```solidity
bytes mintingCapability = 0x02;
bytes noCapability = 0x;

bytes2 data = 0x12345678.slice(1, 3); // 0x3456
```

## Bytes types with semantic meaning
Some byte sequences hold specific meanings inside Bitcoin Cash contracts. These have been granted their own types, separate from the regular `bytes` type.

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
string bitcoinCash = "Bitcoin Cash";
string cash = bitcoinCash.split(8)[1];
```

:::note
It is not supported to use a variable for the tupleIndex. Instead you can assign both sides of the tuple as shown below and use either element conditional on the value of the variable.
:::

It is also possible to assign both sides of the tuple at once with a destructuring syntax:

```solidity
string hello, string world = "Hello World".split(6);
require(hello + "World" == "Hello " + world);
```

## Type Casting
Type casting can be done both explicitly and implicitly depending on the type. `pubkey`, `sig` and `datasig` can be implicitly cast to `bytes`, meaning they can be used anywhere where you would normally use a `bytes` type. Explicit type casting can be done with a broader range of types, but is still limited. The syntax of this explicit type casting is illustrated below:

#### Example
```solidity
pubkey pk = pubkey(0x0000);
bytes editedPk = bytes(pk) + 0x1234;
bytes4 zeroBytes = bytes4(0); // 0x00000000
```

### Casting Table

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

:::caution
Casting from `int` to `bool` does not currently change the value of the integer. This can have unexpected consequences in boolean comparisons.

```solidity
if (bool(7)) { ...} // This works as expected
if (bool(7) == true) { ... } // This does not work as expected
```

:::

### Int to Byte Casting

When casting integer types to bytes of a certain size, the integer value is padded with zeros, e.g. `bytes4(0) == 0x00000000`. It is also possible to pad with a variable number of zeros by passing in a `size` parameter, which indicates the size of the output, e.g. `bytes(0, 4 - 2) == 0x0000`.

:::tip
Using `bytes20 placeholderPkh= bytes20(0)` will generate a 20 byte zero-array programmatically, whereas
`bytes20 placeholderPkh= 0x0000000000000000000000000000000000000000` will actually take 20 bytes of space in your contract.
:::

Casting an integer to a fixed-size byte-length can be a very important when storing local state in an nftCommitment. When casting a script number to bytes, developers need to consider what the preferable fixed-size length is for each individual case depending on the integer range. Below we add a table with info on the maximum integer size for common cases:

| Integer Type    | Max integer value                  | Max Byte Size in Script Number Format  |
| --------------  | -----------------------------------| ---------------------------------------|
| Satoshis        | 2.1 quadrillion (21,000,000 BCH)   | 7 bytes                                |
| CashTokens      | 9.2 quintillion (`2^63 - 1`)       | 8 bytes for max supply token           |
| Locktime        | 4 bytes uInt (`2^32 - 1`)          | 5 bytes                                |
| SequenceNumber  | 4 bytes uInt (`2^32 - 1`)          | 5 bytes                                |

:::info
VM numbers follow Script Number format (A.K.A. CSCriptNum), to convert VM number to bytes or the reverse, it's recommended to use helper functions for these conversions from libraries like Libauth.
:::

### Bytes to BytesX Casting

If you do need to pad bytes to a specific length, you can convert the bytes to `int` first, and then cast to the bounded `bytes` type. This will pad the bytes with zeros to the specified length, like specified in the *Int to Byte Casting* section above.

#### Example
```solidity
bytes10 data = nftCommitment.split(10)[0];
// First convert 'bytes' type to 'int' to cast with padding
bytes20 paddedData = bytes20(int(data));
require(storedContractState == paddedData);
```

### Semantic Byte Casting

When casting unbounded `bytes` types to bounded `bytes` types (such as `bytes20` or `bytes32`), this is a purely semantic cast. The bytes are not padded with zeros, and no checks are performed to ensure the cast bytes are of the correct length. This can be helpful in certain cases, such as `LockingBytecode`, which expects a specific length input.

#### Example
```solidity
bytes pkh = tx.inputs[0].nftCommitment; // (type = bytes, content = 20 bytes)
// Typecast the variable to be able to use it for 'new LockingBytecodeP2PKH()'
bytes20 bytes20Pkh = bytes20(pkh); // (type = bytes20, content = 20 bytes)
bytes25 lockingBytecode = new LockingBytecodeP2PKH(bytes20Pkh);
```

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
