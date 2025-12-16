---
title: CashTokens
sidebar_label: CashTokens
---

CashTokens are native tokens on Bitcoin Cash, meaning that they are validated by all full nodes on the network and their transaction rules checked by each miner when constructing new blocks. CashTokens added fungible and non-fungible token primitives.
CashTokens was first proposed in February of 2022 and activated on Bitcoin Cash mainnet in May of 2023.

:::tip
You can read more about CashTokens on [cashtokens.org](https://cashtokens.org/) which has the full specification as well as a list of [usage examples](https://cashtokens.org/docs/spec/examples).
:::

## CashTokens UTXO data

To understand CashTokens it is helpful to start with the layout of the UTXO data. In the `networkProvider` data from the SDK, the `token` property contains the new CashTokens fields:

```ts
interface Utxo {
  txid: string;
  vout: number;
  satoshis: bigint;
  token?: TokenDetails;
}

interface TokenDetails {
  amount: bigint;
  category: string;
  nft?: {
    capability: 'none' | 'mutable' | 'minting';
    commitment: string;
  };
}
```
### Fungible Tokens

The `amount` field is the amount of fungible tokens on the UTXO, the `category` is the "tokenId" for the token on the UTXO.
The maximum size for a fungible token `amount` is the max signed 64-bit integer or `9223372036854775807`.

### Non-Fungible Tokens

The `nft` info on a UTXO will only be present if the UTXO contains an NFT. The `nft` object has 2 properties: the `capability` and the `commitment`. The `commitment` is the data field for the NFT which can is allowed to be up to 40 bytes.

Capability `none` then refers to an immutable NFT where the commitment cannot be changed. The `mutable` capability means the `commitment` field can change over time, usually to contain smart contract state. Lastly the `minting` capability means that the NFT can create new NFTs from the same `category`.

:::note
A UTXO can hold both an `amount` of fungible tokens as well as an `nft`, as long as both tokens have the same `category`.
This is quite a common pattern for covenants which want to hold contract state and fungible tokens on the same UTXO.
:::

## CashTokens introspection data
While CashTokens might seem overwhelming at first, realize that in contracts you will only use it through the following introspection details

- **`bytes tx.inputs[i].tokenCategory`** - `tokenCategory` + `tokenCapability` of a specific input.
- **`bytes tx.inputs[i].nftCommitment`** - NFT commitment data of a specific input.
- **`int tx.inputs[i].tokenAmount`** - Amount of fungible tokens of a specific input.

and their equivalent for outputs:

- **`bytes tx.outputs[i].tokenCategory`** - `tokenCategory` + `tokenCapability` of a specific output. (see [below](#tokencategory-contains-the-nft-capability)).
- **`bytes tx.outputs[i].nftCommitment`** - NFT commitment data of a specific output
- **`int tx.outputs[i].tokenAmount`** - Amount of fungible tokens of a specific output.

## CashTokens Use cases

The Jedex has a section on novel "[demonstrated concepts](https://github.com/bitjson/jedex#demonstrated-concepts)" enabled by CashTokens. The Jedex overview serves as the best reference to-date for the new possibilities enabled by CashTokens.

:::tip
The [Jedex demo](https://github.com/bitjson/jedex) also introduces very advanced concepts on multi-threading and MEV avoidance through batching. This core feature of 'joint-execution' is how the DEX got its name.
:::

Below we'll create a short list of the use cases which will be the most important to know about:

- **Covenant tracking tokens** - this is what enables unique authentication of contract deployments
- **Commitment-based state management** - this is what `mutable` nfts are extremely useful for
- **Depository covenants/token pools**  - which we would call token sidecars
- **Role tokens** - these are authentication tokens for admins
- **Token-unlocked covenants** - this concept has also been called "pay-to-nft"
- **Redeemable NFTs** - `immutable` nfts can carry state as a receipt which can be returned later for payout
- **Coupled covenants/logic offloading** - which we would call sidecar functions
- **Spin-off covenants** - the idea that contract create regular helper contracts to perform some task

## CashTokens Gotchas
There are a few important "gotchas" to be aware of when developing with CashTokens in smart contracts for the first time. We'll separate them on gotchas on the contract side, and gotchas on the transaction building side.

### Contract Gotchas

#### tokenCategory contains the nft-capability
```solidity
bytes tx.inputs[i].tokenCategory
```

When accessing the `tokenCategory` through introspection the result returns `0x` (empty byte string) when that specific item does not contain tokens. If the item does have tokens it returns the `bytes32 tokenCategory`. When the item contains an NFT with a capability, the 32-byte `tokenCategory` is concatenated together with `0x01` for a mutable NFT and `0x02` for a minting NFT.

If you want to check for an NFT using introspection, you have either split the `tokenCategory` from the `capability` or check the concatenation of the `tokenCategory` and `capability`.

```solidity
  // Constructor parameters: providedCategory

  // Extract the separate tokenCategory and capability
  bytes32 tokenCategory, bytes capability = tx.inputs[0].tokenCategory.split(32);

  // Check that the NFT is the correct category and has a "minting" capability
  require(providedCategory == tokenCategory);
  require(capability == 0x02);

  // Alternatively:

  // Check by concatenating the providedCategory and capability
  require(tx.inputs[0].tokenCategory == providedCategory + 0x02);
```

#### protect the minting capability

If a covenant contains a `minting` NFT then all outputs should be carefully accounted for in the contract logic to not accidentally allow to mint extra new NFTs.

For a variable number of outputs you could use the following construction:
```solidity
  // Optionally create bch-change output at outputIndex 5
  if (tx.outputs.length > 5) {
        require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");
  }

  // Don't allow more outputs to prevent minting extra NFTs
  require(tx.outputs.length <= 6, "Invalid number of outputs - should have 6 at most");
```

#### "invisible" empty nfts
Because the nft-capability has no separate introspection item, and nothing is appended to the `tokenCategory` in case of capability `none`, empty nfts can be "invisible" when combined with fungible tokens.

First let's consider the case where a UTXO only holds an empty NFT:

```solidity
  // Input 0 has an empty nft (commitment 0x) with providedTokenId
  // If there was no empty nft the tokenCategory would return 0x
  require(tx.inputs[0].nftCommitment == 0x);
  require(tx.inputs[0].tokenAmount == 0);
  require(tx.inputs[0].tokenCategory == providedTokenId);
```

Contrast this with the scenario where a UTXO holds both an empty NFT and fungible tokens of the same category:

```solidity
  // Input 0 might or might not have an empty nft (commitment 0x) with providedTokenId
  // Either way, the tokenCategory would return providedTokenId
  require(tx.inputs[0].nftCommitment == 0x);
  require(tx.inputs[0].tokenAmount == 10);
  require(tx.inputs[0].tokenCategory == providedTokenId);
```

The NFT introspection fields (`nftCommitment` and `tokenCategory`) of these UTXOs look the same to the smart contract in both of these scenarios.

This means that a covenant UTXO holding both a minting NFT and the fungible token supply for the same token `category` cannot prevent that empty nfts are created by users when they are allowed to create a fungible token output. The possibility of these "junk" empty NFTs should be taken into account so they do not present any security problems for the contract system.

:::tip
The easiest way to prevent issues with "junk" empty NFTs is to check that only NFTs with non-empty commitments can be interacted with in the contract system.
:::

### Transaction Building Gotchas

#### tokenCategory encoding

The `tokenCategory` introspection variable returns the tokenCategory in the original unreversed order, this is unlike wallets and explorers which use the reversed byte-order. So be careful about the byte-order of `tokenCategory` when working with BCH smart contracts.

```ts
// when using a standard encoded tokenId, reverse the hex before using it in your contract
const contract = new Contract(artifact, [reverseHex(tokenId)], { provider })
```

#### Combined BCH + CashTokens UTXOs

Most end-user CashTokens wallets expect CashTokens UTXOs to only hold a tiny amount of BCH like 1000 sats. Deviating from the expectation might cause unforeseen problems with user's wallets.

:::tip
You can hard code in your contract that any user token output should have exactly `1000` sats, this avoids possible complicating freedom during transaction building.
:::

However when constructing a transaction with user owned UTXOs, you should always make sure to check whether you handle the edge case of users with combined BCH + CashTokens UTXOs correctly in change output handling both for BCH and the tokens.

#### Explicit vs implicit burning

CashTokens can be burned explicitly by sending them to an OP_RETURN output, which is provably unspendable. CashTokens can also be burned implicitly, by including them in the inputs but not the outputs of a transaction. Always be mindful when adding token-carrying inputs to not forget to add the tokens in the outputs, otherwise they will be considered as an implicit burn.

:::note
Signing for CashTokens inputs is designed in such a way that pre-CashTokens wallets - which only know how to send and receive Bitcoin Cash - cannot spend CashTokens inputs and thus can never accidentally burn CashTokens this way.
:::

## CashTokens Genesis transactions

A CashTokens genesis transaction is a transaction which creates a new `category` of CashTokens. To create a CashTokens genesis transaction you need a `vout0` UTXO because the txid of the UTXO will be you newly created `category`.

The requirement for a `vout0` UTXO can mean that you might need to create a setup transaction "pre-genesis" which will create this output. The "pre-genesis" txid then is your token's `category`.

:::tip
CashTokens Creation is illustrated very nicely by transaction diagram in the specification document in the [section on token categories](https://cashtokens.org/docs/spec/chip#token-categories).
:::

## CashTokens BCMR metadata

Although not directly related to smart contracts, BCMR metadata is important for user-facing CashTokens. This way users can see your token name, icon, description and any relevant project links directly in their wallet. Many CashTokens wallets use the [Paytaca BCMR indexer](https://bcmr.paytaca.com/) to fetch BCMR metadata info about CashTokens.

The Paytaca BCMR indexer listens for on-chain [authchain](https://github.com/bitjson/chip-bcmr?tab=readme-ov-file#zeroth-descendant-transaction-chains) transactions which publish metadata with an OP_RETURN publication output. These type of metadata updates are self-published on-chain identity claims. The zero-th output chain since the token genesis is the authchain. The UTXO at the "head" of this chain holds the authority to update the token's metadata.

:::tip
For easy creation of CashTokens with BCMR metadata there is the Paytaca [CashTokens Studio](https://cashtokens.studio/) or to programmatically publish on-chain BCMR authchain updates there is the [AuthUpdate](https://github.com/mr-zwets/AuthUpdate) JS program.
:::
