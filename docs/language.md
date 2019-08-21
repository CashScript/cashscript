# The CashScript Language
## Introduction
The CashScript language allows you to write cash contracts in a very straightforward, readable, and maintainable way. It has a syntax similar to Ethereum's [Solidity language](https://solidity.readthedocs.io/), which is the most widespread smart contract language in the greater blockchain ecosystem. While Ethereum's smart contracts can be used for almost anything, Bitcoin Cash's cash contracts are much more limited in functionality, and instead they allow you to put complex spending conditions on your currency.

Take the following example cash contract:

```solidity
contract TransferWithTimeout(
    pubkey sender,
    pubkey recipient,
    int timeout
) {
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
```

A contract in CashScript is a collection of functions that can be used to spend the funds that are locked in this contract. These contracts can be instantiated using the contract's parameters, and their functions can be called by specifying the correct function parameters. The example used above is a simple value transfer that can be claimed by the recipient before a certain timeout, after which it can be reclaimed by the original sender. To instantiate this contract, the public keys of the sender and recipient should be passed as well as a timeout in the form of a block number.

For the recipient to spend from this cash contract, they need to use the transfer function and provide a valid transaction signature using their keypair. For the sender to reclaim from this cash contract, they also need to provide a valid transaction signature using their keychain, but to the timeout function. In addition, the timeout function also checks that the block number in which this transaction is included is greater than or equal to the timeout value.

## Control structures
The only control structures are `if` and `else`, with loops and return statements left out due to their incompatibility with the underlying Bitcoin Script. If-else statements follow the usual semantics known from C or JavaScript.

Parentheses can not be omitted for conditionals, but curly brances can be omitted around single-statement bodies.

Note that there is no type conversion from non-boolean to boolean types as there is in C and JavaScript, so if (1) { ... } is not valid CashScript.

## Types
CashScript is a statically typed language, which means that the type of each variable needs to be specified. Types can interact with each other in expressions containing operators. For a quick reference of the various operators, see [Operators](#operators). Types can also be implicitly or explicitly casted to other types. For a quick reference of the various casting possibilities, see [Casting](#casting).

### Boolean
`bool`: The possible values are constants true and false.

Operators:
* `!` (logical negation)
* `&&` (logical conjunction, “and”)
* `||` (logical disjunction, “or”)
* `==` (equality)
* `!=` (inequality)

The operators `||` and `&&` don't apply common short-circuiting rules. This means that in the expression `f(x) || g(y)`, even if `f(x)` evaluates to true, `g(y)` will still be executed.

### Integer
`int`: Signed integer of 32 bit size.

Operators:
* Comparisons: `<=`, `<`, `==`, `!=`, `>=`, `>` (evaluate to `bool`)
* Arithmetic operators: `+`, `-`, unary `-`, `/`, `%` (modulo).

Note the clear lack of the `*` and `**` (exponentation) operators as well as any bitwise operators.

While integer sizes are limited to 32 bits, the output of arithmetic operations can exceed this size. This will not result in an overflow, but instead the script will fail when using this value in another integer operation. Division and modulo operations will fail if the right hand side of the expression is zero.

### String
`string`: ASCII-encoded byte sequence.

Operators:
* `+` (concatenation)
* `==` (equality)
* `!=` (inequality)

Members:
* `length`: Number of characters that represent the string.
* `split(int)`: Splits the string at the specified character and returns a tuple with the two resulting strings.

### Bytes
`bytes`, `bytes20`, `bytes32`: Byte sequence, optionally bound to 20 or 32 bytes, which typically represent hashes.

Operators:
* `+` (concatenation)
* `==` (equality)
* `!=` (inequality)

Members:
* `length`: Number of characters that represent the string.
* `split(int)`: Splits the string at the specified character and returns a tuple with the two resulting strings.

### Pubkey
`pubkey`: Byte sequence representing a public key.

Operators:
* `==` (equality)
* `!=` (inequality)

### Sig
`sig`: Byte sequence representing a transaction signature.

Operators:
* `==` (equality)
* `!=` (inequality)

### Datasig
`datasig`: Byte sequence representing a data signature.

Operators:
* `==` (equality)
* `!=` (inequality)

### Array & Tuple
These types are not assignable, and only have very specific uses within CashScript.

Arrays are only able to be passed into `checkMultisig` functions using the following syntax:

```
checkMultisig([sig1, sig2], [pk1, pk2, pk3]);
```

Tuples can only arise by using the `split` member function on a `string` or a `bytes` type. Their first or second element can be accessed through a familiar array indexing syntax:

```
string question = "What is Bitcoin Cash?";
string answer = question.split(15)[0].split(8)[1];
```

## Functions & Globals
### Arithmetic functions
##### `int abs(int a)`
Returns the absolute value of argument `a`.

##### `int min(int a, int b)`
Returns the minimum value of arguments `a` and `b`.

##### `int max(int a, int b)`
Retuns the maximum value of arguments `a` and `b`.

##### `bool within(int x, int lower, int upper)`
Returns `true` if and only if `x >= lower && x < upper`.

### Hashing functions
##### `bytes20 ripemd160(any x)`
Returns the RIPEMD-160 hash of argument `x`.

##### `bytes32 sha1(any x)`
Returns the SHA-1 hash of argument `x`.

##### `bytes32 sha256(any x)`
Returns the SHA-256 hash of argument `x`.

##### `bytes20 hash160(any x)`
Returns the RIPEMD-160 hash of the SHA-256 hash of argument `x`.

##### `bytes32 hash256(any x)`
Returns the double SHA-256 hash of argument `x`.

### Signature checking functions

##### `bool checksig(sig s, pubkey pk)`
Checks that transaction signature `s` is valid for the current transaction and matches with public key `pk`.

##### `bool checkMultiSig(sig[] sigs, pubkey[] pks)`
Performs a multi-signature check using a list of transaction signatures and public keys.

**Note**: While this function is compiled correctly and can be used, it is not supported by the JavaScript SDK, so it is recommended not to use `checkMultiSig` at the moment.

##### `bool checkDataSig(datasig s, bytes msg, pubkey pk)`
Checks that sig `s` is a valid signature for message `msg` and matches with public key `pk`.

### Error handling
##### `void require(bool condition)`
Asserts that boolean expression `condition` evaluates to `true`. If it evaluates to `false`, the script fails. As this function has a `void` return type, it can only be used as a standalone statement.

### Global variables
##### `tx.time`
Represents the block number that the transaction is included in. It can also represent the timestamp of the transaction when so configured in the transaction. The JavaScript SDK only has support for block number right now though, so it is recommended to only use it as the block number.

Due to limitations in the underlying Bitcoin Script, `tx.time` can only be used in the following way:

```solidity
require(tx.time >= <expression>);
```

##### `tx.age`
Represents the block depth of the utxo that is being spent by the current transaction. It can also represent the utxo's age in seconds when so configured in the transaction. The JavaScript SDK only has support for block depth right now though so it is recommended to only use it as the block depth.

Due to limitations in the underlying Bitcoin Script, `tx.age` can only be used in the following way:

```solidity
require(tx.age >= <expression>);
```

## Operators
| Precedence | Description                     | Operator                |
|------------|---------------------------------|-------------------------|
| 1          | Parentheses                     | `(<expression>)`        |
| 2          | Type cast                       | `<type>(<expression>)`  |
| 3          | Function call                   | `<function>(<args...>)` |
| 4          | Tuple index                     | `<tuple>[<index>]`      |
| 5          | Member access                   | `<object>.<member>`     |
| 6          | Postfix increment and decrement | `++`, `--`              |
| 7          | Unary minus                     | `-`                     |
| 7          | Logical NOT                     | `!`                     |
| 8          | Division and modulo             | `/`, `%`                |
| 9          | Addition and subtraction        | `+`, `-`                |
| 9          | String / bytes concatenation    | `+`                     |
| 10         | Numeric comparison              | `<`, `>`, `<=`, `>=`    |
| 11         | Equality and inequality         | `==`, `!=`              |
| 12         | Logical AND                     | `&&`                    |
| 13         | Logical OR                      | `\|\|`                  |
| 14         | Assignment                      | `=`                     |

## Casting
Type casting is done using a syntax similar to function calls, but using a type name instead of a function name:
```solidity
pubkey pk = pubkey(0x0000);
```

See the following table for information on which types can be cast to other which other types.

| Type    | Implicitly castable to | Explicitly castable to             |
|---------|------------------------|------------------------------------|
| int     |                        | bytes, bytes20, bytes32, bool      |
| bool    |                        | int                                |
| string  |                        | bytes                              |
| bytes   |                        | bytes20, bytes32, sig, pubkey, int |
| bytes20 | bytes, bytes32         | bytes, bytes32                     |
| bytes32 | bytes                  | bytes                              |
| pubkey  | bytes                  | bytes                              |
| sig     | bytes                  | bytes, datasig                     |
| datasig | bytes                  | bytes                              |

## Artifacts
Compiled cash contracts can be represented by so-called artifacts. These artifacts can be stored in `.json` files so they can be shared and stored for later usage without recompilation. These artifacts allow any third-party SDKs to be developed, as they only need to be able to import and use an artifact file, while leaving the compilation to the `cashc` command line tool.

### Artifact specification
```ts
interface Artifact {
  contractName: string; // Contract name
  constructorInputs: AbiInput[]; // Arguments required to instantiate a contract
  abi: AbiFunction[]; // functions that can be called
  bytecode: string; // Compiled Script without constructor parameters added (in ASM format)
  source: string; // Source code of the CashScript contract
  networks: { // Dictionary per network (testnet / mainnet)
    [network: string]: { // Dictionary of contract addresses with the corresponding compiled script (in ASM format)
      [address: string]: string;
    };
  };
  compiler: {
    name: string; // Compiler used to compile this contract
    version: string; // Compiler version used to compile this contract
  }
  updatedAt: string; // Last datetime this artifact was updated (in ISO format)
}

interface AbiInput {
  name: string; // Input name
  type: string; // Input type (see language documentation)
}

interface AbiFunction {
  name: string; // Function name
  inputs: AbiInput[]; // Function inputs / parameters
}
```

## Examples
For example real world uses of these functions and cash contracts check out the [examples folder](/examples/). This folder contains several example contracts as `.cash` files, and example SDK usage in the `.ts` files.
