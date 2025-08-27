---
title: CashTokens
sidebar_label: CashTokens
---

CashTokens are native tokens on Bitcoin Cash, meaning that they are validated by all full nodes on the network and their transaction rules checked by each miner when constructing new blocks. CashTokens added fungible and non-fungible token primitives.
CashTokens was first proposed in February of 2022 and actived on Bitcoin Cash mainchain in May of 2023.

:::tip
You can read more about CashTokens on [cashtokens.org](https://cashtokens.org/) which has the full specification as well as a list of [Usage Examples](https://cashtokens.org/docs/spec/examples).
:::

## CashTokens Utxo data

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

Capability `none` then refers to an immutible NFT where the commitment cannot be changes. The `mutable` capability means the `commitment` field can change over time, usually to contain smart contract state. Lastly the `minting` capability means that the NFT can create new NFTs from the same `category`.

:::tip
A UTXO can hold both an `amount` of fungible tokens as well as an `nft`, as long as both tokens have the same `category`.
This is quite a common pattern for covenants which want to hold contract state and fungible tokens on the same UTXO.
:::

## CashTokens introspection data
While CashTokens might seem overwhelming at first, realize that in contracts you will only use it through the following introspection details

- **`bytes tx.inputs[i].tokenCategory`** - `tokenCategory` + `tokenCapability` of a specific input.
- **`bytes tx.inputs[i].nftCommitment`** - NFT commitment data of a specific input.
- **`int tx.inputs[i].tokenAmount`** - Amount of fungible tokens of a specific input.

and their equivalent for outputs:

- **`bytes tx.outputs[i].tokenCategory`** - `tokenCategory` + `tokenCapability` of a specific output.
- **`bytes tx.outputs[i].nftCommitment`** - NFT commitment data of a specific output
- **`int tx.outputs[i].tokenAmount`** - Amount of fungible tokens of a specific output.

## CashTokens Gotchas
There are two important "gotchas" to be aware of when developing with CashTokens in smart contracts for the first time

#### 1) tokenCategory contains the nft-capability
```solidity
bytes tx.inputs[i].tokenCategory
```

When accessing the `tokenCategory` through introspection the result returns `0x` when that specific item does not contain tokens. If the item does have tokens it returns the `bytes32 tokenCategory`. When the item contains an NFT with a capability, the 32-byte `tokenCategory` is concatenated together with `0x01` for a mutable NFT and `0x02` for a minting NFT.

#### 2) tokenCategory encoding

The `tokenCategory` introspection variable returns the tokenCategory in the original unreversed order, this is unlike wallets and explorers which use the reversed byte-order. So be careful about the byte-order of `tokenCategory` when working with BCH smart contracts.

```ts
// when using a standard encoded tokenId, reverse the hex before using it in your contract
const contract = new Contract(artifact, [reverseHex(tokenId)], { provider })
```

generally not recommended to do the byte-reversal in script 
```solidity
  // NOT THIS
  require(tx.inputs[0].tokenCategory == providedTokenId.reverse());
```

#### 3) "invisibe" empty nfts
Because the nft-capability has no separate introspection item, and nothing is appended to the `tokenCategory` in case of capability `none`, empty nfts can be "invisibe" when combined with fungible tokens.

```solidity
  // Input 0 has an empty nft (commitment 0x) with providedTokenId
  // If there was no empty nft the tokenCategory would return 0x
  require(tx.inputs[0].nftCommitment == 0x);
  require(tx.inputs[0].tokenAmount == 0);
  require(tx.inputs[0].tokenCategory == providedTokenId);
```

contrast this with the following scenario where there is also fungible tokens of the same category:

```solidity
  // Input 0 might or might not have an empty nft (commitment 0x) with providedTokenId
  // Either way, the tokenCategory would return providedTokenId
  require(tx.inputs[0].nftCommitment == 0x);
  require(tx.inputs[0].tokenAmount == 10);
  require(tx.inputs[0].tokenCategory == providedTokenId);
```

## CashTokens Genesis transactions

A CashTokens genesis transaction is a transaction which creates a new `category` of CashTokens. To create a CashTokens genesis transaction you need a `vout0` UTXO because the txid of the UTXO will be you newly created `category`.

The requirement for a `vout0` UTXO can mean that you might need to create a setup transaction "pre-genesis" which will create this output. The "pre-genesis" txid then is your token's `category`.

:::tip
CashTokens Creation is illustrated very nicely by transaction diagram in the specification document in the [sectction on token categories](https://cashtokens.org/docs/spec/chip#token-categories).
:::
