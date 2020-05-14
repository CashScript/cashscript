## Introduction
The CashScript language allows you to write Bitcoin Cash contracts in a straightforward, readable, and maintainable way. It has a syntax similar to Ethereum's [Solidity language](https://solidity.readthedocs.io/), which is the most widespread smart contract language in the greater blockchain ecosystem.

## Structure of a contract file
Take the following example contract:

```solidity
pragma cashscript ^0.3.0;

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

A contract file may start with a pragma directive to indicate the language version the contract was written for. This ensures that a contract is not compiled using the wrong compiler version, which can cause unintended effects. The pragma directive follows regular [semantic versioning rules](https://semver.npmjs.com/).

A contract in CashScript is a collection of functions that can be used to spend the funds that are locked in this contract. These contracts can be instantiated using the contract's parameters, and their functions can be called by specifying the correct function parameters. The example used above is a simple value transfer that can be claimed by the recipient before a certain timeout, after which it can be reclaimed by the original sender. To instantiate this contract, the public keys of the sender and recipient should be passed as well as a timeout in the form of a block number.

For the recipient to spend from this contract, they need to use the transfer function and provide a valid transaction signature using their keypair. For the sender to reclaim from this contract, they also need to provide a valid transaction signature using their keychain, but to the timeout function. In addition, the timeout function also checks that the block number in which this transaction is included is greater than or equal to the timeout value.

## Control structures
The only control structures are `if` and `else`, with loops and return statements left out due to their incompatibility with the underlying Bitcoin Script. If-else statements follow the usual semantics known from C or JavaScript.

Parentheses can not be omitted for conditionals, but curly braces can be omitted around single-statement bodies.

Note that there is no type conversion from non-boolean to boolean types as there is in C and JavaScript, so `if (1) { ... }` is not valid CashScript and should instead be written as `if (bool(1)) { ... }`.

## Comments
Comments can be added anywhere in the contract file. Comment semantics are similar to languages like JavaScript or C. This means that single-line comments can be added with `// ...`, while multiline comments can be added with `/* ... */`.

## Types
CashScript is a statically typed language, which means that the type of each variable needs to be specified. Types can interact with each other in expressions containing operators. For a quick reference of the various operators, see [Operators](/cashscript/docs/language#operators). Types can also be implicitly or explicitly casted to other types. For a quick reference of the various casting possibilities, see [Casting](/cashscript/docs/language#casting).

### Boolean
`bool`: The possible values are constants true and false.

Operators:

- `!` (logical negation)
- `&&` (logical conjunction, “and”)
- `||` (logical disjunction, “or”)
- `==` (equality)
- `!=` (inequality)

The operators `||` and `&&` don't apply common short-circuiting rules. This means that in the expression `f(x) || g(y)`, even if `f(x)` evaluates to true, `g(y)` will still be executed.

### Integer
`int`: Signed integer of 32 bit size.

Operators:

- Comparisons: `<=`, `<`, `==`, `!=`, `>=`, `>` (all evaluate to `bool`)
- Arithmetic operators: `+`, `-`, unary `-`, `/`, `%` (modulo).

Note the clear lack of the `*` and `**` (exponentation) operators as well as any bitwise operators.

While integer sizes are limited to 32 bits, the output of arithmetic operations can exceed this size. This will not result in an overflow, but instead the script will fail when using this value in another integer operation. Division and modulo operations will fail if the right hand side of the expression is zero.

### String
`string`: ASCII-encoded byte sequence.

Operators:

- `+` (concatenation)
- `==` (equality)
- `!=` (inequality)

Members:

- `length`: Number of characters that represent the string.
- `split(int)`: Splits the string at the specified index and returns a tuple with the two resulting strings.

### Bytes
`bytes`: Byte sequence. Can optionally be bound to a certain byte length by specifying e.g. `bytes5`, `bytes32`, etc.

Operators:

- `+` (concatenation)
- `==` (equality)
- `!=` (inequality)

Members:

- `length`: Number of bytes in the sequence.
- `split(int)`: Splits the byte sequence at the specified index and returns a tuple with the two resulting byte sequences.

### Pubkey
`pubkey`: Byte sequence representing a public key.

Operators:

- `==` (equality)
- `!=` (inequality)

### Sig
`sig`: Byte sequence representing a transaction signature.

Operators:

- `==` (equality)
- `!=` (inequality)

### Datasig
`datasig`: Byte sequence representing a data signature.

Operators:

- `==` (equality)
- `!=` (inequality)

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

## Variables
Variables can be declared by specifying their type and their name. All variables need to be initialised at their time of declaration, but they can be reassigned later on, so it is possible to specifically initialise variables to zero. Since CashScript is strongly typed and has no type inference, it is not possible to use keywords such as `var` or `let` to declare variables, as might be possible in different languages such as JavaScript.

```
int myNumber = 3000;
string myString = 'Bitcoin Cash';
```

## Functions & Globals
### Arithmetic functions
#### `int abs(int a)`
Returns the absolute value of argument `a`.

#### `int min(int a, int b)`
Returns the minimum value of arguments `a` and `b`.

#### `int max(int a, int b)`
Retuns the maximum value of arguments `a` and `b`.

#### `bool within(int x, int lower, int upper)`
Returns `true` if and only if `x >= lower && x < upper`.

### Hashing functions
#### `bytes20 ripemd160(any x)`
Returns the RIPEMD-160 hash of argument `x`.

#### `bytes32 sha1(any x)`
Returns the SHA-1 hash of argument `x`.

#### `bytes32 sha256(any x)`
Returns the SHA-256 hash of argument `x`.

#### `bytes20 hash160(any x)`
Returns the RIPEMD-160 hash of the SHA-256 hash of argument `x`.

#### `bytes32 hash256(any x)`
Returns the double SHA-256 hash of argument `x`.

### Signature checking functions
**Note:** All signature checking functions must comply with the [NULLFAIL](https://github.com/bitcoin/bips/blob/master/bip-0146.mediawiki) rule. This rule implies that if you want to use the output of a signature check inside the condition of an if-statement, the input signature needs to either be correct, or an empty byte array. When you use a valid but incorrect signature as in input, the script will fail immediately.

#### `bool checksig(sig s, pubkey pk)`
Checks that transaction signature `s` is valid for the current transaction and matches with public key `pk`.

#### `bool checkMultiSig(sig[] sigs, pubkey[] pks)`
Performs a multi-signature check using a list of transaction signatures and public keys.

**Note**: While this function is compiled correctly and can be used, it is not supported by the JavaScript SDK, so it is recommended not to use `checkMultiSig` at the moment.

#### `bool checkDataSig(datasig s, bytes msg, pubkey pk)`
Checks that sig `s` is a valid signature for message `msg` and matches with public key `pk`.

### Error handling
#### `void require(bool condition)`
Asserts that boolean expression `condition` evaluates to `true`. If it evaluates to `false`, the script fails. As this function has a `void` return type, it can only be used as a standalone statement.

### Units
An integer literal can take a suffix of either monetary or temporary units to add smeantic value to these integers and to simplify arithmetic. When these units are used, the underlying integer is automatically multiplied by the value of the unit. The units `sats`, `finney`, `bits` and `bitcoin` are used to denote monetary value, while the units `seconds`, `minutes`, `hours`, `days` and `weeks` are used to denote time.

```
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

Be careful when using these units in precise calendar calculations though, because not every year equals 365 days and not even every minute has 60 seconds because of [leap seconds](https://en.wikipedia.org/wiki/Leap_second).

### Global time variables
#### `tx.time`
Represents the block number that the transaction is included in. It can also represent the timestamp of the transaction when so configured in the transaction. The JavaScript SDK only has support for block number right now though, so it is recommended to only use it as the block number.

Due to limitations in the underlying Bitcoin Script, `tx.time` can only be used in the following way:

```solidity
require(tx.time >= <expression>);
```

#### `tx.age`
Represents the block depth of the utxo that is being spent by the current transaction. It can also represent the utxo's age in seconds when so configured in the transaction. The JavaScript SDK only has support for block depth right now though so it is recommended to only use it as the block depth.

Due to limitations in the underlying Bitcoin Script, `tx.age` can only be used in the following way:

```solidity
require(tx.age >= <expression>);
```

### Global covenant variables
Covenant variables are used to put constraints on the money inside the smart contract. This can be used to limit the addresses where money can be sent for example.

This technique works by passing the sighash preimage into the smart contract and extracting the individual fields. Because this sighash preimage needs to be verified, **it is mandatory** to include a `require(checkSig(sig, pubkey));` statement anywhere in the code when using these covenant variables. This statement will be used by the compiler to verify the validity of the passed preimage. Using the CashScript SDK, this preimage is passed in automatically by the SDK, but when constructing transactions manually, be sure to include the preimage as a parameter.

See [BIP143](https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#specification) and [Bitcoin Cash replay protected sighash](https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/replay-protected-sighash.md#digest-algorithm) for more technical documentation of the contents of all covenant variables. Note that the explanation of the variables below are using the default `hashtype` of `0x41`. Other hashtypes might assign different meaning to these variables. If it is important to use a specific hashtype, this can be enforced with `require(tx.hashtype == 0x41);`.

#### `tx.version (bytes4)`
Represents the version of the current transaction. Different transaction versions can have differences in functionality. Currently only version 1 and 2 exist, where only version 2 has support for [BIP68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki). Note that `tx.version` is of type `bytes4` so to use it as an integer it needs to be cast to `int`: `int(tx.version)`.

#### `tx.hashPrevouts (bytes32)`
Represents the double sha256 of the serialisation of all input outpoints.

#### `tx.hashSequence (bytes32)`
Represents the double sha256 of the serialisation of `nSequence` of all inputs.

#### `tx.outpoint (bytes36)`
Represents the outpoint of the current input (`bytes32` txid concatenated with `bytes4` vout).

#### `tx.bytecode (bytes)`
Represents the Bitcoin Script bytecode of the current contract. This can be used to enforce sending money back to the contract in combination with `tx.hashOutputs`.

```solidity
bytes32 output = new OutputP2SH(bytes8(10000), hash160(tx.bytecode));
require(hash256(output) == tx.hashOutputs);
```

#### `tx.value (bytes8)`
Represents the value of current input being spent. This can be used to enforce the full balance or a specific part of the contract's balance to be spent. Note that `tx.value` is of type `bytes8`, which is over the size limit for casting to integer, so to cast it to an integer it needs to be cast through a regular `bytes` type: `int(bytes(tx.value))`. Due to technical limitations, this can only work if `tx.value` fits within a 32-bit signed integer (max ~21 BCH).

#### `tx.sequence (bytes4)`
Represents the `nSequence` field of the current input.

#### `tx.hashOutputs (bytes32)`
Represents the double sha256 of the serialisation of all outputs (`bytes8` amount + `bytes` locking script). Can be used to enforce sending specific amounts to specific addresses.

```solidity
bytes34 out1 = new OutputP2PKH(bytes8(10000), pkh);
bytes32 out2 = new OutputP2SH(bytes8(10000), hash160(tx.bytecode));
require(hash256(out1 + out2) == tx.hashOutputs);
```

#### `tx.locktime (bytes4)`
Represents the `nLocktime` field of the current input.

#### `tx.hashtype (bytes4)`
Represents the hashtype used for the generation of the sighash and signature. Can be used to enforce that the spender uses a specific hashtype. See [replay protected sighash](https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/replay-protected-sighash.md#digest-algorithm) for the implications of different hashtypes.

## Object instantiation
To assist with enforcing outputs, there are output variables that can be instantiated. These outputs can then be used together with `tx.hashOutputs` to enforce sending to these outputs. See the documentation for `tx.hashOutputs` in the section above.

#### `new OutputP2PKH(bytes8 amount, bytes20 pkh): bytes34`
Creates new P2PKH output serialisation for an output sending `amount` to `pkh`.

#### `new OutputP2SH(bytes8 amount, bytes20 scriptHash): bytes32`
Creates new P2SH output serialisation for an output sending `amount` to `scriptHash`.

#### `new OutputNullData(bytes[] chunks): bytes`
Creates new OP_RETURN output serialisation for an output containing an OP_RETURN script with `chunks`.

## Operators
| Precedence | Description                     | Operator                 |
| ---------- | ------------------------------- | ------------------------ |
| 1          | Parentheses                     | `(<expression>)`         |
| 2          | Type cast                       | `<type>(<expression>)`   |
| 3          | Object instantiation            | `new <class>(<args...>)` |
| 4          | Function call                   | `<function>(<args...>)`  |
| 5          | Tuple index                     | `<tuple>[<index>]`       |
| 6          | Member access                   | `<object>.<member>`      |
| 7          | Postfix increment and decrement | `++`, `--`               |
| 8          | Unary minus                     | `-`                      |
| 8          | Logical NOT                     | `!`                      |
| 9          | Division and modulo             | `/`, `%`                 |
| 10         | Addition and subtraction        | `+`, `-`                 |
| 10         | String / bytes concatenation    | `+`                      |
| 11         | Numeric comparison              | `<`, `>`, `<=`, `>=`     |
| 12         | Equality and inequality         | `==`, `!=`               |
| 13         | Logical AND                     | `&&`                     |
| 14         | Logical OR                      | `||`                     |
| 15         | Assignment                      | `=`                      |

## Casting
Type casting is done using a syntax similar to function calls, but using a type name instead of a function name.

```solidity
pubkey pk = pubkey(0x0000);
```

See the following table for information on which types can be cast to other which other types.

| Type    | Implicitly castable to | Explicitly castable to             |
| ------- | ---------------------- | ---------------------------------- |
| int     |                        | bytes, bool                        |
| bool    |                        | int                                |
| string  |                        | bytes                              |
| bytes   |                        | sig, pubkey, int                   |
| pubkey  | bytes                  | bytes                              |
| sig     | bytes                  | bytes, datasig                     |
| datasig | bytes                  | bytes                              |

## Artifacts
Compiled cash contracts can be represented by so-called artifacts. These artifacts are stored in `.json` files so they can be shared and stored for later usage without recompilation. These artifacts allow any third-party SDKs to be developed, as they only need to be able to import and use an artifact file, while leaving the compilation to the `cashc` command line tool.

### Artifact specification
```ts
interface Artifact {
  contractName: string // Contract name
  constructorInputs: AbiInput[] // Arguments required to instantiate a contract
  abi: AbiFunction[] // functions that can be called
  bytecode: string // Compiled Script without constructor parameters added (in ASM format)
  source: string // Source code of the CashScript contract
  networks: {
    // Dictionary per network (testnet / mainnet)
    [network: string]: {
      // Dictionary of contract addresses with the corresponding compiled script (in ASM format)
      [address: string]: string
    }
  }
  compiler: {
    name: string // Compiler used to compile this contract
    version: string // Compiler version used to compile this contract
  }
  updatedAt: string // Last datetime this artifact was updated (in ISO format)
}

interface AbiInput {
  name: string // Input name
  type: string // Input type (see language documentation)
}

interface AbiFunction {
  name: string // Function name
  covenant: boolean // Does this function use covenant variables
  inputs: AbiInput[] // Function inputs / parameters
}
```
