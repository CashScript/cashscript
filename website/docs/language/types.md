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
- Arithmetic shift operators: `<<`, `>>` (left and right shift)

Note the lack of the `**` (exponentiation).

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
The script will fail if `split()` or `slice()` is called with an index that is out of bounds.
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
- `<<` (bitwise left shift)
- `>>` (bitwise right shift)
- `~` (bitwise inversion)

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
bool b = bool(5); // true
```

### Casting Table

See the following table for information on which types can be cast to other which other types.

| Type    | Implicitly castable to | Explicitly castable to             |
| ------- | ---------------------- | ---------------------------------- |
| int     |                        | bytes, bool                        |
| bool    |                        | int                                |
| string  |                        | bytes                              |
| bytes   |                        | sig, datasig, pubkey, int          |
| pubkey  | bytes                  | bytes                              |
| sig     | bytes                  | bytes                              |
| datasig | bytes                  | bytes                              |

### Semantic Bytes Casting

When casting unbounded `bytes` types to bounded `bytes` types (such as `bytes20` or `bytes32`), this is a purely semantic cast. The bytes are not padded with zeros, and no checks are performed to ensure the cast bytes are of the correct length. This is why this cast is marked with the `unsafe_` prefix. This can be helpful in certain cases, such as `LockingBytecode`, which expects a specific length input.

#### Example
```solidity
bytes pkh = tx.inputs[0].nftCommitment; // (type = bytes, content = 20 bytes)
// Typecast the variable to be able to use it for 'new LockingBytecodeP2PKH()'
bytes20 bytes20Pkh = unsafe_bytes20(pkh); // (type = bytes20, content = 20 bytes)
bytes25 lockingBytecode = new LockingBytecodeP2PKH(bytes20Pkh);
```

### Other Semantic Casting
When casting a `bytes` to an `int` or when casting an `int` to a `bool`, opcodes are added to the script to perform a conversion between the two types. If you are an advanced user and want to perform these casts without the added opcodes, you can use the `unsafe_` prefix.

#### Example
```solidity
bytes bytesValue = 0x123456000000; // not a valid minimally encoded integer

int(bytesValue); // (type = int, content = 0x123456)
unsafe_int(bytesValue); // (type = int, content = 0x123456000000)

int intValue = 25;

bool(intValue); // (type = bool, content = true / 0x01)
unsafe_bool(intValue); // (type = bool, content = 25 / 0x19)
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
| 7          | Bitwise inversion                   | `~`                      |
| 8          | Multiplication, division and modulo | `*`, `/`, `%`            |
| 9          | Addition and subtraction            | `+`, `-`                 |
| 9          | String / bytes concatenation        | `+`                      |
| 10         | Bitwise / Arithmetic shift          | `<<`, `>>`               |
| 11         | Numeric comparison                  | `<`, `>`, `<=`, `>=`     |
| 12         | Equality and inequality             | `==`, `!=`               |
| 13         | Bitwise AND                         | `&`                      |
| 14         | Bitwise XOR                         | `^`                      |
| 15         | Bitwise OR                          | `\|`                     |
| 16         | Logical AND                         | `&&`                     |
| 17         | Logical OR                          | `\|\|`                   |
| 18         | Assignment                          | `=`                      |
