---
title: WalletConnect
---

The BCH WalletConnect specification was created in July of 2023 and has become popular since, being supported in multiple wallets and a wide range of dapps. You can find a full list of Bitcoin Cash dapps supporting WalletConnect on [Tokenaut.cash](https://tokenaut.cash/dapps?filter=walletconnect).

BCH WalletConnect uses the generic 'WalletConnect' transport layer to communicate between the wallet and the dapp. The contents being communicated is what is BCH-specific. The BCH WalletConnect standard was designed with CashScript contract usage in mind.


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

Important to note is how the wallet knows which inputs to sign:

>To signal that the wallet needs to sign an input, the app sets the corresponding input's `unlockingBytecode` to empty Uint8Array.

## signTransaction Example

### Create wcTransactionObj

Example code from the 'Cash-Ninjas' minting dapp repository, [link to source code](https://github.com/cashninjas/ninjas.cash/blob/main/js/mint.js).

```javascript
import { Contract } from "cashscript";
import { hexToBin, decodeTransaction } from "@bitauth/libauth";

async function transactionWalletConnect(){
  // use the CashScript SDK to build a transaction
  const rawTransactionHex = await transaction.build();
  const decodedTransaction = decodeTransaction(hexToBin(rawTransactionHex));

  // set input unlockingBytecode to empty Uint8Array for wallet signing
  decodedTransaction.inputs[1].unlockingBytecode = Uint8Array.from([]);

  // construct list SourceOutputs, see source code
  const listSourceOutputs = constructSourceOutputs(decodedTransaction, utxoInfo, contract)

  // wcTransactionObj to pass to signTransaction endpoint
  const wcTransactionObj = {
    transaction: decodedTransaction,
    sourceOutputs: listSourceOutputs,
    broadcast: true,
    userPrompt: "Mint Cash-Ninja NFT"
  };

  // pass wcTransactionObj to WalletConnect client
  const signResult = await signTransaction(wcTransactionObj);

  // Handle signResult success / failure
}
```

### signTransaction Client interaction

Below is an implementation of `signTransaction` used earlier, this is where the communication with the client for 'signTransaction' takes place. See the source code for `signClient`, `connectedChain` and `session` details.

```javascript
import SignClient from '@walletconnect/sign-client';
import { stringify } from "@bitauth/libauth";

async function signTransaction(options){
  try {
    const result = await signClient.request({
      chainId: connectedChain,
      topic: session.topic,
      request: {
        method: "bch_signTransaction",
        params: JSON.parse(stringify(options)),
      },
    });
    return result;
  } catch (error) {
    return undefined;
  }
}
```
