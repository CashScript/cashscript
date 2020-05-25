---
title: Examples
---

An extensive collection of examples is available in the [GitHub repository](https://github.com/Bitcoin-com/cashscript/tree/master/examples). Below we discuss a few of these examples in more details and go through the functionality.

## Transfer With Timeout
One interesting use case of Bitcoin Cash is using it for *paper tips*. With paper tips, you send a small amount of money to an address, and print the corresponding private key on a piece of paper. Then you can hand out these pieces of paper as a tip or gift to people in person. In practice, however, people might not know what to do with these gifts or they might lose or forget about it.

As an alternative, a smart contract can be used for these kinds of gifts. This smart contract allows the recipient to claim their gift at any time, but if they don't claim it in time, the sender can reclaim it.

```solidity
pragma cashscript ^0.4.0;

contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    // Require recipient's signature to match
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    // Require timeout time to be reached and sender's signature to match
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
```

## HodlVault
For better or worse, HODLing and waiting for price increases is one of the main things people want to do with their cryptocurrency. But it can be difficult to hold on to your cryptocurrency when the price is going down. So to prevent weak hands from getting the best of you, it's better to store your stash in a smart contract that enforces HODLing for you.

This smart contract works by connecting with a price oracle. This price oracle is a trusted entity that publishes the BCH/USD price every block. This price is passed into the contract, and only if the price is higher than your target price can you spend the coins.

This involves some degree of trust in the price oracle, but since the oracle produces price data for everyone to use, their incentive to attack *your* smart contract is minimised. To improve this situation, you can also choose to connect with multiple oracle providers so you do not have to trust a single party.

```solidity
pragma cashscript ^0.4.0;

// A minimum block is provided to ensure that oracle price entries from before
// this block are disregarded. i.e. when the BCH price was $1000 in the past,
// an oracle entry with the old block number and price can not be used.
contract HodlVault(pubkey ownerPk, pubkey oraclePk, int minBlock, int priceTarget) {
    function spend(sig ownerSig, datasig oracleSig, bytes oracleMessage) {
        // Decode the message { blockHeight, price }
        int blockHeight = int(oracleMessage.split(4)[0]);
        int price = int(oracleMessage.split(4)[1]);

        // Check that blockHeight is after minBlock
        require(blockHeight >= minBlock);
        // Check that blockHeight is not in the future
        require(tx.time >= blockHeight);

        // Check that current price is at least priceTarget
        require(price >= priceTarget);

        // Check that the price message was signed by the oracle
        require(checkDataSig(oracleSig, oracleMessage, oraclePk));

        // Check that the transaction was signed by the contract owner
        require(checkSig(ownerSig, ownerPk));
    }
}
```

## Licho's Mecenas
Donations are a great way to support the projects you love and periodic donations can incentivise continuous improvement to the product. But platforms like Patreon generally take fees of 10%+ and don't accept cryptocurrencies. Instead you can create a peer-to-peer smart contract that allows a recipient to withdraw a specific amount every month.

The contract works by checking that a UTXO is at least 30 days old, after which it uses a covenant to enforce that the `pledge` amount is sent to the recipient, while the remainder is sent back to the contract itself. By sending it back the `age` counter is effectively reset, meaning this process can only be repeated when another 30 days have past.

Due to the nature of covenants we have to be very specific about the outputs (amounts and destinations) of the transaction. This also means that we have to account for the special case where the remaining contract balance is lower than the `pledge` amount, meaning no remainder should be sent back. Finally we have to account for a small fee that has to be taken from the contract's balance to pay the miners.

```solidity
pragma cashscript ^0.4.0;

contract Mecenas(bytes20 recipient, bytes20 funder, int pledge) {
    // Allow the receiver to claim their monthly pledge amount
    function receive(pubkey pk, sig s) {
        // The transaction can be signed by anyone, because the money can only
        // be sent to the correct address
        require(checkSig(s, pk));

        // Check that the UTXO is at least 30 days old
        require(tx.age >= 30 days);

        // Use a hardcoded miner fee
        int minerFee = 1000;

        // Retrieve the UTXO's value and cast it to an integer
        int intValue = int(bytes(tx.value));

        // Check if the UTXO's value is higher than the pledge amount + fee
        if (intValue <= pledge + fee) {
            // Create an Output that sends the remaining balance to the recipient
            bytes34 out1 = new OutputP2PKH(bytes8(intValue - fee), recipient);

            // Enforce that this is the only output for the current transaction
            require(hash256(out1) == tx.hashOutputs);
        } else {
            // Create an Output that sends the pledge amount to the recipient
            bytes34 out1 = new OutputP2PKH(bytes8(pledge), recipient);

            // Create an Output that sends the remainder back to the contract
            bytes8 remainder = bytes8(intValue - pledge - fee);
            bytes32 out2 = new OutputP2SH(remainder, hash160(tx.bytecode));

            // Enforce that these are the only outputs for the current transaction
            require(hash256(out1 + out2) == tx.hashOutputs);
        }
    }

    // Allow the funder to reclaim their remaining pledges
    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```
