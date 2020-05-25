---
title: Getting Started
---

## Installing the CashScript compiler
The command line CashScript compiler `cashc` can be installed from NPM.

```bash
npm install -g cashc
```

## Installing the JavaScript SDK
The JavaScript SDK can be installed into your project with NPM.

```bash
npm install cashscript
```

:::caution
CashScript only offers a JavaScript SDK, but CashScript contracts can be integrated into other languages as well. Because there are no ready-to-use SDKs available for them, this is considered advanced usage, and it is recommended to use the JavaScript SDK.
:::

## Writing your first smart contract
There are some examples available on the [Examples page](/docs/examples), that can be used to take inspiration from. Further examples of the JavaScript integration can be found on [GitHub](https://github.com/Bitcoin-com/cashscript/tree/master/examples). A simple example is included below.

```solidity
pragma cashscript ^0.4.0;

contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    // Allow the recipient to claim their received money
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    // Allow the sender to reclaim their sent money after the timeout is reached
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
```

:::tip
Read more about the CashScript language syntax in the [Language Description](/docs/language).
:::

## Integrating into JavaScript
While more detailed examples are available on GitHub, we show an integration of the `TransferWithTimeout` contract in a JavaScript project.

```javascript
const { BITBOX } = require('bitbox-sdk');
const { Contract, Sig } = require('cashscript');
const { alice, bob, alicePk, bobPk } = require('./keys');

async function run() {
  // Compile the TransferWithTimeout contract
  const TWT = Contract.compile('./transfer_with_timeout.cash', 'mainnet');

  // Instantiate a new TransferWithTimeout contract
  const instance = TWT.new(alicePk, bobPk, 600000);

  // Call the transfer function with Bob's signature
  // i.e. Bob claims the money that Alice has sent him
  const transferDetails = await instance.functions
    .transfer(new Sig(bob))
    .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 10000)
    .send();
  console.log(transferDetails);

  // Call the timeout function with Alice's signature
  // i.e. Alice recovers the money that Bob has not claimed
  const timeoutDetails = await instance.functions
    .timeout(new Sig(alice))
    .to('bitcoincash:qqeht8vnwag20yv8dvtcrd4ujx09fwxwsqqqw93w88', 10000)
    .send();
  console.log(timeoutDetails);
}
```

:::tip
Read more about the JavaScript SDK in the [SDK documentation](/docs/sdk).
:::
