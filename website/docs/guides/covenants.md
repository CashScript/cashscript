---
title: Writing Covenants & Introspection
sidebar_label: Covenants & Introspection
---

Covenants are all the rage in Bitcoin Cash smart contracts. But what are they, and how do you use them? In one sentence: **a covenant is a constraint on how money can be spent**. A simple example is creating a smart contract that may **only** send money to one specific address and nowhere else. The term *Covenant* originates in property law, where it is used to constrain the use of any object — or in the case of BCH, the use of money.

Bitcoin covenants were first proposed in a paper titled [Bitcoin Covenants][bitcoin-covenants], but several other proposals have been created over the years. In May of 2022 Bitcoin Cash implemented so-called *Native Introspection* which enables efficient and accessible covenants. This was extended with token introspection opcodes with the *CashTokens* upgrade in May of 2023.

## Accessible introspection data
When using CashScript, you can access a lot of *introspection data* that can be used to inspect and constrain transaction details, such as inputs and outputs.

- **`int this.activeInputIndex`** - Index of the input that is currently under evaluation during transaction validation.
- **`bytes this.activeBytecode`** - Contract bytecode of the input that is currently under evaluation during transaction validation.
- **`int tx.version`** - Version of the transaction.
- **`int tx.locktime`** - `nLocktime` field of the transaction.
- **`int tx.inputs.length`** - Number of inputs in the transaction.
- **`int tx.inputs[i].value`** - Value of a specific input (in satoshis).
- **`bytes tx.inputs[i].lockingBytecode`** - Locking bytecode (`scriptPubKey`) of a specific input.
- **`bytes tx.inputs[i].unlockingBytecode`** - Unlocking bytecode (`scriptSig`) of a specific input.
- **`bytes32 tx.inputs[i].outpointTransactionHash`** - Outpoint transaction hash of a specific input.
- **`int tx.inputs[i].outpointIndex`** - Outpoint index of a specific input.
- **`int tx.inputs[i].sequenceNumber`** - `nSequence` number of a specific input.
- **`bytes tx.inputs[i].tokenCategory`** - `tokenCategory` + `tokenCapability` of a specific input.
- **`bytes tx.inputs[i].nftCommitment`** - NFT commitment data of a specific input.
- **`int tx.inputs[i].tokenAmount`** - Amount of fungible tokens of a specific input.
- **`int tx.outputs.length`** - Number of outputs in the transaction.
- **`int tx.outputs[i].value`** - Value of a specific output (in satoshis).
- **`bytes tx.outputs[i].lockingBytecode`** - Locking bytecode (`scriptPubKey`) of a specific output.
- **`bytes tx.outputs[i].tokenCategory`** - `tokenCategory` + `tokenCapability` of a specific output.
- **`bytes tx.outputs[i].nftCommitment`** - NFT commitment data of a specific output
- **`int tx.outputs[i].tokenAmount`** - Amount of fungible tokens of a specific output.

## Using introspection data
While we know the individual data fields, it's not immediately clear how this can be used to create useful smart contracts on Bitcoin Cash. However, there are several constraints that can be created using these fields — most important of which are constraints on the recipients of funds — so that is what we discuss.

### Restricting P2PKH recipients
One interesting technique in Bitcoin Cash is called blind escrow, meaning that funds are placed in an escrow contract. This contract can only release the funds to one of the escrow participants, and has no other control over the funds. We can implement this blind escrow as a covenants by restricting the possible recipients (although there are other possible designs for escrows).

```solidity
contract Escrow(bytes20 arbiter, bytes20 buyer, bytes20 seller) {
    function spend(pubkey pk, sig s) {
        require(hash160(pk) == arbiter);
        require(checkSig(s, pk));

        // Check that the correct amount is sent
        int minerFee = 1000; // hardcoded fee
        int amount = tx.inputs[this.activeInputIndex].value - minerFee;
        require(tx.outputs[0].value == amount);

        // Check that the transaction sends to either the buyer or the seller
        bytes25 buyerLock = new LockingBytecodeP2PKH(buyer);
        bytes25 sellerLock = new LockingBytecodeP2PKH(seller);
        bool sendsToBuyer = tx.outputs[0].lockingBytecode == buyerLock;
        bool sendsToSeller = tx.outputs[0].lockingBytecode == sellerLock;
        require(sendsToBuyer || sendsToSeller);
    }
}
```

The contract starts by doing some checks to make sure the transaction is signed by the arbiter. Next up it checks that the full contract balance (`tx.inputs[this.activeInputIndex].value`) is sent to the first output by accessing `tx.outputs[0].value`. Finally it checks that the receiver of that money is either the buyer or the seller using `LockingBytecodeP2PKH` and `tx.outputs[0].lockingBytecode`. Note that we use a hardcoded fee as it is difficult to calculate the exact transaction fee inside the smart contract.

### Restricting P2SH recipients
Besides sending money to `P2PKH` addresses, it is also possible to send money to a smart contract (`P2SH`) address. A smart contract address can be used in the same way as a `P2PKH` address (if the script hash is known beforehand), and it can also be used to make sure that money has to be sent back to the current smart contract.

This is especially effective when used together with time constraints. An example is the *Licho's Last Will* contract. This contract puts a dead man's switch on the contract's holdings, and requires the owner to send a heartbeat to the contract every six months. If the contract hasn't received this heartbeat, an inheritor can claim the funds instead.

```solidity
contract LastWill(bytes20 inheritor, bytes20 cold, bytes20 hot) {
    function inherit(pubkey pk, sig s) {
        require(tx.age >= 180 days);
        require(hash160(pk) == inheritor);
        require(checkSig(s, pk));
    }

    function cold(pubkey pk, sig s) {
        require(hash160(pk) == cold);
        require(checkSig(s, pk));
    }

    function refresh(pubkey pk, sig s) {
        require(hash160(pk) == hot);
        require(checkSig(s, pk));

        // Check that the correct amount is sent
        int minerFee = 1000; // hardcoded fee
        int amount = tx.inputs[this.activeInputIndex].value - minerFee;
        require(tx.outputs[0].value == amount);

        // Check that the funds are sent back to the contract
        bytes contractLock = tx.inputs[this.activeInputIndex].lockingBytecode;
        require(tx.outputs[0].lockingBytecode == contractLock);
    }
}
```

This contract has three functions, but only the `refresh()` function uses a covenant. Again it performs necessary checks to verify that the transaction is signed by the owner, after which it checks that the entire contract balance is sent. It then uses `tx.inputs[this.activeInputIndex].lockingBytecode` to access its own locking bytecode, which can be used as the locking bytecode of this output. Sending the full value back to the same contract effectively resets the `tx.age` counter, so the owner of the contract needs to do this every 180 days.

### Restricting P2PKH and P2SH
The earlier examples showed sending money to only a single output of either `P2PKH` or `P2SH`. But there's nothing preventing us from writing a contract that can send to multiple outputs, including a combination of `P2PKH` and `P2SH` outputs. A good example is the *Licho's Mecenas* contract that allows you to set up recurring payments where the recipient is able to claim the same amount every month, while the remainder has to be sent back to the contract.

```solidity
contract Mecenas(bytes20 recipient, bytes20 funder, int pledge, int period) {
    function receive() {
        require(tx.age >= period);

        // Check that the first output sends to the recipient
        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

        // Calculate the value that's left
        int minerFee = 1000;
        int currentValue = tx.inputs[this.activeInputIndex].value;
        int changeValue = currentValue - pledge - minerFee;

        // If there is not enough left for *another* pledge after this one,
        // we send the remainder to the recipient. Otherwise we send the
        // pledge to the recipient and the change back to the contract
        if (changeValue <= pledge + minerFee) {
            require(tx.outputs[0].value == currentValue - minerFee);
        } else {
            require(tx.outputs[0].value == pledge);
            bytes changeBytecode = tx.inputs[this.activeInputIndex].lockingBytecode;
            require(tx.outputs[1].lockingBytecode == changeBytecode);
            require(tx.outputs[1].value == changeValue);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

This contract applies similar techniques as the previous two examples to verify the signature, although in this case it does not matter who the *signer* of the transaction is. Since the outputs are restricted with covenants, there is **no way** someone could call this function to send money **anywhere but to the correct outputs**.

## Local State

Smart contracts which persist for multiple transactions might want to keep data for later use. This is called local state. With the CashTokens upgrade, local state can be kept in the commitment field of the NFT of the smart contract UTXO. Because the state is not kept in the script of the smart contract itself, the address can remain the same.

:::info
Covenants can also use 'simulated state', where state is kept in the contract script and the contract enforces a new P2SH locking bytecode of the contract with a different state update. This method causes the contract address to change with each state update.
:::

### Keeping local State in NFTs

To demonstrate the concept of 'local state' we consider the Mecenas contract again, and focus on a drawback of this contract: you have to claim the funds at exactly the right moment or you're leaving money on the table. Every time you claim money from the contract, the `tx.age` counter is reset, so the next claim is possible 30 days after the previous claim. So if we wait a few days to claim, **these days are basically wasted**.

Besides these wasted days it can also be inconvenient to claim at set intervals, rather than the "streaming" model that the Ethereum project [Sablier](https://www.sablier.finance/) employs. Instead of set intervals, you should be able to claim funds at any time during the "money stream". Using local state, we can approach a similar system with BCH.

```solidity
// Mutable NFT Commitment contract state
// bytes8 latestLockTime

contract StreamingMecenas(
    bytes20 recipient,
    bytes20 funder,
    int pledgePerBlock,
) {
    function receive() {
        // Check that the first output sends to the recipient
        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

        // Read the block height of the previous pledge, kept in the NFT commitment
        require(tx.inputs.length == 1);
        bytes localState = tx.inputs[0].nftCommitment;
        int blockHeightPreviousPledge = int(localState);

        // Check that time has passed and that time locks are enabled
        require(tx.time >= blockHeightPreviousPledge);

        // Calculate the amount that has accrued since last claim
        int passedBlocks = tx.locktime - blockHeightPreviousPledge;
        int pledge = passedBlocks * pledgePerBlock;

        // Calculate the leftover amount
        int minerFee = 1000;
        int currentValue = tx.inputs[0].value;
        int changeValue = currentValue - pledge - minerFee;

        // If there is not enough left for *another* pledge after this one,
        // we send the remainder to the recipient. Otherwise we send the
        // remainder to the recipient and the change back to the contract
        if (changeValue <= pledge + minerFee) {
            require(tx.outputs[0].value == currentValue - minerFee);
        } else {
            // Check that the outputs send the correct amounts
            require(tx.outputs[0].value == pledge);
            require(tx.outputs[1].value == changeValue);

            // Send the change value back to the same smart contract locking bytecode
            require(tx.outputs[1].lockingBytecode == tx.inputs[0].lockingBytecode);

            // Update the block height of the previous pledge, kept in the NFT commitment
            bytes blockHeightNewPledge = bytes8(tx.locktime);
            require(tx.outputs[1].nftCommitment == blockHeightNewPledge);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

Instead of having a pledge per 30 day period, we define a pledge per block. At any point in time we can calculate how much money the recipient has earned. Then the covenant **enforces that this amount is withdrawn from the contract**. The remainder is sent to a new stream that **starts at the end of the previous one**. The locktime used for the last withdrawal from the covenant is kept in the local state to calculate the amount of money the recipient has earned over the passed time. This process of changing the local state in the NFT associated with the smart contract UTXO can be applied to the new stream until the money in the stream runs out.

:::tip
We use `tx.locktime` to introspect the value of the timelock, and to write the value to the contract local state: the NFT commitment field.
:::

### Issuing NFTs as receipts

A covenant that manages funds (BCH + fungible tokens of a certain category) which are pooled together from different people often wants to enable its participants to also exit the covenants with their funds. It would be incredibly hard continuously updating a data structure to keep track of which address contributed how much in the local state of the contract. A much better solution is to issue receipts each time funds are added to the pool! This way the contract does not have a 'global view' of who owns what at any time, but it can validate the receipts when invoking a withdrawal.

Technically this happens by minting a new NFT, with in the commitment field the amount of satoshis or fungible tokens that were contributed to the pool, and sending this to the address of the contributor.

:::tip
Minting NFT receipts allows the contract to offload state to an NFT held by a user. By default, these receipts are easily transferable and tradable because they are generic NFTs.
:::

Let's take a look at an example contract called `PooledFunds` which has two contract functions: `addFunds` and `withdrawFunds`


```solidity
// Immutable NFT Commitment User-Receipt
// bytes1 actionIdentifier
// bytes8 amountSatsAdded | amountTokensAdded

contract PooledFunds(
) {
    function addFunds(
    ) {
        // Require the covenant contract always lives at index zero with a minting NFT
        require(this.activeInputIndex == 0);
        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
        require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);

        // Now it is convenient to calculate the amount added to the pool of funds
        int amountSatsAdded = tx.outputs[0].value - tx.inputs[0].value;
        int amountTokensAdded = tx.outputs[0].tokenAmount - tx.inputs[0].tokenAmount;

        // Require either BCH or fungible tokens to contributed, not both at once
        require(amountSatsAdded == 0 || amountTokensAdded == 0);

        // Determine whether BCH or fungible tokens were contributed to the pool
        bytes receiptCommitment = 0x;
        if (amountTokensAdded > 0) {
            // Require 1000 sats to pay for future withdrawal fee
            require(amountSatsAdded == 1000);
            receiptCommitment = 0x01 + bytes8(amountTokensAdded);
        } else {
            // Place a minimum on the amount of funds that can be added
            // Implicitly requires tx.outputs[0].value > tx.inputs[0].value
            require(amountSatsAdded > 10000);
            receiptCommitment = 0x00 + bytes8(amountSatsAdded);
        }

        // Require there to be at most three outputs so no additional NFTs can be minted
        require(tx.outputs.length <= 3);

        // 2nd output contains NFT receipt for the funds added to the pool
        // Get the tokenCategory of the minting NFT without the minting capability added
        bytes tokenCategoryReceipt = tx.inputs[0].tokenCategory.split(32)[0];
        require(tx.outputs[1].tokenCategory == tokenCategoryReceipt);

        // The receipt NFT is sent back to the same address of the first user's input
        // The NFT commitment of the receipt contains what was added to the pool
        require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode);
        require(tx.outputs[1].nftCommitment == receiptCommitment);

        // A 3rd output for change is allowed
        if (tx.outputs.length == 3) {
            // Require that the change output does not mint any NFTs
            require(tx.outputs[2].tokenCategory == 0x);
        }
    }
    function withdrawFunds(
    ) {
        // Require the covenant contract always lives at index zero with a minting NFT
        require(this.activeInputIndex == 0);
        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
        require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);

        // Accept NFT of the correct category as input index1
        // Validate by checking the tokenCategory without capability
    	bytes tokenCategoryReceipt = tx.inputs[0].tokenCategory.split(32)[0];
        require(tx.inputs[1].tokenCategory == tokenCategoryReceipt);

        // Read the amount that was contributed to the pool from the NFT commitment
        bytes ntfCommitmentData = tx.inputs[1].nftCommitment;
        bytes actionIdentifier, bytes amountToWithdrawBytes = ntfCommitmentData.split(1);
        int amountToWithdraw = int(amountToWithdrawBytes);

        if (actionIdentifier == 0x01) {
            // Require the pool's token balance to decrease with the amount initially contributed
            require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount - amountToWithdraw);
        } else {
            // Require the pool's BCH balance to decrease with the amount initially contributed
            require(tx.outputs[0].value == tx.inputs[0].value - amountToWithdraw);
        }

        // Require there are exactly two outputs so no additional NFTs can be minted
        require(tx.outputs.length == 2);

        // Require the amount to withdraw minus fee is sent to the same address of the first user's input
        require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode);
        require(tx.outputs[1].value == amountToWithdraw - 1000);

        // require that the receipt NFT is burned
        require(tx.outputs[1].tokenCategory == 0x);
    }
}
```

All outputs of the `PooledFunds` contract need to be carefully controlled in the contract code so no additional NFTs can be minted in other outputs, as this would allow 'fake' receipts to be created. The user receipt NFTs only differ from the covenant's minting NFT in that there is no minting capability added to the token's categoryID when calling `.tokenCategory`. At withdrawal, the receipt needs to be validated, and then the NFT commitment data is read to understand the contents of the receipt. In the current contract the receipt NFT also needs to be burned (simply not re-created in the outputs) ensuring the same receipt cannot be used to withdraw twice.

:::caution
With contracts holding minting NFTs, all outputs need to be carefully controlled in the covenant contract code, so no additional (minting) NFTs can un-intentionally be created in other outputs.
:::


## Conclusion
We have discussed the main uses for covenants as they exist on Bitcoin Cash today. We've seen how we can achieve different use cases by combining transaction output restrictions to `P2SH` and `P2PKH` outputs. We also touched on more advanced subjects such as keeping local state in NFTs. Covenants and CashTokens are the **main differentiating factor** for BCH smart contracts when compared to BTC, while keeping the same **efficient, atomic verification**.

Keeping local state in NFTs and issuing NFTs as receipts are two strategies which can be used to create much more sophisticated decentralized applications such as the AMM-style DEX named [Jedex](https://blog.bitjson.com/jedex-decentralized-exchanges-on-bitcoin-cash/).

[bitcoin-covenants]: https://fc16.ifca.ai/bitcoin/papers/MES16.pdf
