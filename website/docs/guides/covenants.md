---
title: Writing Covenants
sidebar_label: Covenants
---

Covenants are all the rage in Bitcoin Cash smart contracts. But what are they, and how do you use them? In one sentence: **a covenant is a constraint on how money can be spent**. A simple example is creating a smart contract that may **only** send money to one specific address and nowhere else. The term *Covenant* originates in property law, where it is used to constrain the use of any object - or in the case of BCH, the use of money.

Bitcoin covenants were first proposed in a paper titled [Bitcoin Covenants][bitcoin-covenants], but several other proposals have been created over the years. Bitcoin Cash covenants use an opcode called `OP_CHECKDATASIG`, which allows you to verify a digital signature over any message.

In Bitcoin Cash, each transaction needs to be authorised with a signature over a hash representation of the transaction. This hash is called the **sighash**, while the actual transaction data is contained in the **sighash preimage**. By using `OP_CHECKSIG` and `OP_CHECKDATASIG` with the same signature, we can **gain access to the sighash data**, which can then be used to put constraints on the contract.

CashScript has **abstracted away a lot of the complexity** associated with covenants. Because this is left up to the compiler, the preimage passing and decoding is done in the **safest and most optimal way**, allowing the contract developer to focus on writing the contract logic. This guide focuses specifically on writing covenants with CashScript, so we don't discuss their inner workings. If you're interested in covenants on a lower level, Tendo Pein has written an [accessible technical guide][spedn-covenants] on exactly that.

## Accessing sighash data
When using CashScript to write your smart contracts, all data from the sighash is **readily available** by referencing `tx.<field>`. The exact data in the sighash can differ depending on the *hashtype* used in generating the sighash, but for now we only discuss the default behaviour using the `SIGHASH_ALL` hashtype. For the full documentation on sighash behaviour, see [BitcoinCash-BIP143][sighash-docs].

1. **`bytes4 tx.version`** - Version of the current transaction. **Note:** needs to be cast to `int` before applying arithmetic.
2. **`bytes32 tx.hashPrevouts`** - Double SHA256 hash of the serialisation of the outpoint (`txid` + `vout`) of all transaction inputs.
3. **`bytes32 tx.hashSequence`** - Double SHA256 hash of the serialisation of the `nSequence` field of all transaction inputs.
4. **`bytes36 tx.outpoint`** - Outpoint (`bytes32 txid` + `bytes4 vout`) of the current UTXO being spent.
5. **`bytes tx.bytecode`** - Bitcoin Script bytecode of the current contract.
6. **`bytes8 tx.value`** - Value of the current input being spent. If the contract only uses a single UTXO, this is equivalent to the contract's balance. If the contract uses multiple UTXOs this value represents only a part of the contract's balance. **Note:** needs to be cast to `int` before applying arithmetic. Because the `int` type is limited to 4 bytes, `tx.value` can only be used in arithmetic when it is below ~21 BCH.
7. **`bytes4 tx.sequence`** - `nSequence` field of the current UTXO being spent.
8. **`bytes32 tx.hashOutputs`** - Double SHA256 hash of all outputs in the transaction. An output contains an 8 byte amount and a locking script of either 24 bytes for `P2SH` or 26 bytes for `P2PKH`.
9. **`bytes4 tx.locktime`** - `nLockTime` field of the current UTXO being spent.
10. **`bytes4 tx.hashtype`** - The hashtype used to generate the sighash and signature. See [BitcoinCash-BIP143][sighash-docs] for the implications of different hashtypes.

## Using sighash data
While we know the individual data fields, it's not immediately clear how this can be used to create useful smart contracts on Bitcoin Cash. But there are several constraints that can be created using these fields, most important of which are constraints on the recipients of funds, so that is what we discuss.

### Restricting P2PKH recipients
One interesting technique in Bitcoin Cash is called blind escrow, meaning that funds are placed in an escrow contract. This contract can only release the funds to one of the escrow participants, and has no other control over the funds. Non-custodial local exchange [local.bitcoin.com](https://local.bitcoin.com/r/rkalis) uses `OP_CHECKDATASIG` to do this, but we can also achieve something similar by restricting recipients with a covenant.

```solidity
contract Escrow(bytes20 arbiter, bytes20 buyer, bytes20 seller) {
    function spend(pubkey pk, sig s) {
        require(hash160(pk) == arbiter);
        require(checkSig(s, pk));

        // Create and enforce outputs
        int minerFee = 1000; // hardcoded fee
        bytes8 amount = bytes8(int(bytes(tx.value)) - minerFee);
        bytes34 buyerOutput = new OutputP2PKH(amount, buyer);
        bytes34 sellerOutput = new OutputP2PKH(amount, seller);
        require(tx.hashOutputs == hash256(buyerOutput) || tx.hashOutputs == hash256(sellerOutput);
    }
}
```

This contract starts by doing the necessary checks to make sure the transaction is signed by the arbiter. Next up it creates transaction outputs that send the full [`tx.value`][tx.value] to either the buyer or seller using [`OutputP2PKH`][OutputP2PKH]. A small part of [`tx.value`][tx.value] is reserved for the transaction fee.

Note that we use a hardcoded fee as it is difficult to calculate the exact transaction fee inside the smart contract. It then uses [`tx.hashOutputs`][tx.hashOutputs] to check that the transactions outputs are equal to one of the two outputs that were created for the recipients.

### Restricting P2SH recipients
Besides sending money to `P2PKH` addresses, it is also possible to send money to a smart contract (`P2SH`) address. This can be used in the same way as a `P2PKH` address if the script hash is known beforehand, but this can also be used to make sure that money has to be sent back to the current smart contract.

This is especially effective when used together with time constraints. An example is the *Licho's Last Will* contract. This contract puts a dead man's switch on the contract's holdings, and requires the owner to send a heartbeat to the contract every six months. If the contract hasn't received this heartbeat, an inheritor can claim the funds instead.

```solidity
pragma cashscript ^0.3.0;

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

        // Create and enforce outputs
        int minerFee = 1000; // hardcoded fee
        bytes8 amount = bytes8(int(bytes(tx.value)) - minerFee);
        bytes32 output = new OutputP2SH(amount, hash160(tx.bytecode)
        require(tx.hashOutputs == hash256(output));
    }
}
```

This contract has three functions, but only the `refresh()` function uses a covenant. Again it performs necessary checks to verify that the transaction is signed by the owner, after which it creates an output that sends the full [`tx.value`][tx.value] back to the same contract (by using [`tx.bytecode`][tx.bytecode]) and it uses [`tx.hashOutputs`][tx.hashOutputs] to enforce sending to this output.

The difference is that the contract is using [`OutputP2SH`][OutputP2SH] to send to a `P2SH` address rather than `P2PKH`. Sending the full [`tx.value`][tx.value] back to the same contract effectively resets the [`tx.age`][tx.age] counter, so the owner of the contract needs to do this every 180 days.

### Restricting P2PKH and P2SH
The earlier examples showed sending money to only a single output of either `P2PKH` or `P2SH`. But there nothing preventing us from writing a contract that can send to multiple outputs, including a combination of `P2PKH` and `P2SH` outputs. A good example is the *Licho's Mecenas* contract that allows you to set up recurring payments where the recipient is able to claim the same amount every month, while the remainder has to be sent back to the contract.

```solidity
contract Mecenas(bytes20 recipient, bytes20 funder, int pledge) {
    function receive(pubkey pk, sig s) {
        require(checkSig(s, pk));

        require(tx.age >= 30 days);

        // Create and enforce outputs
        int minerFee = 1000; // hardcoded fee
        bytes8 amount1 = bytes8(pledge);
        bytes8 amount2 = bytes8(int(bytes(tx.value)) - pledge - minerFee);
        bytes34 out1 = new OutputP2PKH(amount1, recipient);
        bytes32 out2 = new OutputP2SH(amount2, hash160(tx.bytecode));
        require(hash256(out1 + out2) == tx.hashOutputs);
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

This contract applies similar techniques as the previous two examples to verify the signature, although in this case it does not matter who the *signer* of the transaction is. Because the outputs are restricted with covenants, there is **no way** someone could call this function to send money **anywhere but the correct outputs**. As with the other examples outputs are constructed and compared to [`tx.hashOutputs`][tx.hashOutputs].

### Simulating state
A more advanced use case of restricting recipients is so-called simulated state. This works by restricting the recipient to a **slightly amended version of the current contract**. This can be done when the changes to the contract are only to its constructor parameters and when these parameters are of a known size (like `bytes20` or `bytes4`).

To demonstrate this we consider the Mecenas contract again, and focus on a drawback of this contract: you have to claim the funds at exactly the right moment or you're leaving money on the table. Every time you claim money from the contract, the [`tx.age`][tx.age] counter is reset, so the next claim is possible 30 days after the previous claim. So if we wait a few days to claim, **these days are basically wasted**.

Besides these wasted days it can also be inconvenient to claim at set intervals, rather than the "streaming" model that the Ethereum project [Sablier](https://www.sablier.finance/) employs. Instead of set intervals, you should be able to claim funds at any time during the "money stream". Using simulated state, we can approach a similar system with BCH.

```solidity
contract Mecenas(
    bytes20 recipient,
    bytes20 funder,
    int pledgePerBlock,
    bytes4 initialBlock,
) {
    function receive(pubkey pk, sig s, int pledge) {
        require(checkSig(s, pk));

        int initial = int(initialBlock);
        require(tx.time >= initial);

        // Pledge amount calculation is done in client, verified in contract
        // because multiplication is disabled in Bitcoin Script.
        // We do an extra modulo check to verify correctness of the division
        int passedBlocks = int(tx.locktime) - initial;
        require(pledge / passedBlocks == pledgePerBlock);
        require(pledge % passedBlocks == 0);

        // Cut out old initialBlock (OP_PUSHBYTES_4 <initialBlock>)
        // Insert new initialBlock (OP_PUSHBYTES_4 <tx.locktime>)
        // Note that constructor parameters are added in reverse order,
        // so initialBlock is actually the first statement in the contract bytecode.
        bytes newContract = 0x04 + tx.locktime + tx.bytecode.split(5)[1];

        // Create and enforce outputs
        int minerFee = 1000; // hardcoded fee
        bytes8 amount1 = bytes8(pledge);
        bytes8 amount2 = bytes8(int(bytes(tx.value)) - pledge - minerFee);
        bytes34 out1 = new OutputP2PKH(amount1, recipient);
        bytes32 out2 = new OutputP2SH(amount2, hash160(newContract));
        require(hash256(out1 + out2) == tx.hashOutputs);
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
```

Instead of having a pledge per 30 day period, we define a pledge per block. At any point in time we can calculate how much money the recipient has earned. Then the covenant **enforces that this amount is withdrawn from the contract**. The remainder is sent to a new stream that **starts at the end of of the previous one**. The bytecode of this new stream is computed by "cutting out" some of the existing constructor parameters in the [`tx.bytecode`][tx.bytecode] field and replacing them with new values. This process can be applied to the new stream until the money in the stream runs out.

A drawback of using this "simulated state" method is that every new stream is a new contract with its own address. So additional abstractions are needed to provide a clear frontend layer for a system like this. Simulated state can be used to create much more sophisticated systems and is the main idea that powers complex solutions such as the offline payments card [Be.cash](https://be.cash), and the Proof-of-Work SLP token [MistCoin](https://mistcoin.org).

### Restricting OP_RETURN outputs
A final way to restrict outputs is adding `OP_RETURN` outputs to the mix. This is necessary when you want to make any SLP-based covenants, such as [MistCoin](https://mistcoin.org) or the [SLP Mint Contracts](https://github.com/simpleledgerinc/slp-mint-contracts). The integration of SLP and CashScript is still in its early stages though, so that is a topic for a more advanced guide.

Right now we'll use a simpler (but also less useful) example, where we restrict a smart contract to only being able to post on the on-chain social media platform [Memo.cash](https://memo.cash). For this we use [`OutputNullData`][OutputNullData], which works slightly different than the other `Output` objects. While regular outputs have a value and a locking script. `OP_RETURN` outputs can include different chunks of data, and generally do not have a value. This is why the constructor for [`OutputNullData`][OutputNullData] instead takes a list of `bytes` chunks.

```solidity
contract Announcement() {
    function announce(pubkey pk, sig s) {
        require(checkSig(s, pk));

        // Create the memo.cash announcement output
        bytes announcement = new OutputNullData([0x6d02, bytes('Hello world!')]);

        int minerFee = 1000;
        int changeAmount = int(bytes(tx.value)) - minerFee;
        bytes32 change = new OutputP2SH(bytes8(changeAmount), hash160(tx.bytecode));
        require(tx.hashOutputs == hash256(announcement + change));
    }
}
```

In this contract we construct an "announcement" `OP_RETURN` output, we reserve a part of [`tx.value`][tx.value] for the miner fee, and finally we send the remainder of the [`tx.value`][tx.value] back to the contract with an [`OutputP2SH`][OutputP2SH]. Again these outputs are enforced using [`tx.hashOutputs`][tx.hashOutputs].

## Conclusion
We have discussed the main uses for covenants as they exist on Bitcoin Cash today. We've seen how we can achieve different use case by combining transaction output restrictions to `P2SH` and `P2PKH` outputs. We also touched on more advanced subjects such as simulated state and `OP_RETURN` outputs. Of course **a lot of innovation is still happening** in this field. A month ago MistCoin did not exist yet, and projects like [AnyHedge](https://anyhedge.com) are still in development, so hopefully we'll see more interesting applications using these techniques!

Covenants are the **main differentiating factor** for BCH smart contracts when compared to BTC, while keeping the same **efficient stateless verification**. If you're interested in learning more about the differences in smart contracts among BCH, BTC and ETH, read the article [*Smart contracts on Ethereum, Bitcoin and Bitcoin Cash*](https://kalis.me/smart-contracts-eth-btc-bch/) on Kalis.me.

[bitcoin-covenants]: https://fc16.ifca.ai/bitcoin/papers/MES16.pdf
[spedn-covenants]: https://read.cash/@pein/bch-covenants-with-spedn-c1170a02
[bip143]: https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#specification
[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
[sighash-docs]: https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/replay-protected-sighash.md#digest-algorithm

[tx.age]: /docs/language/globals#txage
[tx.value]: /docs/language/globals#txvalue
[tx.bytecode]: /docs/language/globals#txbytecode
[tx.hashOutputs]: /docs/language/globals#txhashoutputs

[OutputP2PKH]: /docs/language/globals#outputp2pkh
[OutputP2SH]: /docs/language/globals#outputp2sh
[OutputNullData]: /docs/language/globals#outputnulldata
