---
title: WalletConnect
---

CashScript can prepare transactions for both BCH WalletConnect and WizardConnect. For smart contract dapps, the main differences are that BCH WalletConnect is a single-address wallet protocol with transaction and message signing, while WizardConnect is HD-wallet-aware and can support custom extensions but does not provide a generic message-signing method.

## BCH WalletConnect

The BCH WalletConnect spec lays out a BCH-specific API for how Bitcoin Cash dapps can communicate with BCH wallets. BCH WalletConnect uses the generic WalletConnect transport layer, but the messages being exchanged are Bitcoin Cash-specific.

The standard is supported in multiple wallets and dapps. You can find a list of Bitcoin Cash dapps supporting WalletConnect on [Tokenaut.cash].

:::tip
The specification is called [`wc2-bch-bcr`][wc2-bch-bcr] and has extra discussion on the [BCH research forum].
:::

### signTransaction Interface

Most relevant for smart contract usage is the BCH WalletConnect `signTransaction` interface.

```ts
signTransaction: (wcTransactionObj: WcTransactionObject) => Promise<SignedTxObject | undefined>;
```

```ts
interface WcTransactionObject {
  // the spec also allows for a tx hex string but CashScript returns the libauth transaction object
  transaction: TransactionCommon;
  sourceOutputs: WcSourceOutput[];
  broadcast?: boolean;
  userPrompt?: string;
}

type WcSourceOutput = Input & Output & WcContractInfo;

interface WcContractInfo {
  contract?: {
    abiFunction: AbiFunction;
    redeemScript: Uint8Array;
    artifact: Partial<Artifact>;
  }
}

interface SignedTxObject {
  signedTransaction: string;
  signedTransactionHash: string;
}
```

CashScript `TransactionBuilder` has a `generateWcTransactionObject()` method for creating the `WcTransactionObject`.

### Spending User Inputs

Use `placeholderP2PKHUnlocker(userAddress)` for P2PKH inputs that should be signed by the connected wallet.

```ts
import { TransactionBuilder, placeholderP2PKHUnlocker } from "cashscript";

async function proposeWcTransaction(userAddress: string) {
  // Use a placeholder unlocker which will be replaced by the user's wallet
  const placeholderUnlocker = placeholderP2PKHUnlocker(userAddress);

  // Use the CashScript SDK to construct a transaction
  const transactionBuilder = new TransactionBuilder({ provider });
  transactionBuilder.addInputs(userInputUtxos, placeholderUnlocker);
  transactionBuilder.addOpReturnOutput(opReturnData);
  transactionBuilder.addOutput(contractOutput);
  if (changeAmount > 550n) transactionBuilder.addOutput(changeOutput);

  // Generate a WalletConnect transaction object with custom broadcast and prompt options
  const wcTransactionObj = transactionBuilder.generateWcTransactionObject({
    broadcast: true,
    userPrompt: "Create HODL Contract",
  });

  // Pass wcTransactionObj to the WalletConnect client
  // See the signWcTransaction implementation below
  const signResult = await signWcTransaction(wcTransactionObj);

  // Handle signResult success / failure
}
```

### Spending From A User Contract

Use `placeholderSignature()` and `placeholderPublicKey()` for contract arguments that should be filled in by the wallet.

```ts
import { TransactionBuilder, placeholderSignature, placeholderPublicKey } from "cashscript";

async function unlockHodlVault() {
  // Use placeholder arguments which will be filled in by the user's wallet
  const placeholderSig = placeholderSignature();
  const placeholderPubKey = placeholderPublicKey();

  // Use the CashScript SDK to construct a transaction
  const transactionBuilder = new TransactionBuilder({ provider });

  transactionBuilder.setLocktime(currentBlockHeight);
  transactionBuilder.addInputs(contractUtxos, hodlContract.unlock.spend(placeholderPubKey, placeholderSig));
  transactionBuilder.addOutput(reclaimOutput);

  // Generate a WalletConnect transaction object with custom broadcast and prompt options
  const wcTransactionObj = transactionBuilder.generateWcTransactionObject({
    broadcast: true,
    userPrompt: "Reclaim HODL Value",
  });

  // Pass wcTransactionObj to the WalletConnect client
  // See the signWcTransaction implementation below
  const signResult = await signWcTransaction(wcTransactionObj);

  // Handle signResult success / failure
}
```

### Wallet Interaction

To send the `WcTransactionObject` to the user's wallet, use `@walletconnect/sign-client`.

See [the Hodl Vault source code][hodl-vault-sign-client] for how to initialize the `signClient` and for details about the `connectedChain` and `session`.

```ts
import SignClient from "@walletconnect/sign-client";
import { stringify } from "@bitauth/libauth";
import { type WcTransactionObject } from "cashscript";

interface SignedTxObject {
  signedTransaction: string;
  signedTransactionHash: string;
}

async function signWcTransaction(wcTransactionObj: WcTransactionObject): Promise<SignedTxObject | undefined> {
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

## WizardConnect

WizardConnect is an HD-wallet-aware signing protocol. It uses the same BCH WalletConnect transaction object for the transaction itself, but also requires HD path metadata for each user input the wallet must sign.

:::tip
See the [WizardConnect documentation] and [WizardConnect GitLab repository] for the protocol details.
:::

CashScript `TransactionBuilder` has a `generateWizardConnectTransactionObject()` method for this flow. It builds the normal `WcTransactionObject` and adds `inputPaths` for placeholder P2PKH inputs.

```ts
interface WizardConnectTransactionObject {
  transaction: WcTransactionObject;
  inputPaths: WizardConnectInputPath[];
}

type WizardConnectInputPath = [inputIndex: number, pathName: string, addressIndex: number];
```

`pathName` is the WizardConnect path name, such as `"receive"` or `"change"`. `addressIndex` is the child index on that path. CashScript uses this tuple shape because it matches WizardConnect's current protocol format.

### Spending HD Wallet Inputs

When adding a placeholder P2PKH input for WizardConnect, include the HD path metadata in `placeholderP2PKHUnlocker()`.

```ts
import { TransactionBuilder, placeholderP2PKHUnlocker } from "cashscript";

async function proposeWizardTransaction() {
  // Use the CashScript SDK to construct a transaction
  const transactionBuilder = new TransactionBuilder({ provider });

  // Use placeholder unlockers with HD path metadata so WizardConnect knows which key signs each input
  transactionBuilder.addInput(
    userReceiveUtxo,
    placeholderP2PKHUnlocker(userReceiveAddress, {
      hdPath: {
        name: "receive",
        addressIndex: 5,
      },
    }),
  );

  transactionBuilder.addInput(
    userChangeUtxo,
    placeholderP2PKHUnlocker({
      address: userChangeAddress,
      hdPath: {
        name: "change",
        addressIndex: 2,
      },
    }),
  );

  transactionBuilder.addOutput(contractOutput);
  if (changeAmount > 550n) transactionBuilder.addOutput(changeOutput);

  // Generate a WizardConnect transaction object with the transaction and inputPaths
  const wizardTransactionObj = transactionBuilder.generateWizardConnectTransactionObject({
    broadcast: false,
    userPrompt: "Create Contract",
  });

  // Pass wizardTransactionObj to the WizardConnect client
  // See the signWizardTransaction implementation below
  const signResult = await signWizardTransaction(wizardTransactionObj);

  // Handle signResult success / failure
}
```

The resulting `inputPaths` are collected after the transaction is built, so the `inputIndex` values match the final transaction input order. Non-placeholder inputs do not need `inputPaths` entries.

:::tip
For WizardConnect, each `placeholderP2PKHUnlocker()` needs an `hdPath` so the wallet knows which HD key should unlock that input.
:::

### Needs Extensions

WizardConnect's current transaction-signing flow supports P2PKH user inputs with `placeholderP2PKHUnlocker(..., { hdPath })`. Contract inputs with complete unlocking bytecode also work normally and do not need `inputPaths` entries.

The BCH WalletConnect pattern shown above with `placeholderSignature()` and `placeholderPublicKey()` is not currently supported by WizardConnect's standard `inputPaths` metadata. `inputPaths` selects the HD key for a transaction input, but it does not identify individual `sig` or `pubkey` placeholders inside that input's contract unlocking bytecode.

If your dapp needs wallet-filled contract signature or public key arguments, or arbitrary message signing, explore a WizardConnect custom extension or use BCH WalletConnect.

### Wallet Interaction

Send the `WizardConnectTransactionObject` to your WizardConnect dapp client.

```ts
import { type WizardConnectTransactionObject } from "cashscript";

interface WizardSignedTxObject {
  signedTransaction: string;
}

async function signWizardTransaction(
  wizardTransactionObj: WizardConnectTransactionObject,
): Promise<WizardSignedTxObject | undefined> {
  try {
    const result = await wizardConnectManager.signTransaction(wizardTransactionObj);
    return result;
  } catch (error) {
    return undefined;
  }
}
```

[Tokenaut.cash]: https://tokenaut.cash/dapps?filter=walletconnect
[wc2-bch-bcr]: https://github.com/mainnet-pat/wc2-bch-bcr
[BCH research forum]: https://bitcoincashresearch.org/t/wallet-connect-v2-support-for-bitcoincash/
[hodl-vault-sign-client]: https://github.com/mr-zwets/bch-hodl-dapp/blob/main/src/store/store.ts#L60
[WizardConnect documentation]: https://docs.riftenlabs.com/wizardconnect/
[WizardConnect GitLab repository]: https://gitlab.com/riftenlabs/lib/wizardconnect
