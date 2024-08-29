---
title: Debugging
---

Debugging is no walk in the park. This is especially true for debugging complex smart contracts. Luckily there is a handful of strategies that can make it easier for developers to discover bugs in their contracts.

Generally there are 2 broad categories of smart contract bugs:

- A bug in your invocation making the transaction invalid
- A bug in the smart contract which prohibits valid spending

Whatever category your bug falls into, the first step is discovering what line in your CashScript contract is making your transaction get rejected. Afterwards, investigation needs to start whether it's a contract bug, or an invocation bug.

## Simple Transaction Builder

The [Simple Transaction Builder](/docs/sdk/transactions) has deep integration with libauth to enable local transaction evaluation, without actual interaction with the Bitcoin Cash network. This allows for advanced debugging functionality.

:::note
Currently the CashScript debugging tools only work with the [Simple Transaction Builder](/docs/sdk/transactions). We plan to extend the debugging tools to work with the [Advanced Transaction Builder](/docs/sdk/transactions-advanced) in the future.
:::

### Error messages

If a CashScript transaction is sent using any network provider and is rejected by the network (or the `MockNetworkProvider`), the transaction will be evaluated locally using libauth to provide failure reasons and debug information in addition to the failure reason communicated by the network.

Read the error message to see which line in the CashScript contract causes the transaction validation to fail. Investigate whether the contract function invocation is the issue (on the TypeScript SDK side) or whether the issue is in the CashScript contract itself (so you'd need to update your contract and recompile the artifact). If it is not clear **why** the CashScript contract is failing on that line, then you can use the following two strategies: console logging & Bitauth IDE stack trace.

### Console Logging

To help with debugging you can add `console.log` statements to your CashScript contract file to log variables. This way you investigate whether the variables have the expected values when they get to the failing `require` statement in the CashScript file. After adding the `console.log` statements, recompile your contract so they are added to your contract's Artifact. 

### Bitauth IDE

Whenever a transaction fails, there will be a link in the console to open your smart contract transaction in the BitAuth IDE. This will allow you to inspect the transaction in detail, and see exactly why the transaction failed. In the BitAuth IDE you will see the raw BCH Script mapping to each line in your CashScript contract. Find the failing line and investigate the failing OpCode. You can break up the failing line, one opcode at a time, to see how the stack evolves and ends with your `require` failure.

It's also possible to export the transaction for step-by-step debugging in the BitAuth IDE without failure. To do so, you can call the `bitauthUri()` function on the transaction. This will return a URI that can be opened in the BitAuth IDE.

```ts
const transaction = contract.functions.exampleFunction(0n).to(contract.address, 10000n);
const uri = await transaction.bitauthUri();
```

:::caution
It is unsafe to debug transactions on mainnet as private keys will be exposed to BitAuth IDE and transmitted over the network.
:::

The Bithauth IDE will show you the two-way mapping between the CashScript contract code generated opcodes. Here is [a Bithauth IDE link][BitauthIDE] for the basic `TransferWithTimeout` contract as an example:

```js
// "TransferWithTimeout" contract constructor parameters
<timeout> // int = <0x07>
<recipient> // pubkey = <0x0262f5c18adf3d9800c18b5e63fa6505ec8eb1d49c65855d62aea698425a39966e>
<sender> // pubkey = <0x0262f5c18adf3d9800c18b5e63fa6505ec8eb1d49c65855d62aea698425a39966e>

// bytecode
                                                /* pragma cashscript >= 0.10.0;                                                  */
                                                /*                                                                              */
                                                /* contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) { */
                                                /*     // Require recipient's signature to match                                */
OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF             /*     function transfer(sig recipientSig) {                                    */
OP_4 OP_ROLL OP_2 OP_ROLL OP_CHECKSIG           /*         require(checkSig(recipientSig, recipient));                          */
OP_NIP OP_NIP OP_NIP OP_ELSE                    /*     }                                                                        */
                                                /*                                                                              */
                                                /*     // Require timeout time to be reached and sender's signature to match    */
OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY         /*     function timeout(sig senderSig) {                                        */
OP_3 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG OP_VERIFY /*         require(checkSig(senderSig, sender));                                */
OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP     /*         require(tx.time >= timeout);                                         */
OP_1 OP_NIP                                     /*     }                                                                        */
OP_ENDIF                                        /* }                                                                            */
                                                /*      
```

## Advanced Transaction Builder

Because the advanced transaction builder does not yet support the advanced debugging tooling, you are left with just a few strategies.

### Failing Opcode

When a transaction gets rejected by a full node, it will return a cryptic error message. Read the message carefully to investigate whether the issue is a failing script (failing OpCode) or whether a standardness rule like minimum-relay-fee is violated. If the cause is a failing OpCode, you can check the contract's Artifact to see how many appearances this OpCode has. Sometimes the OpCode only appears once or twice, indicating where the failing `require` statement is. Other times you might see 15 appearances of the OpCode leaving you to try the next strategies.

### Removing Contract Checks

If your contract fails, you can remove (or comment out) the lines that are the likely cause of the error. After recompiling to a new Artifact you can test whether the remaining subcontract works or fails with a different error. If this is the case, then you learned that there is an issue in the removed CashScript code block. In the worst case, when you have no indication from the failing opcode (previous strategy), then you will have to try to remove different parts of your contract and try different sub-contracts repeatedly. 

To use this strategy effectively, the contract setup with funding should be automated as to avoid having to send testnet coins manually to each different subcontract. However inefficient, this strategy should always be able to get you to find the failing line in your CashScript contract. Then you can investigate whether the issue is the contract invocation or the `require` statement in the CashScript file.

### Single Check Contract

If it is unclear whether the issue is the contract invocation or the `require` statement in the CashScript file, it might prove handy to create a 'single-check' contract, which has only the previously failing `require` statement. The goal then is to discover if your transaction is the issue, and you are violating a correct contract requirement, or whether the contract is enforcing an incorrect/impossible condition to hold in the spending transaction.

[BitauthIDE]: https://ide.bitauth.com/import-template/eJzVWG1v2zYQ_isCMWBJ4drUG21lbYAmcRsjaZIl6YqhDgyKomItNuVRVJbA8H_fUe9-qeF06Yfxg0WRvLvnjs9RR8_RLwkb8ylFB2is1Cw56HSigLf9SNFUjdssnnZ0hwsVMaqiWLxVfDqbUMXfPuJ2Ltv-K4kFaqGAJ0xGM70K1A2ms1gqHhihjKcGo8k4n4WFgk45rLiVVCQhl18jNb6NpjxO9WSSznJBdPANHR2fjixs2SPsorsWeuQyybTjFtKQVMQTdDBHMypBpYJZ_baM4zgWSlKmDCZ55oFBBYBKBcteGqIVsKWxXFei0Uxi9gAjqdCdUfamQVEZUX-SI5GcRbMIsI2S6H4dzLBecBPdD1Ft3ojDGtQQqSI2Q1TDaorCqHqe6dEz_owWAJOLgMtNFvOZVVtqHCUGK2JT2yjUVNq_0smEqxOqqDZSIdjq2Y6mamXfsaYKTmywVUztaElV5Npopwz7KALfn9bN3WT9eneyZYaKDf7EWap4bWhF00Z70Bqkmi-xKaNykvCMbfyRTlJItFGpVZOtMJQLVeyEkU5niTWbCD4U75boqdNXxFLqvqAqlbwNOEcQqVmqkkMDVMLMUAwF9Fa8j0QVZ1C77HcmGQllvDfe4cOhqFIG3MpzCCJQ-qufkbi_zQM1s5KxbdUB3ejlhnMDHGZVnsciUTJlKpbLzhc0WIL3hLuHzbhkk7PUf-DPxbxFrNBlZo8GoR14PYyh77uc2CElLnY563HfDByPEbfnugGxKKfE6zmWS23PI4Rr_Xla_Rzl2fb4z4qzOOBDYbywdd4YM0nvp7RxRhuH7w3c7rXxby_VZhhvOj-E4VXbD2KoKLSBYXvFvuU72Sq3sSJOK6NUQbF9Y_5f4gD7ec3_TiPJa_2_JkaVpvrsmVLFxrvE4fJqZBvwczU4PtNPrH8uvnzu__7lw7nuDz5uwlDle3mm7IF5o_kJ0k7u0AoMjjZ1fXmembSaL8en_eOzm8GndQy6yTwQe1BpsAewuteE0KoB7e9v4WqB4WJwZaw9-uc3_U0yBYbFLj7u0v7HeZE9ak4WJM-emoq-pimFDQqy0irPkO_ytcnJkgLmKif_6F8PPv65iqHmZJGTmpK5ud35uBXDGidrLNs4WWFoFXC2snEJw7rZ88vjs9vB535hF4ZPri-vmnFoYlBP7Wwf4MQuD5_dD-0mBp0Ou7SfkRc6DS9OVg6i7RhezX6J4aUyr5-bKK8MuYALRZzVhuslIAwWpVG_mFu7eH0QUJhSuKRxo5DXKfPPmOtE1AVy8Y3Pq9e8RNQ1Z1tr0iUq2CjLCd0vbxboNeoVtHSJeC2V1U1BK-yi9ZIeYV1zslRKsHukq8pTHt2PQcJaHtZfe3Rgds1e1_QcDLPwlc_vmDJ6hHCfFa8rFz3EnYAwSrnjmbbj-TYLzSBgVkg8jK0uDT3sU9-1AuZzjwQMRm2XEmb1HOLTrk1Qdi_IPra02upI6EocLgNzpKvyGEqMQe6Q2apGbmuZU6jgAItHHdMnNMDEcmyn1w2xF1oEguoHDrFcn1gcez4Ofdt1Qs58gu3ANonjEerYZtDTFTccL1wwfpFOfb35juXBdBd-y2IeivajiiXfUDKJFbpb3OWVvcrCaGGX2FaOtPRjTXS-0FfoScpvqIoT4Cc4hzFetHZb27U9Z9H8a8DSSRSnkvHLbWZLxGsKe8TrLu5gN_4FON-z9w==
