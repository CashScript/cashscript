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

#### Call stacks

When the failing `require` statement sits inside a [user-defined function](/docs/language/contracts#user-defined-functions), the error message also includes a call stack showing how execution reached it. The innermost frame is listed first, the contract function that started the call last.

```bash
Test.cash:2 Require statement failed at input 0 in contract Test, function assertPositive (Test.cash, line 2) with the following message: value must be positive.
Failing statement: require(value > 0, "value must be positive");
  at assertPositive (Test.cash:2) — require(value > 0, "value must be positive");
  at validate (Test.cash:6) — assertPositive(amount)
  at Test.cash:12 — validate(x)
```

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

Here is [a Bitauth IDE link][BitauthIDE] for an example `HalfTimeVault` contract, which uses a `halfRoundedUp()` function imported from `math.cash`. Note the source-mapped function definition (`OP_DEFINE`) at the top, the `OP_INVOKE` call sites, and the `>>>` annotation rows. Functions that are small enough to be inlined more cheaply are compiled directly into the contract code instead, so they don't show up as a separate definition.

```js
// "HalfTimeVault" contract constructor parameters
<timeout> // int = <0x90d003>
<owner> // pubkey = <0x034f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa>

// bytecode
                                                                           /* >>> imported from math.cash                                               */
<                                                                          /* function halfRoundedUp(int amount) returns (int) {                        */
  OP_DUP OP_2 OP_DIV OP_SWAP OP_2 OP_MOD OP_ADD                            /*     return amount / 2 + amount % 2;                                       */
> OP_0 OP_DEFINE                                                           /* }                                                                         */
                                                                           /*                                                                           */
                                                                           /* pragma cashscript ^0.14.0;                                                */
                                                                           /*                                                                           */
                                                                           /* import "./math.cash";                                                     */
                                                                           /*                                                                           */
                                                                           /* contract HalfTimeVault(pubkey owner, int timeout) {                       */
                                                                           /*     // Early claims must leave half the coins and tokens in the vault     */
OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                        /*     function claimEarly(sig ownerSig) {                                   */
OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY                                     /*         require(checkSig(ownerSig, owner));                               */
OP_0 OP_INVOKE OP_CHECKLOCKTIMEVERIFY OP_DROP                              /*         require(tx.time >= halfRoundedUp(timeout));                       */
OP_INPUTINDEX OP_UTXOVALUE                                                 /*         int vaultValue = tx.inputs[this.activeInputIndex].value;          */
OP_0 OP_OUTPUTVALUE OP_SWAP OP_0 OP_INVOKE OP_GREATERTHANOREQUAL OP_VERIFY /*         require(tx.outputs[0].value >= halfRoundedUp(vaultValue));        */
OP_INPUTINDEX OP_UTXOTOKENAMOUNT                                           /*         int vaultTokens = tx.inputs[this.activeInputIndex].tokenAmount;   */
OP_0 OP_OUTPUTTOKENAMOUNT OP_SWAP OP_0 OP_INVOKE OP_GREATERTHANOREQUAL     /*         require(tx.outputs[0].tokenAmount >= halfRoundedUp(vaultTokens)); */
OP_NIP                                                                     /*         >>> scope cleanup                                                 */
OP_ELSE                                                                    /*     }                                                                     */
                                                                           /*                                                                           */
                                                                           /*     // After the full timeout, the owner can claim everything             */
OP_ROT OP_1 OP_NUMEQUALVERIFY                                              /*     function claim(sig ownerSig) {                                        */
OP_ROT OP_SWAP OP_CHECKSIGVERIFY                                           /*         require(checkSig(ownerSig, owner));                               */
OP_CHECKLOCKTIMEVERIFY OP_DROP                                             /*         require(tx.time >= timeout);                                      */
OP_1                                                                       /*     }                                                                     */
OP_ENDIF                                                                   /* }                                                                         */
```

[BitauthIDE]: https://ide.bitauth.com/import-template/eJztWW1z2jgQ_isa391M0qNgDAacazNDA22YJJAjkPYm9BhZyMEXsH22TJPJ9L_frvyCeUuhIf3S0wewZWn30aPV7nr9qPwasDGfUuVIGQvhBUeFgj3iedMWNBTjPHOnBbzgjrAZFbbrvBZ86k2o4K9naj6am_8ncB0lp4x4wHzbw1EgrjX1XF_wEbF8d0oYDcbRUxjo0CmHESfQdyX7yAfucB-EjkiDm-Htre3ckl6sCCYEoRcJU45ulHcnp0NN1SpDVVc-55QZ9wOpUc0pCFPYPFCOHpVTOrF69pRf03AihrbjhUIdetQH3QKm4JBFwCeuI3zKBGE-l0sl1AH0ocPkTWZquoIFHeRAKiG_qIcIWUoGNTdLSPRSzSqaI9VipWqlxFWDVypGVSubVlGrMo3rrGTpvFor61W9aPCqbliGqVZhQqVmljU6nLjsDhQsSmUTak-b1J88JEsNHTkQGaK-Tc1JRIv7BZi-sm9X1z9Inw2U-WqJa805GChzPQNlzkMqNKeIBw97zviD8jUXPdioalmPGNsBYfE2LEmfi_5IJxMuGlRQ1CCAAjcU63TEj7bUkgjaoCfhAOgd8ftVdbEhp1TJYUS4hN9zFkorjhUtSVqrD1rGhJaNeeNmw0iPBgHu9LLZrc7hMzoJ8XyBicTQ5oPWGTMMKBSWbGDd-Rg4bxKDQA_huL4_DOxbh4rQ53lY5RB4BuHBEK9Dce8GxwQkw5iBM3DgaolF20n3C2Qv8idn2o4gb8kb9XiAfigiAzh4kZMHG_MSYmHr8B8cXy8yB08LxiVtg69Z2ZOFp7AtCV94EQg_ZML1F7cotvcF_u4NdaSqJaAx2kH50AvNO_4QPVdLZauk6-aImVXGVGpVtRq3Soxx06gU9ZGhVmpl09RNjVHdqukGNVVLNatqWa3qtWqRUpAtt9h8EJy5Iz5wyP5a4RU5Pj4m9kLomVIMZBBrdhT2qgA07BVbatZj2K2uG4L9jvoenDRB6BRuxSHxORwSJ8DjB3ePT2EjpHM5bPQv8U-T161r_Lv6WJ_3XXQa-FdvNL6BDVukPMZCCkQjvyc3vxHtjy0XitiOUakqQTXft9rNrVlai-3rM6Yvtoi3vbWYt_20_WPzfHo7pZnci_yt5ovlvLrtVv6kvEX-A7xqvpA6j4GyM2k_IXNp2FmIRwdxCJExJSejTRx9Nru4l-ENAk-U3sgcJiDTMBBkwumMS58MuSGHNdjggDH3F-4dh0tIP7B_JpP8BFviYC9bJ2eps2v3L5p_9uvneN16vyO2NDrM86sDSIki1iCXeiIcZFqMrYQQup1zCSWJCCenzZOzq9aH62a39f6vXe3N5_-Gts8P4J2P3QGegwRYLoJ4ePitExJjk1S12teds2aK6rxzctZrXTRjaBg4up3LnbGJ-zxaFjl-uxRjE3vbiDHG1mpf9nutdqP5CTH0e5861_Xz_u7xK4MNzV3azjXk2xzyKAApk-vgBl9F8nBc7BlvYU8LM9rPeUzMeQZolrdOvwcII1CZrV3i9EO3We81u73TervTTU0yJnc9b3FOfqPG-lc5nC8iQ-NG3noApV2_6PTbvWfy1ouO4RbEyQNblxkLAlzlLQtqJ_Y221uGt4z6DexFS0H6Ymzt1jeMfHfeMAMOmOuBJwPP5oTezsJibM3zq-ckbsvY9pPF_VzxNI5ZdQtrFxiErHAySYJnTvZI3ws5Xhw3CIeC2AOcD6igrdnTbkcafjEbrXYIB0_HrO8IV2uwPSNavVzM-u4gtVPMSqLUlqlmjK24E4IfeE7Rh7Qb2ydCT7T_3wK_r-0ZG1QmsfLEHSgpu1tVJtMqI4yNK1nNuGvxJSGT9i4WHxfrrHUHKqoUvgxw8HRSDrqfL2Pu86iyG7_pRmXXqDCJFdE8SsLaKuBIak94vVzXVVQYGJetlX0UvLDAm9SoQWBUYcMqIrwRSQY9354BG1AxXyrQK8VnNqwjg3afOgHmSsjfoxJlUFAgBlWQusDLTpQ9KUc6LDzu6c3nnMLLL2DR2KhmGYZWGVklkxvlom5Szo0S12q6peq6wVmtqDFYW6lWq9AqkGCavMbVYhWIMypYsQSHxx3G2-HURHrLmlE2KlX4TWq2ELTepXtzowQTVyifv0J9Gh8ii8pRUdNVFT71xGmXXMfK1Md5dfRlPr64EGR9-FAmdyxrTj_AcnBPZYZ-RYUbgMkrR4YBnCBP6ccwDc-pG_qMd54iKuF4RWIRBKJI0PYfymbZog==

