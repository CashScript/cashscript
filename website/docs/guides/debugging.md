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
const uri = transactionBuilder.getBitauthUri();
```

:::caution
It is unsafe to debug transactions on mainnet using the BitAuth IDE as private keys will be exposed to BitAuth IDE and transmitted over the network.
:::

The Bitauth IDE will show you the two-way mapping between the CashScript contract code and the generated opcodes. User-defined functions are included with the same mapping: each function definition is rendered as a push group annotated with the function's own source lines, and imported functions are annotated with the file they are imported from.

Here is [a Bitauth IDE link][BitauthIDE] for an example `HalfTimeVault` contract, which uses a `half()` function imported from `math.cash`. Note the source-mapped function definition (`OP_DEFINE`) at the top, the `OP_INVOKE` call sites, and the `>>>` annotation rows:

```js
// "HalfTimeVault" contract constructor parameters
<timeout> // int = <0x90d003>
<owner> // pubkey = <0x034f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa>

// bytecode
                                                                 /* >>> function half (imported from math.cash)                      */
<                                                                /* function half(int amount) returns (int) {                        */
  OP_2 OP_DIV                                                    /*     return amount / 2;                                           */
> OP_0 OP_DEFINE                                                 /* }                                                                */
                                                                 /*                                                                  */
                                                                 /* pragma cashscript ^0.14.0;                                       */
                                                                 /*                                                                  */
                                                                 /* import "./math.cash";                                            */
                                                                 /*                                                                  */
                                                                 /* contract HalfTimeVault(pubkey owner, int timeout) {              */
                                                                 /*     // Early claims must leave half the coins in the vault       */
OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF                              /*     function claimEarly(sig ownerSig) {                          */
OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY                           /*         require(checkSig(ownerSig, owner));                      */
OP_0 OP_INVOKE OP_CHECKLOCKTIMEVERIFY OP_DROP                    /*         require(tx.time >= half(timeout));                       */
OP_INPUTINDEX OP_UTXOVALUE                                       /*         int vaultValue = tx.inputs[this.activeInputIndex].value; */
OP_0 OP_OUTPUTVALUE OP_SWAP OP_0 OP_INVOKE OP_GREATERTHANOREQUAL /*         require(tx.outputs[0].value >= half(vaultValue));        */
OP_NIP                                                           /*         >>> scope cleanup                                        */
OP_ELSE                                                          /*     }                                                            */
                                                                 /*                                                                  */
                                                                 /*     // After the full timeout, the owner can claim everything    */
OP_ROT OP_1 OP_NUMEQUALVERIFY                                    /*     function claim(sig ownerSig) {                               */
OP_ROT OP_SWAP OP_CHECKSIGVERIFY                                 /*         require(checkSig(ownerSig, owner));                      */
OP_CHECKLOCKTIMEVERIFY OP_DROP                                   /*         require(tx.time >= timeout);                             */
OP_1                                                             /*     }                                                            */
OP_ENDIF                                                         /* }                                                                */

```

[BitauthIDE]: https://ide.bitauth.com/import-template/eJzdWG1z2jgQ_isa331IOhSMwYDTlhlKaMMkhRwhaW9Cj5GFHHw1ts-WaTKZ_vfblV_AvKTQJDc38YfE2NLuo2dXj9Z7r_wesimfUeVImQrhh0elkj3hRdMWNBLTIvNmJbzhrrAZFbbnvhZ85jtU8NdztRjPLf4deq5SUCY8ZIHt4ygw1535XiD4hFiBNyOMhtP4LQx06YzDiDY8u5DPyEfu8gCMTsgxN6ObG9u9IcPEEUwIIz82phxdK-_bJ2NN1WpjVVe-FpQ5D0LpUS0oCFPYPFSO7pUT6lhDe8avaOSIse36kVDHPg3At4ApOCQPuO25IqBMEBZwuVRCXUAfuUz-WJqarSDngxxIJ-Q39RAhS8vg5noFSa1S12tlatXVqmGZrMpptc40A_7TSpUaNa1crWs1GFFnVFet2qQ20alhVmsN1axUzerY8dg3cJC3yhxqzzo0cO7SpUauHIgM0cCmphPT4n0Hpi_sm_X1j7J3I2WxWuJZCw5GysLPSFnwkBktKOLOxyen_E75UYhfbHW16kdM7ZCwJAwr1hemP1PH4eKYCooeBFDgRWKTj-TVjl5SQ1v8pBwAvRN-u-4uSeSMKjmMCI_wW84imcWJoxVLG_3BtZRCq8m8Ndgw0qdhiJFeTbv1OXxOnQj3F6RIAm0xaFMyw4BSaSUHNu2Pkfs2TQhUCNcLgnFo37hURAEvwirHwDMYD8d4H4lbL2wSsAxjRu7IhbsVFm03ixfYzvMnZ9quIO_IW7U5Qh2KyQAOnmXnQWCewyyEDv-D8A3jdPC1cFrRtmjNWkxybyEsKV94E4ogYsIL8iFK8j3H362hTlS1AjTGEZQv_cj8xu_i92qlalV03Zwws86YCovWGtyqMMZNo1bWJ4Zaa1RNUzc1WKvV0A1qqpZqAjVqXW_Uy5SCbRli805w5k34yCWPvUqvSLPZXCTNFLiA_M2dPzOKpxkcOIebbbwqwZqfAEgOBOwhQejMi1xxSAIO6e-GuLHg1_02GwiEkP75WMM_x92rXwSCV-wyQUBKRHuzhw0E0kQMqgTS-dDtdX4FyI-9J21k5JFXwsj_Aogf0JsZXSqJyF9qsVwtqruG58UxEu9VkLFiKduoI2WfbH15nGQKnpP2g0SNpTwXpHAnQr6mKU_JCAh2XBbIsz8ksygUxOF0zmO1hS8EAGyDvMFZjT_msiJeAEkF7bzbPs1EpXf5qfPHZesM77sfdgKS6euiCDmAuiHmAwqOB5Q1A1JBf4P-mfR78bl1jv_bJ5326UX341Vn0P3w5245EvB_IjvgB_AVxL6B84MURSHGc3i4JYUTIJKEbu-qf9rJIJz126fD7qdOggOld9A_3xGIuC1iNpDmu_j8SVNjG44USLd3fjns9o47X9Dh5fBL_6p1drmr3C8BwXyUob-C2pJDzQCIZCEZXmPZXYR8tue8i0-6WL19LWIRyt_kGOlfDgFOjGApQitsfRx0WsPOYHjS6vUHcRptZiQpNq_VxFnGzgLoEkEJkF53I-f7M4KVScg8H_YH7Bc38ne1kQDpnF3sf-yuAnnUGfzilDURtJaFH4QoVlbkOKmMFuQTuX3hhE50hnDoMtxBBkNbYhGaQX-IiVhelrKfysfDgra7lskrD2RvKXtyQdtTwfYStFTLHq4KEiDlHdw9_67B7ds7_tnJ9jCQl1Q-Q18Dv1u5Cw0pb6e-RtajgLHJd3AneZSvi5bqgXzrIt-labnQj6HQV-SwpaUd3HrfpzzgcV8oKcjjpk3c1sB-ShEtYWcGcKRfrni_2hVSVBiYNL2Up_hcxvZQ2uECg_H3OfYgoAiUDPqBPQc2oN-20t5Tyo-8sAsF3gPqhnhsI3_3SnyYQ3sJXMG5CiVffJArRzosPHkyXMw5gUoesGhs0rAMQ6tNrIrJjWpZNynnRoVrDd1Sdd3grFHWGKyt0mjUaB1IME3e4Gq5DsQZNex3gCRwl_FeNDOR3iq0WIxaHf6mHR9Q5_dZbK6V0PGE8vUHdLfwJbKoHJU1XVWhUZzUBHIda1PvF72V52ndenCaBNBmlxFbTqf_IHMwprIMuqDCCyHllSPDAE6Qp6yVruE-9aKA8f5DRKUcr1ksg0E0Cd7-BdDnHZk=

