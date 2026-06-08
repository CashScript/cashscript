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

WizardConnect is an HD-wallet-aware signing protocol. For the transaction itself it reuses the BCH WalletConnect transaction object, but it additionally requires HD path metadata called `inputPaths`. This tells the wallet which HD key should sign each input.

:::tip
See the [WizardConnect documentation] and [WizardConnect GitLab repository] for the protocol details.
:::

The only difference from BCH WalletConnect is this extra `inputPaths` list, so CashScript does not add a separate WizardConnect abstraction. You build the transaction object with the existing `generateWcTransactionObject()` method and attach `inputPaths` yourself before sending the request to the wallet.

The WizardConnect sign request has the following shape:

```ts
interface SignTransactionRequest {
  // The same object returned by generateWcTransactionObject()
  transaction: WcTransactionObject;
  // One entry per input the wallet must sign
  inputPaths: InputPath[];
}

// [inputIndex, pathName, addressIndex]
type InputPath = [number, string, number];
```

Each `inputPaths` entry maps a transaction input to an HD key:

- `inputIndex`: the input's position in the transaction's input list.
- `pathName`: the WizardConnect path name, such as `"receive"`, `"change"` or `"defi"`.
- `addressIndex`: the child index on that path.

The wallet derives the key for each listed input index, and uses it both to sign P2PKH user inputs and to fill placeholder signatures or public keys inside contract inputs. Inputs the wallet does not need to sign, such as contract inputs with complete unlocking bytecode, are left out of `inputPaths`.

### Spending User Inputs

Build the transaction with `placeholderP2PKHUnlocker()`, exactly as with BCH WalletConnect. Then construct `inputPaths` for the user inputs, matching the order in which you added them.

```ts
import { TransactionBuilder, placeholderP2PKHUnlocker } from "cashscript";

async function proposeWizardTransaction() {
  // Use placeholder unlockers which will be replaced by the user's wallet
  const transactionBuilder = new TransactionBuilder({ provider });

  // Input 0: a UTXO on the receive path at address index 5
  transactionBuilder.addInput(userReceiveUtxo, placeholderP2PKHUnlocker(userReceiveAddress));
  // Input 1: a UTXO on the change path at address index 2
  transactionBuilder.addInput(userChangeUtxo, placeholderP2PKHUnlocker(userChangeAddress));

  transactionBuilder.addOutput(contractOutput);
  if (changeAmount > 550n) transactionBuilder.addOutput(changeOutput);

  // Build the standard WalletConnect transaction object
  const transaction = transactionBuilder.generateWcTransactionObject({
    broadcast: false,
    userPrompt: "Create Contract",
  });

  // Attach the HD path metadata for each user input, matching the input order above
  const inputPaths: [number, string, number][] = [
    [0, "receive", 5],
    [1, "change", 2],
  ];

  // Pass the request to the WizardConnect client
  // See the signWizardTransaction implementation below
  const signResult = await signWizardTransaction({ transaction, inputPaths });

  // Handle signResult success / failure
}
```

Because the `inputPaths` indices reference the final transaction input order, construct them after deciding the input order.

### Spending From A User Contract

Contract inputs that use `placeholderSignature()` and `placeholderPublicKey()` work too, for example reclaiming from a Hodl Vault or withdrawing from a Cauldron pool. Add an `inputPaths` entry for the contract input's index and the wallet fills the placeholder signature and public key using the HD key for that path.

```ts
import { TransactionBuilder, placeholderSignature, placeholderPublicKey } from "cashscript";

async function unlockHodlVault() {
  // Use placeholder arguments which will be filled in by the user's wallet
  const placeholderSig = placeholderSignature();
  const placeholderPubKey = placeholderPublicKey();

  const transactionBuilder = new TransactionBuilder({ provider });
  transactionBuilder.setLocktime(currentBlockHeight);
  // Input 0: the contract UTXO, whose sig and pubkey placeholders the wallet fills in
  transactionBuilder.addInput(contractUtxo, hodlContract.unlock.spend(placeholderPubKey, placeholderSig));
  transactionBuilder.addOutput(reclaimOutput);

  // Build the standard WalletConnect transaction object
  const transaction = transactionBuilder.generateWcTransactionObject({
    broadcast: false,
    userPrompt: "Reclaim HODL Value",
  });

  // Point input 0 at the user's receive key at address index 5
  const inputPaths: [number, string, number][] = [
    [0, "receive", 5],
  ];

  // Pass the request to the WizardConnect client
  const signResult = await signWizardTransaction({ transaction, inputPaths });

  // Handle signResult success / failure
}
```

:::note
Filling `sig` and `pubkey` placeholders inside a contract input comes from the underlying BCH WalletConnect transaction format, not from the WizardConnect spec itself. The spec only describes `inputPaths` as selecting the HD key for inputs that need wallet signing, so this behaviour is wallet-dependent. It is implemented in wallets such as Paytaca, but confirm support with your target wallet.
:::

:::tip
WizardConnect covers transaction signing only. For arbitrary message signing, use BCH WalletConnect or a WizardConnect custom extension.
:::

### Wallet Interaction

Send the request to your WizardConnect dapp client. Its `signTransaction` method takes the `transaction` and `inputPaths` and returns the signed transaction.

```ts
import { type WcTransactionObject } from "cashscript";

interface SignTransactionRequest {
  transaction: WcTransactionObject;
  inputPaths: [number, string, number][];
}

async function signWizardTransaction(
  request: SignTransactionRequest,
): Promise<string | undefined> {
  try {
    const result = await dappConnectionManager.signTransaction(request);
    return result.signedTransaction;
  } catch (error) {
    return undefined;
  }
}
```

See the [WizardConnect documentation] for how to set up the `dappConnectionManager` and establish a connection with the user's wallet.

[Tokenaut.cash]: https://tokenaut.cash/dapps?filter=walletconnect
[wc2-bch-bcr]: https://github.com/mainnet-pat/wc2-bch-bcr
[BCH research forum]: https://bitcoincashresearch.org/t/wallet-connect-v2-support-for-bitcoincash/
[hodl-vault-sign-client]: https://github.com/mr-zwets/bch-hodl-dapp/blob/main/src/store/store.ts#L60
[WizardConnect documentation]: https://docs.riftenlabs.com/wizardconnect/
[WizardConnect GitLab repository]: https://gitlab.com/riftenlabs/lib/wizardconnect
