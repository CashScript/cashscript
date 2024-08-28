---
title: Intro to Bitcoin Cash
sidebar_label: About Bitcoin Cash
---

Bitcoin Cash (ticker BCH) is one of the biggest cryptocurrencies. Bitcoin Cash is a fork of Bitcoin started in 2017 because of differences in vision for the future of the Bitcoin project.

Bitcoin Cash shares many of the same fundamentals as Bitcoin (BTC) like the *Proof-of-Work* consensus alrgorithm and the *UTXO data-model*. However regarding smart contract programmability, Bitcoin Cash has significantly diverged from Bitcoin (BTC). We will first cover the UTXO data model and then delve into the smart contract capabilities of Bitcoin Cash.

:::info
To learn more about the Bitcoin Basics refer to the book ['Mastering Bitcoin'](https://github.com/bitcoinbook/bitcoinbook). There is also a modified version for BCH specifically called ['Mastering Bitcoin Cash'](https://github.com/Bitcoin-com/mastering-bitcoin-cash).
:::

## UTXO model
Bitcoin Cash transactions work with in- and outputs. All current balances are so called *Unspent Transaction Outputs (UTXOs)*, which simply means they can be used as inputs for future spending transactions.

When UTXOs are used as inputs to a Bitcoin Cash transaction, they produce new UTXOs as outputs. UTXOs need to be spent in their entirety within a transaction. So whenever the user wishes to use a 10 BCH UTXO to send someone 1 BCH, they need to send 9 BCH back to themselves. Realistically, part of the funds would be reserved for transaction fees as well.

The most used locking/unlocking script pattern is called *Pay-to-Public-Key-Hash (P2PKH)*, where the locking script contains the hash of a public key and expects the unlocking script to contain a public key and transaction signature. The locking script then checks that the provided public key matches the stored hash, and that the transaction signature is valid. This pattern is used in regular Bitcoin Cash wallets. And the user's balance is simply the sum of all UTXOs that can be spent by the user's public keys.

## Smart Contracts on BCH
Bitcoin Cash has had many script upgrades, including transaction introspection and CashTokens. Because of these upgrades, DeFi is very much possible on Bitcoin Cash. However, compared to EVM, smart contracts work very differently due to BCH's UTXO architecture.

Smart contracts on Bitcoin Cash only have access to the current transaction context, which enables 'local state'. This model allows transactions to be verified independently and efficiently. Because there is no global state that can impact the execution of these smart contracts, the results are deterministic and predictable.

### Bitcoin Cash Script
UTXOs are locked using a locking script (or `scriptPubKey`) that specifies the conditions to spend the UTXO. When attempting to spend a UTXO, an unlocking script (or `scriptSig`) is provided. These scripts are then executed together and the transaction is only valid if the scripts execute without errors and the resulting value is `TRUE`.

The locking and unlocking scripts of regular transactions and smart contracts on Bitcoin Cash are written using Bitcoin Cash' transaction scripting language, creatively named Script. To avoid ambiguity, it can also be referred to as Bitcoin Cash Script or BCH Script. Script is a stack based assembly-like language, because it is a low-level language and requires stack management it is hard to write complex smart contract in Script directly.


### CashScript

CashScript is a high-level programming language for smart contracts on Bitcoin Cash that offers a strong abstraction for a smoother development experience. The CashScript syntax is based on Ethereum's smart contract language Solidity, but its functionality is very different since smart contracts on Bitcoin Cash differ greatly from smart contracts on Ethereum.