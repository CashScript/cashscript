---
title: Examples
---

An extensive collection of examples is available in the [GitHub repository][GitHub-CashScript-Examples]. Below we discuss a few of these examples in more details and go through their functionality. This example page focuses on the CashScript syntax, while the [SDK Examples page](/docs/sdk/examples) in the SDK section focuses on use of the SDK to build an application.

## HodlVault
For better or worse, HODLing and waiting for price increases is one of the main things people want to do with their cryptocurrency. But it can be difficult to hold on to your cryptocurrency when the price is going down. So to prevent weak hands from getting the best of you, it's better to store your stash in a smart contract that enforces HODLing for you.

This smart contract works by connecting with a price oracle. This price oracle is a trusted entity that publishes the BCH/USD price every block. This price is passed into the contract, and only if the price is higher than your target price, you can spend the coins.

This involves some degree of trust in the price oracle, but since the oracle produces price data for everyone to use, their incentive to attack *your* smart contract is minimised. To improve this situation, you can also choose to connect with multiple oracle providers so you do not have to trust a single party.

```solidity
pragma cashscript ^0.12.0;

// A minimum block is provided to ensure that oracle price entries from before
// this block are disregarded. i.e. when the BCH price was $1000 in the past,
// an oracle entry with the old block number and price can not be used.
contract HodlVault(pubkey ownerPk, pubkey oraclePk, int minBlock, int priceTarget) {
    function spend(sig ownerSig, datasig oracleSig, bytes oracleMessage) {
        // Decode the message { blockHeight, price }
        bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);
        int blockHeight = int(blockHeightBin);
        int price = int(priceBin);


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

For how to put the HodlVault contract to use in a Typescript application, see the [SDK examples page](/docs/sdk/examples#hodlvault).


## Licho's Mecenas
Donations are a great way to support the projects you love, and periodic donations can incentivise continuous improvement to the product. But platforms like Patreon generally take fees of 10%+ and don't accept cryptocurrencies. Instead you can create a peer-to-peer smart contract that allows a recipient to withdraw a specific amount every month.

The contract works by checking that a UTXO is at least 30 days old, after which it uses a covenant to enforce that the `pledge` amount is sent to the recipient, while the remainder is sent back to the contract itself. By sending it back, the `this.age` counter is effectively reset, meaning this process can only be repeated when another 30 days have past.

Due to the nature of covenants, we have to be very specific about the outputs (amounts and destinations) of the transaction. This also means that we have to account for the special case where the remaining contract balance is lower than the `pledge` amount, meaning no remainder should be sent back. Finally, we have to account for a small fee that has to be taken from the contract's balance to pay the miners.

```solidity
pragma cashscript ^0.12.0;

contract Mecenas(bytes20 recipient, bytes20 funder, int pledge, int period) {
    function receive() {
        require(this.age >= period);

        // Check that the first output sends to the recipient
        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

        // Calculate the value that's left
        int minerFee = 1000;
        int currentValue = tx.inputs[this.activeInputIndex].value;
        int changeValue = currentValue - pledge - minerFee;

        // If there is not enough left for *another* pledge after this one,
        // we send the remainder to the recipient. Otherwise we send the
        // remainder to the recipient and the change back to the contract
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

## AMM DEX

AMM DEX contract based on [the Cauldron DEX contract][Cauldron-Whitepaper], you can read more details about the contract design there.

The CashScript contract code has the big advantage of abstracting away any stack management, having variable names, explicit types and a logical order of operations (compared to the 'reverse Polish notation' of raw script).

```solidity
pragma cashscript ^0.12.0;

contract DexContract(bytes20 poolOwnerPkh) {
    function swap() {
        // Verify it is the correct token category
        bytes inputToken = tx.inputs[this.activeInputIndex].tokenCategory;
        bytes outputToken = tx.outputs[this.activeInputIndex].tokenCategory;
        require(inputToken == outputToken);

        // Enforce version 2
        // Enforcing version is to make sure that tools that
        // use this contract stay compatible, when and if
        // transaction format changes in the future.
        require(tx.version == 2);

        // Verify that this contract lives on on the output with the same input as this contract.
        bytes inputBytecode = tx.inputs[this.activeInputIndex].lockingBytecode;
        bytes outputBytecode = tx.outputs[this.activeInputIndex].lockingBytecode;
        require(inputBytecode == outputBytecode);

        // Calculate target K
        int targetK = tx.inputs[this.activeInputIndex].value * tx.inputs[this.activeInputIndex].tokenAmount;

        // Calculate fee for trade. Fee is ~0.3%
        int tradeValue = abs(tx.inputs[this.activeInputIndex].value - tx.outputs[this.activeInputIndex].value);
        int fee = (tradeValue * 3) / 1000;

        // Get effective output K when including the fee.
        int effectiveOutputK = (tx.outputs[this.activeInputIndex].value - fee) * tx.outputs[this.activeInputIndex].tokenAmount;

        // Verify that effective K > target K
        require(effectiveOutputK >= targetK);
    }
    function withdrawal(pubkey poolOwnerPk, sig poolOwnerSig) {
        require(hash160(poolOwnerPk) == poolOwner);
        require(checkSig(poolOwnerSig, poolOwnerPk));
    }
}
```

Compared to the manually written and hand-optimized opcodes version of the contract, the CashScript compiled bytecode has just 5 extra opcodes overhead (7 extra bytes). Furthermore, even contracts with hand-optimized bytecode can still be used with the CashScript SDK, [find out more in the optimization guide](/docs/guides/optimization#advanced-hand-optimizing-bytecode).

More advanced examples on covenants, using NFTs to keep local state and issuing NFTs as receipts can be found in the [Covenants & Introspection Guide](/docs/guides/covenants).

[GitHub-CashScript-Examples]: https://github.com/CashScript/cashscript/tree/master/examples
[Cauldron-Whitepaper]: https://www.cauldron.quest/_files/ugd/ae85be_b1dc04d2b6b94ab5a200e3d8cd197aa3.pdf
