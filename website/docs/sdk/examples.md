---
title: Examples
---

An extensive collection of examples is available in the [GitHub repository][github-examples]. Below we discuss a few of these examples in more details. These examples focus mainly on the use of the SDK, while the [Examples page](/docs/language/examples) in the language section focuses more on the CashScript syntax.

## Transfer With Timeout
The idea of this smart contract is explained on the [Language Examples page](/docs/language/examples#transfer-with-timeout). The gist is that it allows you to send an amount of BCH to someone, but if they don't claim the sent amount, it can be recovered by the sender.


```solidity title="TransferWithTimeout.cash"
contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
```

Now to put this smart contract in use in a JavaScript application we have to use the CashScript SDK in combination with a BCH library such as [BCHJS][bchjs], [bitcore-lib-cash][bitcore] or [Libauth][libauth]. These libraries are used to generate public/private keys for the contract participants. Then these keys can be used in the CashScript SDK. The key generation code is left out of this example, since this works differently for every library.

```ts title="TransferWithTimeout.js"
import { CashCompiler, Contract, SignatureTemplate } from 'cashscript';
import { alicePriv, alicePub, bobPriv, bobPub } from './somewhere';

async function run() {
  // Compile the TransferWithTimeout contract
  const artifact = CashCompiler.compileFile('./transfer_with_timeout.cash'));

  // Instantiate a new contract using the compiled artifact
  // and constructor arguments:
  // { sender: alicePub, recipient: bobPub, timeout: 1000000 }
  // No network provider is provided, so the default ElectrumNetworkProvider is used
  const contract = new Contract(artifact, [alicePub, bobPub, 1000000]);

  // Display contract address and balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Call the transfer function with Bob's signature
  // i.e. Bob claims the money that Alice has sent him
  const txDetails = await contract.functions
    .transfer(new SignatureTemplate(bobPriv))
    .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 10000)
    .send();
  console.log(txDetails);

  // Call the timeout function with Alice's signature
  // i.e. Alice recovers the money that Bob has not claimed
  // But because the timeout has not passed yet, the function fails and
  // we call the meep function so the transaction can be debugged instead
  const meepStr = await contract.functions
    .timeout(new SignatureTemplate(alicePriv))
    .to('bitcoincash:qqeht8vnwag20yv8dvtcrd4ujx09fwxwsqqqw93w88', 10000)
    .meep();
  console.log(meepStr);
}
```

## Memo.cash Announcement
[Memo.cash](https://memo.cash) is a Twitter-like social network based on Bitcoin Cash. It uses `OP_RETURN` outputs to post messages on-chain. By using a covenant we can create an example contract whose only job is to post Isaac Asimov's first law of smart contracts to Memo.cash. Just to remind its fellow smart contracts.

This contract expects a hardcoded transaction fee of 1000 satoshis. This is necessary due to the nature of covenants (See the [Licho's Mecenas example](/docs/language/examples#lichos-mecenas) for more information on this). The remaining balance after this transaction fee might end up being lower than 1000 satoshis, which means that the contract does not have enough leftover to make another announcement.

To ensure that this leftover money does not get lost in the contract, the contract performs an extra check, and adds the remainder to the transaction fee if it's too low.

```solidity title="Announcement.cash"
pragma cashscript ^0.4.0;

// This contract enforces making an announcement on Memo.cash and sending the
// remaining balance back to the contract.
contract Announcement() {
    function announce(pubkey pk, sig s) {
        // The transaction can be signed by anyone, because the contract can only
        // make an announcement
        require(checkSig(s, pk));

        // Create the memo.cash announcement output
        bytes announcement = new OutputNullData([
            0x6d02,
            bytes('A contract may not injure a human being or, '
                + 'through inaction, allow a human being to come to harm.')
        ]);

        // Use a hardcoded miner fee
        int minerFee = 1000;

        // Calculate leftover money after fee (1000 sats)
        int remainder = int(bytes(tx.value)) - minerFee;
        if (remainder >= minerFee) {
            // Send remainder back to the contract if there's enough
            // left for another announcement
            bytes32 change = new OutputP2SH(bytes8(remainder), hash160(tx.bytecode));
            require(tx.hashOutputs == hash256(announcement + change));
        } else {
            // Don't send the remainder back if there's not enough left
            // (i.e. add the remainder to the miner fee)
            require(tx.hashOutputs == hash256(announcement));
        }
    }
}
```

The CashScript code above ensures that the smart contract **can only** be used in the way specified in the code. But the transaction needs to be created by the SDK, and to ensure that it complies with the rules of the smart contract, we need to use some of the more advanced options of the SDK.

```ts title="Announcement.js"
import {
  CashCompiler,
  ElectrumNetworkProvider,
  Contract,
  SignatureTemplate,
} from 'cashscript';
import { alicePriv, alicePub } from './somewhere';

export async function run(){
    // Compile the Announcement contract to an artifact object
    const artifact = CashCompiler.compileFile('./announcement.cash');

    // Initialise a network provider for network operations on MAINNET
    const provider = new ElectrumNetworkProvider('mainnet');

    // Instantiate a new contract using the compiled artifact and network provider
    // AND providing the constructor parameters (none)
    const contract = new Contract(artifact, [], provider);

  // Display contract address, balance, opcount, and bytesize
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());
  console.log('contract opcount:', contract.opcount);
  console.log('contract bytesize:', contract.bytesize);

  // Create the announcement string. Any other announcement will fail because
  // it does not comply with the smart contract.
  const str = 'A contract may not injure a human being or, '
    + 'through inaction, allow a human being to come to harm.';

  // Send the announcement transaction
  const txDetails = await contract.functions
    .announce(alicePub, new SignatureTemplate(alicePriv))
    // Add the announcement string as an OP_RETURN output
    .withOpReturn(['0x6d02', str])
    // Hardcodes the transaction fee (like the contract expects)
    .withHardcodedFee(1000)
    // Only add a "change" output if the remainder is higher than 1000
    .withMinChange(1000)
    .send();

  console.log(txDetails);
}
```

[bitbox]: https://developer.bitcoin.com/bitbox/
[electrum-cash]: https://www.npmjs.com/package/electrum-cash
[fullstack]: https://fullstack.cash/
[bchjs]: https://bchjs.fullstack.cash/
[bitcore]: https://github.com/bitpay/bitcore/tree/master/packages/bitcore-lib-cash
[libauth]: https://libauth.org/
[github-examples]: https://github.com/Bitcoin-com/cashscript/tree/master/examples
