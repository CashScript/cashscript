---
title: Writing Covenants & Introspection
sidebar_label: Covenants & Introspection
---

Covenants are all the rage in Bitcoin Cash smart contracts. But what are they, and how do you use them? In one sentence: **a covenant is a constraint on how money can be spent**. A simple example is creating a smart contract that may **only** send money to one specific address and nowhere else. The term *Covenant* originates in property law, where it is used to constrain the use of any object - or in the case of BCH, the use of money.

Bitcoin covenants were first proposed in a paper titled [Bitcoin Covenants][bitcoin-covenants], but several other proposals have been created over the years. In May of 2022 Bitcoin Cash implemented so-called *Native Introspection* which enables efficient and accessible covenants.

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
- **`int tx.outputs.length`** - Number of outputs in the transaction.
- **`int tx.outputs[i].value`** - Value of a specific output (in satoshis).
- **`bytes tx.outputs[i].lockingBytecode`** - Locking bytecode (`scriptPubKey`) of a specific output.

## Using introspection data
While we know the individual data fields, it's not immediately clear how this can be used to create useful smart contracts on Bitcoin Cash. But there are several constraints that can be created using these fields, most important of which are constraints on the recipients of funds, so that is what we discuss.

### Restricting P2PKH recipients
One interesting technique in Bitcoin Cash is called blind escrow, meaning that funds are placed in an escrow contract. This contract can only release the funds to one of the escrow participants, and has no other control over the funds. Non-custodial local exchange [LocalCryptos](https://localcryptos.com) uses `OP_CHECKDATASIG` to do this, but we can also achieve something similar by restricting recipients with a covenant.

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
Besides sending money to `P2PKH` addresses, it is also possible to send money to a smart contract (`P2SH`) address. This can be used in the same way as a `P2PKH` address if the script hash is known beforehand, but this can also be used to make sure that money has to be sent back to the current smart contract.

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
        bytes23 contractLock = tx.inputs[this.activeInputIndex].lockingBytecode;
        require(tx.outputs[0].lockingBytecode == contractLock);
    }
}
```

This contract has three functions, but only the `refresh()` function uses a covenant. Again it performs necessary checks to verify that the transaction is signed by the owner, after which it checks that the entire contract balance is sent. It then uses `tx.inputs[this.activeInputIndex].lockingBytecode` to access its own locking bytecode, which can be used as the locking bytecode of this output. Sending the full value back to the same contract effectively resets the `tx.age` counter, so the owner of the contract needs to do this every 180 days.

### Restricting P2PKH and P2SH
The earlier examples showed sending money to only a single output of either `P2PKH` or `P2SH`. But there nothing preventing us from writing a contract that can send to multiple outputs, including a combination of `P2PKH` and `P2SH` outputs. A good example is the *Licho's Mecenas* contract that allows you to set up recurring payments where the recipient is able to claim the same amount every month, while the remainder has to be sent back to the contract.

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
        if (changeValue <= pledge + minerFees) {
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

### Simulating state
A more advanced use case of restricting recipients is so-called simulated state. This works by restricting the recipient to a **slightly amended version of the current contract**. This can be done when the changes to the contract are only to its constructor parameters and when these parameters are of a known size (like `bytes20` or `bytes4`).

To demonstrate this we consider the Mecenas contract again, and focus on a drawback of this contract: you have to claim the funds at exactly the right moment or you're leaving money on the table. Every time you claim money from the contract, the `tx.age` counter is reset, so the next claim is possible 30 days after the previous claim. So if we wait a few days to claim, **these days are basically wasted**.

Besides these wasted days it can also be inconvenient to claim at set intervals, rather than the "streaming" model that the Ethereum project [Sablier](https://www.sablier.finance/) employs. Instead of set intervals, you should be able to claim funds at any time during the "money stream". Using simulated state, we can approach a similar system with BCH.

```solidity
contract Mecenas(
    bytes20 recipient,
    bytes20 funder,
    int pledgePerBlock,
    bytes8 initialBlock,
) {
    function receive() {
        // Check that the first output sends to the recipient
        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

        // Check that time has passed and that time locks are enabled
        int initial = int(initialBlock);
        require(tx.time >= initial);

        // Calculate the amount that has accrued since last claim
        int passedBlocks = tx.locktime - initial;
        int pledge = passedBlocks * pledgePerBlock;

        // Calculate the leftover amount
        int minerFee = 1000;
        int currentValue = tx.inputs[this.activeInputIndex].value;
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

            // Cut out old initialBlock (OP_PUSHBYTES_8 <initialBlock>)
            // Insert new initialBlock (OP_PUSHBYTES_8 <tx.locktime>)
            // Note that constructor parameters are added in reverse order,
            // so initialBlock is the first statement in the contract bytecode.
            bytes newContract = 0x08 + bytes8(tx.locktime) + this.activeBytecode.split(9)[1];

            // Create the locking bytecode for the new contract and check that
            // the change output sends to that contract
            bytes23 newContractLock = new LockingBytecodeP2SH(hash160(newContract));
            require(tx.outputs[1].lockingBytecode == newContractLock);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

Instead of having a pledge per 30 day period, we define a pledge per block. At any point in time we can calculate how much money the recipient has earned. Then the covenant **enforces that this amount is withdrawn from the contract**. The remainder is sent to a new stream that **starts at the end of of the previous one**. The bytecode of this new stream is computed by "cutting out" some of the existing constructor parameters in the `this.activeBytecode` field and replacing them with new values. This process can be applied to the new stream until the money in the stream runs out.

A drawback of using this "simulated state" method is that every new stream is a new contract with its own address. So additional abstractions are needed to provide a clear frontend layer for a system like this. Simulated state can be used to create much more sophisticated systems and is the main idea that powers complex solutions such as the offline payments card [Be.cash](https://be.cash), and the Proof-of-Work SLP token [MistCoin](https://mistcoin.org).

### Restricting OP_RETURN outputs
A final way to restrict outputs is adding `OP_RETURN` outputs to the mix. This is necessary when you want to make any SLP-based covenants, such as [MistCoin](https://mistcoin.org) or the [SLP Mint Contracts](https://github.com/simpleledgerinc/slp-mint-contracts). The integration of SLP and CashScript is still in its early stages though, so that is a topic for a more advanced guide.

Right now we'll use a simpler (but also less useful) example, where we restrict a smart contract to only being able to post on the on-chain social media platform [Memo.cash](https://memo.cash). For this we use `LockingBytecodeNullData`, which works slightly different than the other `LockingBytecode` objects. While regular outputs have a locking script, `OP_RETURN` outputs can include different chunks of data. This is why `LockingBytecode` instead takes a list of `bytes` chunks.

```solidity
pragma cashscript ^0.7.0;

// This contract enforces making an announcement on Memo.cash and sending the
// remaining balance back to the contract.
contract Announcement() {
    function announce() {
        // Create the memo.cash announcement output
        bytes announcement = new LockingBytecodeNullData([
            0x6d02,
            bytes('A contract may not injure a human being or, '
             + 'through inaction, allow a human being to come to harm.')
        ]);

        // Check that the first tx output matches the announcement
        require(tx.outputs[0].value == 0);
        require(tx.outputs[0].lockingBytecode == announcement);

        // Calculate leftover money after fee (1000 sats)
        // Check that the second tx output sends the change back if there's
        // enough leftover for another announcement
        int minerFee = 1000;
        int changeAmount = tx.inputs[this.activeInputIndex].value - minerFee;
        if (changeAmount >= minerFee) {
            bytes changeLock = tx.inputs[this.activeInputIndex].lockingBytecode;
            require(tx.outputs[1].lockingBytecode == changeLock);
            require(tx.outputs[1].value == changeAmount);
        }
    }
}
```

In this contract we construct an "announcement" `OP_RETURN` output, we reserve a part of value for the miner fee, and finally we send the remainder back to the contract.

## Conclusion
We have discussed the main uses for covenants as they exist on Bitcoin Cash today. We've seen how we can achieve different use case by combining transaction output restrictions to `P2SH` and `P2PKH` outputs. We also touched on more advanced subjects such as simulated state and `OP_RETURN` outputs. Covenants are the **main differentiating factor** for BCH smart contracts when compared to BTC, while keeping the same **efficient stateless verification**. If you're interested in learning more about the differences in smart contracts among BCH, BTC and ETH, read the article [*Smart contracts on Ethereum, Bitcoin and Bitcoin Cash*](https://kalis.me/smart-contracts-eth-btc-bch/).

[bitcoin-covenants]: https://fc16.ifca.ai/bitcoin/papers/MES16.pdf
[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
