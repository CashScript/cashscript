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

You can see that the CashScript `ContractInfo` needs to be provided as part of the `sourceOutputs`. Important to note from the spec is how the wallet knows which inputs to sign:

>To signal that the wallet needs to sign an input, the app sets the corresponding input's `unlockingBytecode` to empty Uint8Array.

Also important for smart contract usage is how the wallet adds the public-key or a signature to contract inputs:

> We signal the use of pubkeys by using a 33-byte long zero-filled arrays and schnorr (the currently supported type) signatures by using a 65-byte long zero-filled arrays. Wallet detects these patterns and replaces them accordingly.

## Create wcTransactionObj

To use the BCH WalletConnect `signTransaction` API, we need to pass an `options` object which we'll call `wcTransactionObj`.

Below we'll give 2 example, the first example using spending a user-input and in the second example spending from a user-contract with the `userPubKey` and the `userSig`

### Spending a user-input

Below is example code from the `CreateContract` code of the 'Hodl Vault' dapp repository, [link to source code](https://github.com/mr-zwets/bch-hodl-dapp/blob/main/src/views/CreateContract.vue#L14).

```ts
import { Contract } from "cashscript";
import { hexToBin, decodeTransaction } from "@bitauth/libauth";

async function proposeWcTransaction(){
  // create a placeholderUnlocker for the empty signature
  const placeholderUnlocker: Unlocker = {
    generateLockingBytecode: () => convertPkhToLockingBytecode(userPkh),
    generateUnlockingBytecode: () => Uint8Array.from(Array(0))
  }

  // use the CashScript SDK to build a transaction
  const transactionBuilder = new TransactionBuilder({provider: store.provider})
  transactionBuilder.addInputs(userInputUtxos, placeholderUnlocker)
  transactionBuilder.addOpReturnOutput(opreturnData)
  transactionBuilder.addOutput(contractOutput)
  if(changeAmount > 550n) transactionBuilder.addOutput(changeOutput)

  const unsignedRawTransactionHex = await transactionBuilder.build();

  const decodedTransaction = decodeTransaction(hexToBin(unsignedRawTransactionHex));
  if(typeof decodedTransaction == "string") throw new Error("!decodedTransaction")

  // construct SourceOutputs from transaction input, see source code
  const sourceOutputs = generateSourceOutputs(transactionBuilder.inputs)

  // we don't need to add the contractInfo to the wcSourceOutputs here  
  const wcSourceOutputs = sourceOutputs.map((sourceOutput, index) => {
    return { ...sourceOutput, ...decodedTransaction.inputs[index] }
  })

  // wcTransactionObj to pass to signTransaction endpoint
  const wcTransactionObj = {
    transaction: decodedTransaction,
    sourceOutputs: listSourceOutputs,
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
import { Contract } from "cashscript";
import { hexToBin, decodeTransaction } from "@bitauth/libauth";

async function unlockHodlVault(){
  // create a placeholdes for the unlocking arguments
  const placeholderSig = Uint8Array.from(Array(65))
  const placeholderPubKey = Uint8Array.from(Array(33));

  const transactionBuilder = new TransactionBuilder({provider: store.provider})

  transactionBuilder.setLocktime(store.currentBlockHeight)
  transactionBuilder.addInputs(contractUtxos, hodlContract.unlock.spend(placeholderPubKey, placeholderSig))
  transactionBuilder.addOutput(reclaimOutput)

  const unsignedRawTransactionHex = transactionBuilder.build();

  const decodedTransaction = decodeTransaction(hexToBin(unsignedRawTransactionHex));
  if(typeof decodedTransaction == "string") throw new Error("!decodedTransaction")

  const sourceOutputs = generateSourceOutputs(transactionBuilder.inputs)

  // Add the contractInfo to the wcSourceOutputs
  const wcSourceOutputs: wcSourceOutputs = sourceOutputs.map((sourceOutput, index) => {
    const contractInfoWc = createWcContractObj(hodlContract, index)
    return { ...sourceOutput, ...contractInfoWc, ...decodedTransaction.inputs[index] }
  })

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
