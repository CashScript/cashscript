## Contract
The `Contract` class allows you to compile CashScript files into `Contract` objects, from which these contracts can be instantiated and interacted with. These `Contract` objects can also be imported from a JSON Artifact file, and exported to one, which allows you to store and transfer the contract definition in JSON format, so you don't need to recompile the contract every time you use it. For more information on Artifacts, see the [Language Documentation](/cashscript/docs/language).

### Creating a Contract object
Before instantiating a contract, first you need to create a new `Contract` object. This can be done by compiling a CashScript file, or by importing an Artifact file that was exported previously.

#### `Contract.compile(fnOrString: string, network?: string): Contract`
If `fnOrString` is a file, compiles the CashScript file. If it is a source code string, it compiles the contract specified by the string. Optionally specify a network string (`'testnet'` or `'mainnet'`) to connect with. Returns a `Contract` object that can be further used to instantiate new instances of this contract.

**Note: If you're using CashScript in a browser-based environment, you can only use the string-based compilation**, so you have to read the file in a different way, such as the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), and pass the string into the `compile` function.

```ts
const P2PKH: Contract = Contract.compile(
  path.join(__dirname, 'p2pkh.cash'),
  'testnet'
)
```

#### `Contract.import(fnOrArtifact: string | Artifact, network?: string): Contract`
Imports an Artifact file in `.json` format that was compiled previously. This file is found at the path specified by argument `fn`. Optionally specify a network string (`'testnet'` or `'mainnet'`) to connect with. Returns a `Contract` object that can be further used to instantiate new instances of this contract.

**Note: If you're using CashScript in a browser-based environment, you cannot use the file import**, so you will have to import the artifact JSON file in a different way, such as a require statement or the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), and pass this object into the `import` function.

```ts
const P2PKH: Contract = Contract.import(
  path.join(__dirname, 'p2pkh.json'),
  'testnet'
)
```

### Exporting a contract
A `Contract` object can be exported to an Artifact file to be imported at a later moment, so it can be stored or transfered more easily, and can be used without recompilation. If the object is exported after one or more new contracts have been instantiated, their details will be stored in the file as well so they can be easily accessed later on.

#### `contract.export(fn?: string): Artifact`
Writes the contract's details to an Artifact file found at the location specified by argument `fn` and returns the object, so it can be retrieved later. If the file does not exist yet, it is created. If the file already exists, **it is overwritten**. If no `fn` arguhment is passed, just the artifact object is returned.

**Note: If you're using CashScript in a browser-based environment, you cannot export to a file**.

```ts
P2PKH.export(path.join(__dirname, 'p2pkh.json'))
```

### Instantiating a contract
After creating a `Contract` object through compilation or import, this contract can be instantiated. If any contracts were instantiated before and this information was stored, these instances can also be accessed.

#### `contract.new(...parameters: Parameter[]): Instance`
This function is derived by looking at the contract parameters specified inside the contract's CashScript file, and to call it the parameters need to match those specified in contract code.

```ts
const instance: Instance = P2PKH.new(pkh)
```

#### `contract.deployed(at?: string): Instance`
Looks up the address specified by argument `at` and returns the instance that belongs to the address if it exists. If `at` is omitted it returns the first instance that it finds.

```ts
const instance: Instance = P2PKH.deployed()
const instance: Instance = P2PKH.deployed(
  'bchtest:ppzllwzk775qk86zfskzyzae7pa9h4dvzcfezpsdkl'
)
```

## Instance
After instantiating a new contract or retrieving a previously deployed one, this instance can be interacted with using the functions implemented in the `.cash` file.

#### `instance.address`
An instance's address can be retrieved through the `address` member field.

```ts
console.log(instance.address)
```

#### `async instance.getBalance(): Promise<number>`
Returns the total balance of the contract in satoshis. This incudes confirmed and unconfirmed balance.

```ts
const contractBalance: number = await instance.getBalance()
```

#### `instance.functions.<functionName>(...parameters: Parameter[]): Transaction`
All contract functions defined in your CashScript file can be found by their name under the `functions` member field of an instance. To call them, the parameters need to match the ones defined in your CashScript file.

```ts
const tx = await instance.functions
  .spend(pk, new Sig(keypair))
  .send(instance.address, 10000)
```

**A note on transaction signatures:**

Some cash contract functions require a signature parameter, which needs to be a valid transaction signature for the current transaction. The current transaction details are unknown at the time of calling a contract function. This is why we have a separate `Sig` class made up of a keypair and an optional hashtype, that represents a placeholder for these signatures. These placeholders are automatically replaced by the correct signature during the transaction building phase.

**`new Sig(keypair: ECPair, hashtype?: HashType)`**

Creates a placeholder for a transaction signature of the current transaction. During the transaction building phase this placeholder is replaced by the actual signature. **Important**: When calling a function that uses covenant variables, the first `Sig` parameter will be used to generate and pass in the sighash preimage as parameter.

```ts
new Sig(keypair, HashType.SIGHASH_ALL)
```

## Transaction
Calling any of the contract functions on a contract instance results in a `Transaction` object, which can be sent by specifying a recipient and amount to send, or a list of these pairs. The `send` functiion calls can also be replaced by `meep` function calls to output the debug command to debug the transaction using [meep](https://github.com/gcash/meep).

The CashScript SDK supports transactions to regular addresses, as well as OP_RETURN outputs. To do so we define two different kind of outputs:

```ts
interface Recipient {
  to: string
  amount: number
}
interface OpReturn {
  opReturn: string[]
}
type Output = Recipient | OpReturn
```

#### Transaction options
Optionally, options can be passed into all `send` function documented below, which can influence the transaction.

```ts
interface TxOptions {
  time?: number
  age?: number
  fee?: number
  minChange?: number
}
```

`time` sets the transaction `locktime` field in blocks, which corresponds with the `tx.time` global CashScript variable. `age` sets the transaction `sequence` field in blocks, which corresponds with the `tx.age` global CashScript variable. `fee` sets a hardcoded transaction fee, which can be used when the smart contract depends on the transaction having a specific fee. `minChange` sets the minimal value of change that can be sent back to the contract.

#### `async transaction.send(to: string, amount: number, options?: TxOptions): Promise<TxnDetailsResult>`
Sends a transaction for an amount denoted in satoshis by argument `amount` to an address specified by argument `to`. This sends the transaction to the `rest.bitcoin.com` servers to be included in the Bitcoin Cash blockchain. Returns the raw `TxnDetailsResult` object as returned by `rest.bitcoin.com`.

```ts
const tx = await instance.functions
  .spend(pk, new Sig(keypair))
  .send(instance.address, 10000)
```

#### `async transaction.send(Output[], options?: TxOptions): Promise<TxnDetailsResult>`
Sends a transaction with multiple outputs to multiple address-amount pairs specified by the list of `{ to: string, amount: number }` objects. This sends the transaction to the `rest.bitcoin.com` servers to be included in the Bitcoin Cash blockchain. Returns the raw `TxnDetailsResult` object as returned by `rest.bitcoin.com`.

```ts
const tx = await instance.functions
  .spend(pk, new Sig(keypair))
  .send([
    { to: instance.address, amount: 10000 },
    { to: instance.address, amount: 20000 },
  ])
```

These transactions can include outputs to other addresses as well as OP_RETURN outputs:

```ts
const tx = await instance.functions
  .spend(pk, new Sig(keypair))
  .send([
    { opReturn: ['0x6d02', 'Hello World!'] },
    { to: instance.address, amount: 10000 },
  ])
```

#### `async transaction.meep(to: string, amount: number, options?: TxOptions): Promise<void>`
Prints the `meep` command that can be used to debug the transaction resulting from using the `send` function.

```ts
await instance.functions
  .spend(pk, new Sig(keypair))
  .meep(instance.address, 10000)
```

#### `async transaction.meep(Output[], options?: TxOptions): Promise<void>`
Prints the `meep` command that can be used to debug the transaction resulting from using the `send` function.

```ts
await instance.functions
  .spend(pk, new Sig(keypair))
  .meep([
    { to: instance.address, amount: 10000 },
    { to: instance.address, amount: 20000 },
  ])
```

### Transaction errors
Transactions can fail for a number of reasons. Most of these are related to the execution of the smart contract (e.g. wrong parameters or a bug in the contract code). But errors can also occur because of other reasons (e.g. a fee that's too low or a mempool conflict). To facilitate error handling in your applications, the CashScript SDK provides an enum of different "reasons" for a failure. This `Reason` enum only includes errors that are related to smart contract execution, so other reasons have to be caught separately.

Besides this `Reason` enum, there are also several error classes that can be caught and acted on:

* **`FailedRequireError`**, signifies a failed require statement. This includes any of the following reasons: `Reason.EVAL_FALSE`, `Reason.VERIFY`, `Reason.EQUALVERIFY`, `Reason.CHECKMULTISIGVERIFY`, `Reason.CHECKSIGVERIFY`, `Reason.CHECKDATASIGVERIFY`, `Reason.NUMEQUALVERIFY`.
* **`FailedTimeCheckError`**, signifies a failed timecheck using `tx.time` or `tx.age`. This includes any of the following reasons: `Reason.NEGATIVE_LOCKTIME`, `Reason.UNSATISFIED_LOCKTIME`.
* **`FailedSigCHeckError`**, signifies a failed signature check. This includes any of the following reasons: `Reason.SIG_COUNT`, `Reason.PUBKEY_COUNT`, `Reason.SIG_HASHTYPE`, `Reason.SIG_DER`, `Reason.SIG_HIGH_S`, `Reason.SIG_NULLFAIL`, `Reason.SIG_BADLENGTH`, `Reason.SIG_NONSCHNORR`.
* **`FailedTransactionError`**, signifies a general fallback error. This includes all remaining reasons listed in the `Reason` enum as well as any other reasons unrelated to the smart contract execution.

```ts
enum Reason {
  EVAL_FALSE = 'Script evaluated without error but finished with a false/empty top stack element',
  VERIFY = 'Script failed an OP_VERIFY operation',
  EQUALVERIFY = 'Script failed an OP_EQUALVERIFY operation',
  CHECKMULTISIGVERIFY = 'Script failed an OP_CHECKMULTISIGVERIFY operation',
  CHECKSIGVERIFY = 'Script failed an OP_CHECKSIGVERIFY operation',
  CHECKDATASIGVERIFY = 'Script failed an OP_CHECKDATASIGVERIFY operation',
  NUMEQUALVERIFY = 'Script failed an OP_NUMEQUALVERIFY operation',
  SCRIPT_SIZE = 'Script is too big',
  PUSH_SIZE = 'Push value size limit exceeded',
  OP_COUNT = 'Operation limit exceeded',
  STACK_SIZE = 'Stack size limit exceeded',
  SIG_COUNT = 'Signature count negative or greater than pubkey count',
  PUBKEY_COUNT = 'Pubkey count negative or limit exceeded',
  INVALID_OPERAND_SIZE = 'Invalid operand size',
  INVALID_NUMBER_RANGE = 'Given operand is not a number within the valid range [-2^31...2^31]',
  IMPOSSIBLE_ENCODING = 'The requested encoding is impossible to satisfy',
  INVALID_SPLIT_RANGE = 'Invalid OP_SPLIT range',
  INVALID_BIT_COUNT = 'Invalid number of bit set in OP_CHECKMULTISIG',
  BAD_OPCODE = 'Opcode missing or not understood',
  DISABLED_OPCODE = 'Attempted to use a disabled opcode',
  INVALID_STACK_OPERATION = 'Operation not valid with the current stack size',
  INVALID_ALTSTACK_OPERATION = 'Operation not valid with the current altstack size',
  OP_RETURN = 'OP_RETURN was encountered',
  UNBALANCED_CONDITIONAL = 'Invalid OP_IF construction',
  DIV_BY_ZERO = 'Division by zero error',
  MOD_BY_ZERO = 'Modulo by zero error',
  INVALID_BITFIELD_SIZE = 'Bitfield of unexpected size error',
  INVALID_BIT_RANGE = 'Bitfield\'s bit out of the expected range',
  NEGATIVE_LOCKTIME = 'Negative locktime',
  UNSATISFIED_LOCKTIME = 'Locktime requirement not satisfied',
  SIG_HASHTYPE = 'Signature hash type missing or not understood',
  SIG_DER = 'Non-canonical DER signature',
  MINIMALDATA = 'Data push larger than necessary',
  SIG_PUSHONLY = 'Only push operators allowed in signature scripts',
  SIG_HIGH_S = 'Non-canonical signature: S value is unnecessarily high',
  MINIMALIF = 'OP_IF/NOTIF argument must be minimal',
  SIG_NULLFAIL = 'Signature must be zero for failed CHECK(MULTI)SIG operation',
  SIG_BADLENGTH = 'Signature cannot be 65 bytes in CHECKMULTISIG',
  SIG_NONSCHNORR = 'Only Schnorr signatures allowed in this operation',
  DISCOURAGE_UPGRADABLE_NOPS = 'NOPx reserved for soft-fork upgrades',
  PUBKEYTYPE = 'Public key is neither compressed or uncompressed',
  CLEANSTACK = 'Script did not clean its stack',
  NONCOMPRESSED_PUBKEY = 'Using non-compressed public key',
  ILLEGAL_FORKID = 'Illegal use of SIGHASH_FORKID',
  MUST_USE_FORKID = 'Signature must use SIGHASH_FORKID',
}
```
