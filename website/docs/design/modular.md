---
title: Modular Contract Design
sidebar_label: Modular Contract Design
---

A single CashScript contract can only grow so far. Its bytecode is capped at [10,000 bytes](/docs/compiler/script-limits#maximum-contract-size-p2sh), every function it contains is paid for in every transaction that spends it, and a single UTXO can only be spent by one transaction at a time. Contract systems that outgrow these limits are split into multiple smaller contracts, each living in its own UTXO, which are combined in a single transaction when needed. This is called **modular contract design**.

CashTokens are what make this possible. A contract UTXO can carry an NFT that identifies it, so the other contracts in the same transaction can verify they are dealing with the real thing, and the NFT commitment gives each contract a place to keep state. Production systems such as [ParyonUSD][paryon], [Moria][moria] and [BCH Pump][bchpump] are built this way, and the [Jedex][jedex] demonstration introduced much of the vocabulary used on this page.

:::tip
This page builds on [Covenants & Introspection](/docs/design/covenants) and [CashTokens](/docs/design/cashtokens). Read those first if NFT capabilities, commitments or local state are new to you.
:::

## Why Split a Contract System

- **Transaction size and cost.** With everything in one contract, each transaction carries the full bytecode, including all the functions it does not call. When the logic is spread over multiple contracts, a transaction only includes the logic it actually uses. The [operation cost](/docs/compiler/script-limits#operation-cost-limit) budget is per input as well, so a system of small contracts can do far more work in one transaction than a single large one.
- **Readability and auditability.** A contract that does one thing is easier to write, review and test than a contract with ten functions sharing one state layout.
- **Concurrency.** Users only contend on the UTXO that holds shared state. Contracts that do not touch shared state can be duplicated freely, as described in [Contract Concurrency](/docs/design/concurrency).
- **Composability.** Authority in a modular system is expressed as tokens, and tokens can be held by other contracts. That lets you plug in a multisig, a timelock or a whole other protocol without changing the contracts that check the authority.

Modularity is not free. Every extra contract in a transaction is an extra input and output, with its own dust amount and its own recreation checks, and the transaction building on the client side grows accordingly. For a contract with a handful of functions that fits comfortably, a single contract is simpler and cheaper. Start by removing duplication with [user-defined functions and global constants](/docs/design/optimization#sharing-code-with-functions-and-constants), and only split up when the contract is still too large, too expensive or too contended.

## Contracts as Transaction Inputs

Bitcoin Cash validates every input of a transaction independently, but each input can inspect the whole transaction through [introspection](/docs/language/globals#introspection-variables). A modular system spends several contract UTXOs in one transaction, and each of them checks its own slice of the rules plus the presence of the others. The transaction is only valid if every contract is satisfied.

Each contract in such a transaction is responsible for two things:

1. **Authentication** of its neighbours: the inputs it relies on must really be the contracts it expects.
2. **Continuation** of itself: if it should still exist after the transaction, it must check that it is recreated correctly in the outputs, since nothing else will.

Authentication is the only thing a contract needs to do about the other contracts. Continuation is its own business, although a top-level covenant may leave the details of its continuation, such as its new state, to the function contract it delegates to.

### Authenticating by Locking Bytecode or by Token

The obvious way to recognise another contract is by its locking bytecode: instantiate the other contract first and pass its `lockingBytecode` as a constructor argument, as shown in the [deployment guide](/docs/guides/deployment#constructor-arguments). This proves that an input runs specific *code*, but it has two shortcomings in a modular system:

- Anyone can send funds to a contract address, so a matching locking bytecode does not prove that the input is the *instance* you deployed. A fake copy of your treasury with an empty balance has exactly the same locking bytecode as the real one.
- It cannot express mutual dependencies. If contract A embeds B's bytecode and B embeds A's, each address depends on the other and neither can be computed.

Token categories solve both problems. A token category can only be created in a [genesis transaction](/docs/guides/deployment#token-ids-and-vout0-utxos), and new NFTs of that category can only be created by a minting NFT. Nobody can forge a token of your category, so **holding a token of the category proves membership of the system**. And since the category ID is known before any contract is instantiated, every contract can take it as a constructor argument without creating a dependency cycle.

### Tracking NFTs

The NFT a contract UTXO carries to identify itself is called its **tracking NFT**. Each of its fields carries meaning:

| Field | Meaning in a modular system |
| ----- | --------------------------- |
| Category | Which system the contract belongs to. |
| Capability | What the contract is allowed to do: `minting` for contracts that create new tokens, `mutable` for contracts that update their state, `none` for contracts whose identity and state never change. |
| Commitment | Which contract this is within the system (an identifier), its state, or both. |

The `tokenCategory` introspection value [includes the capability](/docs/design/cashtokens#tokencategory-contains-the-nft-capability), so a single comparison authenticates the category and the capability at once:

```solidity
// The treasury: a mutable NFT of the system category
require(tx.inputs[0].tokenCategory == category + 0x01);

// A function contract: an immutable NFT of the system category, with a one-byte identifier
require(tx.inputs[1].tokenCategory == category);
require(tx.inputs[1].nftCommitment == 0x02);
```

Because identity lives in the token rather than in the address, a contract does not even need to know its own category. It can read it from its own tracking NFT, as the treasury below does.

### Recreating Contracts

The continuation check compares the recreated output with the spent input. The [ParyonUSD safety checklist][paryon-safety] lists five properties to check on the recreated output: `lockingBytecode`, `tokenCategory` (which covers the capability), `nftCommitment`, `value` and `tokenAmount`. Which of them may change depends on the contract. A function contract is recreated exactly, a stateful contract updates its commitment, a treasury also changes its value. The `tokenAmount` check can be skipped for categories without fungible tokens.

These checks repeat in every contract of a system, which makes them a natural [shared function](/docs/language/contracts#importing-functions-and-constants-from-other-files) imported by all of them:

```solidity title="shared.cash"
// Require that the UTXO at `index` is recreated unchanged at the same output index
function isRecreatedUnchanged(int index) returns (bool) {
    require(tx.outputs[index].lockingBytecode == tx.inputs[index].lockingBytecode);
    require(tx.outputs[index].tokenCategory == tx.inputs[index].tokenCategory);
    require(tx.outputs[index].nftCommitment == tx.inputs[index].nftCommitment);
    return tx.outputs[index].value == tx.inputs[index].value;
}
```

## Function Contracts

The most common modular pattern separates a system into a **top-level covenant** and a set of **function contracts**. The top-level covenant holds the funds and the state but contains almost no logic. Each operation on it is a separate contract, living in its own UTXO with an immutable tracking NFT whose commitment identifies the function.

To perform an operation, a transaction spends the top-level covenant together with exactly one function contract, and returns the function contract unchanged. The other function contracts stay untouched in their UTXOs, so their bytecode never ends up in the transaction. Jedex calls this *logic offloading*, ParyonUSD calls the function contracts *loan functions*, and because they ride along in a separate input they are also known as **sidecar inputs**.

Below is a small system built this way: a treasury that anyone can deposit into and that an administrator can withdraw from in limited amounts.

### The Top-level Covenant

The treasury only checks that it continues to exist and that a function contract of its own system is present. It reads its own category from its tracking NFT, so it does not need any constructor arguments.

```solidity title="Treasury.cash"
// Mutable NFT commitment: bytes8 totalWithdrawn
contract Treasury() {
    function execute() {
        // The treasury always sits at input 0 and is recreated at output 0
        require(this.activeInputIndex == 0);
        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
        require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);

        // Input 1 must be a function contract: an immutable NFT of the treasury's own category
        bytes32 category = tx.inputs[0].tokenCategory.split(32)[0];
        require(tx.inputs[1].tokenCategory == category);
    }
}
```

Everything else, including the value and the state of the recreated treasury, is left to the function contract. The treasury can trust it because only the genesis transaction created immutable NFTs of this category, and the treasury's own NFT is `mutable` rather than `minting`, so no further ones can ever be created.

:::caution
The treasury accepts *any* immutable NFT of its category as a function contract. This only holds up if every immutable NFT of the category is a trusted contract. Never hand out immutable NFTs of the system category to users as receipts or role tokens, unless they carry a distinguishable commitment that the top-level covenant explicitly rejects. Giving user-facing tokens a category of their own is the simpler option.
:::

### The Function Contracts

A function contract mirrors the treasury's checks from the other side, then enforces the rules of its operation. Both contracts pin the transaction layout: the treasury at index 0, the function contract at index 1.

```solidity title="Deposit.cash"
import "./shared.cash";

// Immutable NFT commitment: 0x01
contract Deposit(bytes32 category) {
    function execute() {
        // Function contracts sit at input 1, next to the treasury at input 0
        require(this.activeInputIndex == 1);

        // Authenticate the treasury by its tracking NFT: a mutable NFT of the system category
        require(tx.inputs[0].tokenCategory == category + 0x01);

        // Return this function contract to output 1, unchanged
        require(isRecreatedUnchanged(1));

        // The rule this function enforces: the balance only goes up and the state stays the same
        require(tx.outputs[0].value >= tx.inputs[0].value);
        require(tx.outputs[0].nftCommitment == tx.inputs[0].nftCommitment);
    }
}
```

The withdraw function adds two things: it authenticates the caller with a [role token](#role-tokens) and it updates the treasury's state.

```solidity title="Withdraw.cash"
import "./shared.cash";

// Immutable NFT commitment: 0x02
contract Withdraw(bytes32 category, bytes32 adminCategory, int maxWithdrawal) {
    function execute() {
        require(this.activeInputIndex == 1);
        require(tx.inputs[0].tokenCategory == category + 0x01);
        require(isRecreatedUnchanged(1));

        // Authenticate the caller: input 2 holds the admin role token, and it is not burned
        require(tx.inputs[2].tokenCategory == adminCategory);
        require(tx.outputs[2].tokenCategory == adminCategory);

        // The rule this function enforces: withdraw at most maxWithdrawal per transaction...
        int withdrawn = tx.inputs[0].value - tx.outputs[0].value;
        require(withdrawn > 0 && withdrawn <= maxWithdrawal);

        // ...and record the running total in the treasury state
        int totalWithdrawn = int(tx.inputs[0].nftCommitment) + withdrawn;
        require(tx.outputs[0].nftCommitment == toPaddedBytes(totalWithdrawn, 8));
    }
}
```

Adding an operation to the system means writing a new function contract and creating a UTXO for it. Nothing about the treasury changes. Note that the function contracts, not the treasury, are the security boundary of the system: a bug in `Withdraw` drains the treasury just as surely as a bug in a monolithic contract would.

### Transaction Layout

Modular transactions rely on fixed input and output positions. Fixed positions keep the contracts small, since `tx.inputs[1]` is much cheaper than searching, and they make the assumptions the contracts make about each other explicit. Document the layout at the top of every contract, as ParyonUSD does:

```solidity
// Inputs:  00-Treasury, 01-Withdraw, 02-adminRoleToken
// Outputs: 00-Treasury, 01-Withdraw, 02-adminRoleToken, 03-withdrawnBch
```

Contracts that can appear at different positions, such as the [sidecars](#token-sidecars) further down, use `this.activeInputIndex` and address their neighbours relative to it instead.

:::tip
Function identifiers and other single-byte commitments are cheap to compare: the values `0x01` to `0x10` are pushed with a single-byte opcode. Reserve the first byte of every commitment for an identifier, and pick the identifiers from that range.
:::

### Building the Transaction

On the SDK side, every contract in the transaction is a separate `Contract` instance with its own unlocker, and the UTXO for each is found by its tracking NFT rather than by its address alone. Token categories are passed to constructors with their [byte order swapped](/docs/design/cashtokens#tokencategory-encoding).

```ts
import { Contract, TransactionBuilder } from 'cashscript';
import { decodeInt, encodeIntAsFixedBytes } from '@cashscript/utils';
import { binToHex, hexToBin, swapEndianness } from '@bitauth/libauth';

const treasury = new Contract(treasuryArtifact, [], { provider });
const withdraw = new Contract(
  withdrawArtifact,
  [swapEndianness(category), swapEndianness(adminCategory), 100_000n],
  { provider },
);

const [treasuryUtxos, withdrawUtxos, adminUtxos] = await Promise.all([
  treasury.getUtxos(),
  withdraw.getUtxos(),
  provider.getUtxos(adminAddress),
]);

// Find every contract UTXO by the NFT it carries
const treasuryUtxo = treasuryUtxos.find(utxo => utxo.token?.category === category);
const withdrawUtxo = withdrawUtxos.find(
  utxo => utxo.token?.category === category && utxo.token?.nft?.commitment === '02',
);
const adminUtxo = adminUtxos.find(utxo => utxo.token?.category === adminCategory);

// Compute the new treasury state
const amount = 50_000n;
const totalWithdrawn = decodeInt(hexToBin(treasuryUtxo.token.nft.commitment)) + amount;
const newCommitment = binToHex(encodeIntAsFixedBytes(totalWithdrawn, 8));

const txBuilder = new TransactionBuilder({ provider })
  .addInput(treasuryUtxo, treasury.unlock.execute())
  .addInput(withdrawUtxo, withdraw.unlock.execute())
  .addInput(adminUtxo, adminTemplate.unlockP2PKH())
  .addOutput({
    to: treasury.tokenAddress,
    amount: treasuryUtxo.satoshis - amount,
    token: { category, amount: 0n, nft: { capability: 'mutable', commitment: newCommitment } },
  })
  .addOutput({ to: withdraw.tokenAddress, amount: withdrawUtxo.satoshis, token: withdrawUtxo.token })
  .addOutput({ to: adminAddress, amount: adminUtxo.satoshis, token: adminUtxo.token })
  .addBchChangeOutputIfNeeded({ to: adminAddress, feeRate: 1.0 });
```

## Role Tokens

The `Withdraw` contract does not check a signature. It checks that the transaction spends an NFT of the `adminCategory`: a **role token**. Whoever holds that NFT is the administrator. Compared to a hardcoded public key, this has several advantages:

- **Cheaper and simpler.** A category comparison costs a few bytes and no signature check, and there is no signature to be tricked into covering the wrong outputs.
- **Transferable and revocable.** The role can be handed over by sending the NFT, and given up by burning it, without touching the contracts that check it.
- **Composable.** The NFT can be held by another contract. A 2-of-3 multisig, a timelock or a governance contract can hold the admin token, and the treasury's function contracts never need to know. Jedex uses this to let a separate covenant manage the liquidity provider's admin token.

Different roles can share a category and be told apart by their commitment, for example `0x01` for an administrator and `0x02` for an operator. In the example above the role token has a category of its own, which keeps it out of the treasury's function contract check.

:::caution
A role token grants authority to any transaction it is part of, so the function contract that requires it should also decide what happens to it. `Withdraw` requires the token to be present in the outputs so that it cannot be burned by accident, but leaves the recipient free so that the role remains transferable.
:::

## Sharing State Between Contracts

An NFT commitment is readable by every input in the transaction, not just by the contract that owns it. That turns a contract's state into a message for the rest of the system. A price oracle contract, for example, updates its own commitment when the oracle signs a new price, and any other contract can read the latest price simply by including the oracle contract as an input, as long as it is returned unchanged.

```solidity title="PriceOracle.cash"
import "./shared.cash";

// Mutable NFT commitment: bytes4 sequence, bytes4 price
contract PriceOracle(pubkey oraclePk) {
    function update(bytes8 message, datasig oracleSig) {
        require(this.activeInputIndex == 0);
        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
        require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);

        // Only accept newer messages signed by the oracle
        require(checkDataSig(oracleSig, message, oraclePk));
        bytes4 newSequence = message.split(4)[0];
        bytes4 currentSequence = tx.inputs[0].nftCommitment.split(4)[0];
        require(int(newSequence) > int(currentSequence));

        // The message becomes the new state
        require(tx.outputs[0].nftCommitment == message);
    }

    // Any transaction may include the oracle to read its price, as long as it is returned unchanged
    function share() {
        require(isRecreatedUnchanged(this.activeInputIndex));
    }
}
```

A contract that needs the price authenticates the oracle by its tracking NFT and reads the commitment:

```solidity
// The price oracle sits at input 2 and must be the real one
require(tx.inputs[2].tokenCategory == oracleCategory + 0x01);
int price = int(tx.inputs[2].nftCommitment.split(4)[1]);
```

The oracle needs no knowledge of the contracts that read it. This is how ParyonUSD's price contract feeds every loan function, and it is the same mechanism that lets the `Withdraw` function read and update the treasury's state.

## Token Sidecars

A UTXO can hold tokens of only one category. A contract identified by a tracking NFT of the system category therefore cannot also hold, say, the stablecoin it manages. The solution is a **token sidecar**: a second UTXO, with a minimal contract, that holds the other category and must always be spent and recreated together with its parent. The parent's function contracts then read and constrain the sidecar's `tokenAmount` at the index next to the parent.

The sidecar needs a way to recognise its parent. If the pair is created in the genesis transaction, the sidecar can carry a tracking NFT of the system category like any other contract. Pairs that are created dynamically by another contract, such as one loan and its sidecar per borrower, can instead be **coupled by outpoint**: both are created in the same transaction at consecutive output indices, and both are always recreated that way, so the sidecar can verify that its parent was created right before it.

```solidity title="TokenSidecar.cash"
contract TokenSidecar() {
    function attach() {
        // The parent covenant is the input right before this one, and both come from the same transaction
        int parentIndex = this.activeInputIndex - 1;
        require(tx.inputs[this.activeInputIndex].outpointTransactionHash == tx.inputs[parentIndex].outpointTransactionHash);
        require(tx.inputs[this.activeInputIndex].outpointIndex == tx.inputs[parentIndex].outpointIndex + 1);

        // Follow the parent: recreate this sidecar right after it, with its tokens
        require(tx.outputs[this.activeInputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);
        require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);
    }
}
```

The parent performs the mirror image of the outpoint check on the input after it, so neither can be spent without the other.

## Child Covenants

Not every contract in a system is created at genesis. A top-level covenant with a `minting` NFT can create new contract UTXOs while it runs, each with a tracking NFT whose commitment carries the child's initial state. After that, the child operates on its own. Examples are the per-borrower loans in ParyonUSD and the per-period payout covenants in Jedex, which let users claim their settlement long after the main covenant has moved on. Unlike function contracts, child covenants are usually only *conditionally* recreated: a loan disappears when it is repaid, a payout covenant when the last claim is made.

The lightest form of a child is a [receipt NFT](/docs/design/covenants#issuing-nfts-as-receipts) held by a user: no contract at all, just state that the system can later validate and consume. Which form you need depends on whether the offloaded state has to be able to *act* on its own or only to be *redeemed*.

:::caution
Any contract holding a `minting` NFT must account for every output of its transactions, otherwise the transaction builder can mint additional NFTs of the system category, which the rest of the system would trust. See [protecting the minting capability](/docs/design/cashtokens#protect-the-minting-capability).
:::

## Deploying a Modular System

All the pieces of a modular system are usually created in one [genesis transaction](/docs/guides/deployment#genesis-transaction): the top-level covenant with its `mutable` or `minting` NFT and initial state, one output per function contract with its identifier as commitment, the sidecars and oracles with their tracking NFTs, and the role tokens sent to their holders. Since the category is the txid of the spent `vout: 0` UTXO, it is known beforehand and can be passed to every contract's constructor.

Concurrency follows the same pattern as for single contracts: function contracts and stateless sidecars can be [duplicated freely](/docs/design/concurrency#modular-contract-functions), while stateful covenants need the care described in [Contract Concurrency](/docs/design/concurrency). Because contracts are found by their tracking NFT rather than their address, clients and [transaction servers](/docs/guides/infrastructure) should filter contract UTXOs by category and commitment, never by address alone.

:::note
Authenticating by category rather than by bytecode makes it possible to *upgrade* a system: a contract holding a `minting` NFT and an appropriate role token can create a new function contract and retire an old one. This flexibility concentrates trust in whoever holds that role, so use it deliberately. ParyonUSD, for example, only allows its price contracts to be migrated with a dedicated migration key.
:::

## Design Checklist

- Every contract authenticates its neighbours by `tokenCategory` (which includes the capability) and, where relevant, by `nftCommitment`. Locking bytecode checks are an addition, not a replacement.
- Every contract that should persist enforces its own recreation: `lockingBytecode`, `tokenCategory`, `nftCommitment`, `value` and, for categories with fungible tokens, `tokenAmount`.
- Every token in the system category has exactly one meaning. A user-facing token either has a different commitment prefix that every contract rejects, or a category of its own.
- Contracts with a `minting` NFT account for every output, so no unexpected NFTs of the system category can be created.
- Fixed input and output positions are documented in every contract and match across all contracts in the transaction.
- Empty NFTs cannot be confused with real ones. Give every tracking NFT a non-empty commitment, as explained in the [CashTokens gotchas](/docs/design/cashtokens#invisible-empty-nfts).
- The genesis transaction is [verified](/docs/guides/deployment#verifying-a-deployment) output by output, since any unexpected token output of the system category holds authority over the system.

[paryon]: https://github.com/ParyonUSD/contracts
[paryon-safety]: https://github.com/ParyonUSD/contracts/blob/main/contract_docs/contract_safety.md
[moria]: https://moria.money/
[bchpump]: https://bchpump.cash/
[jedex]: https://github.com/bitjson/jedex#demonstrated-concepts
