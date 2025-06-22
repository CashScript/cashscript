---
title: WalletConnect
---

The BCH WalletConnect spec lays out a BCH-specific API for how Bitcoin Cash dapps can communicate to BCH Wallets. BCH WalletConnect uses the generic 'WalletConnect' transport layer but the contents being communicated is what's BCH-specific. The standard was designed with CashScript smart contract usage in mind.

The BCH WalletConnect standard is supported in multiple wallets and a wide range of dapps. You can find a full list of Bitcoin Cash dapps supporting WalletConnect on [Tokenaut.cash](https://tokenaut.cash/dapps?filter=walletconnect).

:::tip
The specification is called ['wc2-bch-bcr'](https://github.com/mainnet-pat/wc2-bch-bcr) and has extra discussion and info on the [BCH research forum](https://bitcoincashresearch.org/t/wallet-connect-v2-support-for-bitcoincash/).
:::

## signTransaction Interface

Most relevant for smart contract usage is the BCH-WalletConnect `signTransaction` interface.

> This is a most generic interface to propose a bitcoincash transaction to a wallet which reconstructs it and signs it on behalf of the wallet user.

```typescript
signTransaction: (
  options: {
    transaction: string | TransactionBCH,
    sourceOutputs: (Input | Output | ContractInfo)[],
    broadcast?: boolean,
    userPrompt?: string
  }
) => Promise<{ signedTransaction: string, signedTransactionHash: string } | undefined>;
```

The `transaction` passed in this object needs to be an unsigned transaction which is using placeholder values for the field that the user-wallet needs to fill in itself. You can use the `PlaceholderTemplate` class to generate the zero-placeholder values.

The `sourceOutputs` value can be easily generated with the CashScript `generateWcSourceOutputs` helperfunction. 

## Create wcTransactionObj

To use the BCH WalletConnect `signTransaction` API, we need to pass an `options` object which we'll call `wcTransactionObj`.

Below we'll give 2 example, the first example using spending a user-input and in the second example spending from a user-contract with the `userPubKey` and the `userSig`

### Spending a user-input

Below is example code from the `CreateContract` code of the 'Hodl Vault' dapp repository, [link to source code](https://github.com/mr-zwets/bch-hodl-dapp/blob/main/src/views/CreateContract.vue#L14).

```ts
import { TransactionBuilder, generateWcSourceOutputs, placeholderTemplate } from "cashscript";
import { hexToBin, decodeTransaction } from "@bitauth/libauth";

async function proposeWcTransaction(userAddress: string){
  // create a placeholderTemplate to generate placeholder unlocker
  const placeholderTemplate = new PlaceholderTemplate(userAddress)

  // use the CashScript SDK to build a transaction
  const transactionBuilder = new TransactionBuilder({provider: store.provider})
  transactionBuilder.addInputs(userInputUtxos, placeholderTemplate.unlockP2PKH())
  transactionBuilder.addOpReturnOutput(opReturnData)
  transactionBuilder.addOutput(contractOutput)
  if(changeAmount > 550n) transactionBuilder.addOutput(changeOutput)

  const unsignedRawTransactionHex = await transactionBuilder.build();

  const decodedTransaction = decodeTransaction(hexToBin(unsignedRawTransactionHex));
  if(typeof decodedTransaction == "string") throw new Error("!decodedTransaction")

  // construct WcSourceOutputs from transaction input using a CashScript helper function
  const wcSourceOutputs = generateWcSourceOutputs(transactionBuilder.inputs)

  // wcTransactionObj to pass to signTransaction endpoint
  const wcTransactionObj = {
    transaction: decodedTransaction,
    sourceOutputs: wcSourceOutputs,
    broadcast: true,
    userPrompt: "Create HODL Contract"
  };

  // pass wcTransactionObj to WalletConnect client
  const signResult = await signWcTransaction(wcTransactionObj);

  // Handle signResult success / failure
}
```

### Spending from a user-contract

Below is example code from the `unlockHodlVault` code of the 'Hodl Vault' dapp repository, [link to source code](https://github.com/mr-zwets/bch-hodl-dapp/blob/main/src/views/UserContracts.vue#L66).

```ts
import { TransactionBuilder, generateWcSourceOutputs, PlaceholderTemplate } from "cashscript";
import { hexToBin, decodeTransaction } from "@bitauth/libauth";

async function unlockHodlVault(){
  // use placeholderTemplate to create placeholder args for unlocker
  const placeholderTemplate = new PlaceholderTemplate()
  const placeholderSig = placeholderTemplate.generateSignature()
  const placeholderPubKey = placeholderTemplate.getPublicKey()

  const transactionBuilder = new TransactionBuilder({provider: store.provider})

  transactionBuilder.setLocktime(store.currentBlockHeight)
  transactionBuilder.addInputs(contractUtxos, hodlContract.unlock.spend(placeholderPubKey, placeholderSig))
  transactionBuilder.addOutput(reclaimOutput)

  const unsignedRawTransactionHex = transactionBuilder.build();

  const decodedTransaction = decodeTransaction(hexToBin(unsignedRawTransactionHex));
  if(typeof decodedTransaction == "string") throw new Error("!decodedTransaction")

  // construct WcSourceOutputs from transaction input using a CashScript helper function
  const wcSourceOutputs = generateWcSourceOutputs(transactionBuilder.inputs)

  const wcTransactionObj = {
    transaction: decodedTransaction,
    sourceOutputs: wcSourceOutputs,
    broadcast: true,
    userPrompt: "Reclaim HODL Value",
  };

  // pass wcTransactionObj to WalletConnect client
  const signResult = await signWcTransaction(wcTransactionObj);

  // Handle signResult success / failure
}
```

## signTransaction Wallet interaction

To communicate the `wcTransactionObj` with the user's Wallet we use the `@walletconnect/sign-client` library to request the connected user's wallet to sign the transaction.

See [the source code](https://github.com/mr-zwets/bch-hodl-dapp/blob/main/src/store/store.ts#L60) for how to initialize the `signClient` and for details about the `connectedChain` and `session`.

```ts
import SignClient from '@walletconnect/sign-client';
import { stringify } from "@bitauth/libauth";

interface signedTxObject {
  signedTransaction: string;
  signedTransactionHash: string;
}

async function signWcTransaction(wcTransactionObj): signedTxObject | undefined {
  try {
    const result = await signClient.request({
      chainId: connectedChain,
      topic: session.topic,
      request: {
        method: "bch_signTransaction",
        params: JSON.parse(stringify(wcTransactionObj)),
      },
    });
    return result;
  } catch (error) {
    return undefined;
  }
}
```
