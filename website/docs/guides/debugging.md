---
title: Debugging
---

Debugging is no walk in the park. This is especially true for debugging complex smart contracts. Luckily there are strategies that can make it easier for developers to discover bugs in their contracts.

## Categories of Bugs

There are 2 broad categories of smart contract bugs:

### 1. Bug in Transaction Building

The first category of bugs is a bug in the transaction building meaning the 'invocation' of your smart contracts fails. This means the bug is in the usage of the CashScript Transaction builder and you need to carefully review the shape of your transaction and whether it matches the requirements imposed by the smart contract UTXOs.

### 2. Bug in Contract Logic

The second category of bugs is a bug in the smart contract logic which prohibits valid spending, this results in the shape of the Transaction builder not matching with the contracts simply because there is a coding error in the contract! Carefully review the logic in the failing line and if needed check the documentation so you are sure about the functionality of your CashScript contract code.

Whatever category your bug falls into, the first step of debugging is understanding what line in your CashScript contract is making your transaction get rejected. Afterwards, investigation needs to start whether it's a transaction building bug or a bug in contract logic.

## Debugging Tools

The [Transaction Builder](/docs/sdk/transaction-builder) has deep integration with libauth to enable local transaction evaluation, without actual interaction with the Bitcoin Cash network. This allows for fully integrated debugging functionality.

### Error messages

If a CashScript transaction is evaluated with `.debug()` or is sent to a network and rejected, then the transaction will be evaluated locally using libauth to provide the failure reason and debug information. Here is an example of what a CashScript error message looks like:

```bash
HodlVault.cash:23 Require statement failed at input 0 in contract HodlVault.cash at line 23.
Failing statement: require(price >= priceTarget)
Bitauth IDE: [link]
```

Read the error message to see which line in the CashScript contract causes the transaction validation to fail. Investigate whether the contract function invocation is the issue (on the TypeScript SDK side) or whether the issue is in the CashScript contract itself (so you'd need to update your contract and recompile the artifact). If it is not clear **why** the CashScript contract is failing on that line, then you can use the following two strategies: console logging & Bitauth IDE stack trace.

### Console Logging

To help with debugging you can add `console.log` statements to your CashScript contract file to log variables. This way you investigate whether the variables have the expected values when they get to the failing `require` statement in the CashScript file. After adding the `console.log` statements, recompile your contract so they are added to your contract's Artifact.

### Bitauth IDE

Whenever a transaction fails, there will be a link in the console to open your smart contract transaction in the BitAuth IDE. This will allow you to inspect the transaction in detail, and see exactly why the transaction failed. In the BitAuth IDE you will see the raw BCH Script mapping to each line in your CashScript contract. Find the failing line and investigate the failing OpCode. You can break up the failing line, one opcode at a time, to see how the stack evolves and ends with your `require` failure.

It's also possible to export the transaction for step-by-step debugging in the BitAuth IDE without failure. To do so, you can call the `getBitauthUri()` function on the transaction. This will return a URI that can be opened in the BitAuth IDE.

```ts
const uri = await transactionBuilder.getBitauthUri();
```

:::caution
It is unsafe to debug transactions on mainnet using the BitAuth IDE as private keys will be exposed to BitAuth IDE and transmitted over the network.
:::

The Bitauth IDE will show you the two-way mapping between the CashScript contract code generated opcodes. Here is [a Bitauth IDE link][BitauthIDE] for the basic `TransferWithTimeout` contract as an example:

```js
// "TransferWithTimeout" contract constructor parameters
<timeout> // int = <0x90d003>
<recipient> // pubkey = <0x038f55548d7f3d183cebb8ee77036feeb408f4a5030fb486717659bb944fe5eb4c>
<sender> // pubkey = <0x0218d4166169298d42c1f763e243e4b5bc3df8e11690aa953b17a6e02902625f90>

// bytecode
                                       /* pragma cashscript ~0.11.0;                                                   */
                                       /*                                                                              */
                                       /* contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) { */
                                       /*     // Require recipient's signature to match                                */
OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF    /*     function transfer(sig recipientSig) {                                    */
OP_4 OP_ROLL OP_ROT OP_CHECKSIG        /*         require(checkSig(recipientSig, recipient));                          */
OP_NIP OP_NIP OP_NIP OP_ELSE           /*     }                                                                        */
                                       /*                                                                              */
                                       /*     // Require timeout time to be reached and sender's signature to match    */
OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY    /*     function timeout(sig senderSig) {                                        */
OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY /*         require(checkSig(senderSig, sender));                                */
OP_SWAP OP_CHECKLOCKTIMEVERIFY         /*         require(tx.time >= timeout);                                         */
OP_2DROP OP_1                          /*     }                                                                        */
OP_ENDIF                               /* }                                                                            */

```

[BitauthIDE]: https://ide.bitauth.com/import-template/eJzFWAtv2zYQ_isCN2BJ4drUW8raAK3jNkbSJEvcFUMdGBR1stXakidRWYIg--07SrIk23LgDhlGBKEiHu-7x3fUMY_k55TPYMHIEZkJsUyPer3Qh64XCpaJWZfHi558gEiEnIkwjl4LWCznTMDrO9ot9na_pXFEOsSHlCfhUkqhuuFiGScCfCVI4oXCWTorVlEwYgtAiT6-u8nfKR8hgoRJ6RPwsuk0jKbKqATCDWm2LJSRo6_kff90olHNnFCT3HbIHSRpjkg7RJopQkjJ0SMZJSxKA0i-hGI2ChcQZ2ISRstM0MmSJWiBwI1ScN3sfhyJhHGh8ARyhxUWoQ9ZxPM_GlsrP1qQlIMcSvmJHkrzc_2pNL7NqnnMv6NU25JYNzyLclnpNUtC5s0LV1OIfEhuwum2O-N6cUxq65U4qH0akxJmTGqnap0dIh6W8tUZPJCnTrmyG2oTR8zCVOFlWDcBau1f2HwO4oQJJkES4OEyxHy24VSLe0LVynaglf63YVWh2QtppWgHzirkmE8f7rfhymqoMpOLKSJW4B54lpdCCbShqRUPR4N77RXRTjAUXrI0hZ2U3dgGd2yeyVK93YxEWyHgaq_XZF1beY2jNxUF5TkTxUkyScNpxESWQBfdnOBeVJ1O5HMm7uP0WEG9KDOOxhE-bYQxjKqEofL1AOY7w0gob5U36vFYnmZFKNL2-i5q9qm9aFchlDMeZKMiM0stnenas6fGVoRaZDBavDqi4igVScZFnKxHroxs0yt671KfUh2de1PVQy6wzLzv8FDIUN0JTNM0HN8OdF91dA6e5wDYNtWtAMAzqBMYzKQ6DTzDsWzVtkzX81zDCMDEZX5cJW5buaY6vqFalmq5mouPGlcD29JBM3QwPNPjuh84oOIyZcw1dU-1mQVUc6lmaWbg0uMys96DAB77MI6U_UbvlbJM2HTBGh8i5W_aVdUu_XVPHc3xqvcj0C86fgy64koLlQ7K5BTp6qxyVbGjk3On5NKh8vgvvMZcXcOfWZhArfaXVKnqWJ5tCyb4bB-vL68muoK_rob9MzlT-evi86fBb5_fncvn4YcGdFX9ovT8AFFrK_BYkS7tMUpoQyJcX56fF_NITv3TQf_sZvhxw2s5ksLtA-yQ-HcEO2gid2o7Dg-f4V8JfTG8UramwfnNYDvgT_t4tK_Xe4r-vwzPp5pmq--OnCW7PMk8hlnw80au4PpOCjZptsq12qTZ74Pr4Yc_GtA1zcqikiyrvlx7UmwX9M2Xd1dNnpXoz9Gsgu6UVjxLsDXoNbTzy_7ZaPhpUDvcDHgTWtx382Afv63Oiv2P1BJaO7m-vCqCvXP8FwyXdXRxUpwbzwyEfjHYFfSeoi9fXKRoCyHCK0S8b2NYdXgoXjYwg_JV26dFaW3_1pvddxG2tQzveKCU2mUZ_TUDWZOyvS4_00XvW3SHsiftSk2ywUVTVo1AfQtCxS_RaZC1Kwh5ic6INO4ZZNWOke1LAVFlY8mzJEHs97KJPIVwOsNd2vprGWtypNqGhViaa3QIfr7zhC6T8A4zc1b-2bgfEstwLddjhqepaJvuO6pl2hq1uUZdz0HjTUvXLIeCYXsAGmO2a_HA9j3K8YfbJL9V5N9UxotMPpI8yfKy8EhkUx5j3zAsnEGjVm9G9Z5TbMLQFgBuBa5lqrYWcNc3HGrqAQ-Au6aqqtRmjgm6r_nUU33VBWmyjUmjlu5z3fAC2S_jIQQRh4ts4cnkGxgH17LzaBQdPHbg7yuWfCXpPBbk9gkvKnJR5CHUTIqjsHTlx9ZWYlvMVQ1HM1Xug61xmfvA9wPbMTBArmcyZpgOhs-2ASzHYTLjkthww0ScIqMxWdRFpKfmvy00WY1xlnC4fA5-ZXmbSsNxnm4xL_8AUE0PwQ==

