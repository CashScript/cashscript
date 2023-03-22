---
title: Getting Started
---

## Installing the CashScript compiler
The command line CashScript compiler `cashc` can be installed from NPM.

```bash
npm install -g cashc
```

## Installing the JavaScript SDK
The JavaScript SDK can be installed into your project with NPM. Note that CashScript is a [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

```bash
npm install cashscript
```

:::caution
CashScript only offers a JavaScript SDK, but CashScript contracts can be integrated into other languages as well. Because there are no ready-to-use SDKs available for them, this is considered advanced usage, and it is recommended to use the JavaScript SDK.
:::

## Writing your first smart contract
There are some examples available on the [Examples page](/docs/language/examples), that can be used to take inspiration from. Further examples of the JavaScript integration can be found on [GitHub](https://github.com/Bitcoin-com/cashscript/tree/master/examples). A simple example is included below.

```solidity
pragma cashscript ^0.8.0;

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
Read more about the CashScript language syntax in the [Language Description](/docs/language/contracts).
:::

## Integrating into JavaScript
While more detailed examples are available on GitHub, we show an integration of the `TransferWithTimeout` contract in a JavaScript project.

After compiling the contract file to an artifact JSON with cashc, it can be imported into the CashScript SDK.

```bash
cashc ./transfer_with_timeout.cash --output ./transfer_with_timeout.json
```

```javascript
import { ElectrumNetworkProvider, Contract, SignatureTemplate } from 'cashscript';
import { alicePriv, alicePub, bobPriv, bobPub } from './keys.js';
import artifact from './transfer_with_timeout.json';

// Initialise a network provider for network operations
const provider = new ElectrumNetworkProvider('mainnet');
const addressType = 'p2sh20';

// Instantiate a new TransferWithTimeout contract
const contract = new Contract(artifact, [alicePub, bobPub, 100000n], options:{ provider, addressType});

// Call the transfer function with Bob's signature
// i.e. Bob claims the money that Alice has sent him
const transferDetails = await contract.functions
  .transfer(new SignatureTemplate(bobPriv))
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 10000n)
  .send();
console.log(transferDetails);

// Call the timeout function with Alice's signature
// i.e. Alice recovers the money that Bob has not claimed
const timeoutDetails = await contract.functions
  .timeout(new SignatureTemplate(alicePriv))
  .to('bitcoincash:qqeht8vnwag20yv8dvtcrd4ujx09fwxwsqqqw93w88', 10000n)
  .send();
console.log(timeoutDetails);
```

:::tip
Read more about the JavaScript SDK in the [SDK documentation](/docs/sdk/instantiation).
:::
