---
title: Signature Templates
---

When a contract function has a `sig` parameter, it needs a cryptographic signature from a private key for the spending transaction.
In place of a signature, a `SignatureTemplate` can be passed, which will generate the correct signature when the transaction is built.

:::tip
`SignatureTemplate` can be used with a `Contract` as function argument to generate a signature automatically, or can be used in the `TransactionBuilder` to create an `Unlocker` for a P2PKH UTXO.
:::

## SignatureTemplate

### Constructor

```ts
new SignatureTemplate(
  signer: Keypair | Uint8Array | string,
  hashtype?: HashType,
  signatureAlgorithm?: SignatureAlgorithm
)
```

In place of a signature, a `SignatureTemplate` can be passed, which will generate the correct signature using the `signer` parameter. This signer can be any representation of a private key, including [WIF strings][wif], [BCHJS' `ECPair`][ecpair], [bitcore-lib-cash' `PrivateKey`][privatekey], or binary private keys represented as `Uint8Array`. This ensures that `SignatureTemplate` can be used with any BCH library.

#### Example
```ts
const aliceWif = 'L4vmKsStbQaCvaKPnCzdRArZgdAxTqVx8vjMGLW5nHtWdRguiRi1';
const aliceSignatureTemplate = new SignatureTemplate(aliceWif)

const transferDetails = await new TransactionBuilder({ provider })
  .addInput(selectedContractUtxo, contract.unlock.transfer(aliceSignatureTemplate))
  .addOutput({
    to: 'bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx',
    amount: 10000n
  })
  .send();
```

The `hashtype` and `signatureAlgorithm` options are covered under ['Advanced Usage'](/docs/sdk/signature-templates#advanced-usage).

## SignatureTemplate Methods

### unlockP2PKH()

Importantly the `SignatureTemplate` can also be used to generate the `Unlocker` for a P2PKH UTXO in the following way:

```ts
signatureTemplate.unlockP2PKH(): Unlocker
```

#### Example
```ts
import { aliceTemplate, aliceAddress, transactionBuilder } from './somewhere.js';

const aliceUtxos = await provider.getUtxos(aliceAddress);
transactionBuilder.addInput(aliceUtxos[0], aliceTemplate.unlockP2PKH());
```

### getPublicKey()

The `SignatureTemplate` also has a helper method to get the matching PublicKey in the following way:

```ts
signatureTemplate.getPublicKey(): Uint8Array
```

#### Example
```ts
import { aliceTemplate } from './somewhere.js';

const alicePublicKey = aliceTemplate.getPublicKey()
```

### signMessageHash()

The `SignatureTemplate` also has a helper method to sign a message hash, which can be used to sign non-transaction messages. This is useful for generating `datasig` signatures for smart contract use cases.

```ts
signatureTemplate.signMessageHash(message: Uint8Array): Uint8Array
```

#### Example
```ts
import { aliceTemplate } from './somewhere.js';
import { sha256 } from '@cashscript/utils';
import { hexToBin } from '@bitauth/libauth';

const signature = aliceTemplate.signMessageHash(sha256(hexToBin('0000000000000000000000')));
```

## Advanced Usage

### HashType

The default `hashtype` is `HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS` because this is the most secure option for smart contract use cases.

```ts
export enum HashType {
  SIGHASH_ALL = 0x01,
  SIGHASH_NONE = 0x02,
  SIGHASH_SINGLE = 0x03,
  SIGHASH_UTXOS = 0x20,
  SIGHASH_ANYONECANPAY = 0x80,
}
```

#### Example
```ts
const wif = 'L4vmKsStbQaCvaKPnCzdRArZgdAxTqVx8vjMGLW5nHtWdRguiRi1';

const signatureTemplate = new SignatureTemplate(
  wif, HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS
);

const configuredHashType = signatureTemplate.getHashType()
```

### SignatureAlgorithm

The `signatureAlgorithm` parameter determines the cryptographic algorithm used for signing. By default, the modern and compact Schnorr algorithm is used.

```ts
export enum SignatureAlgorithm {
  ECDSA = 0x00,
  SCHNORR = 0x01,
}
```

#### Example
```ts
const wif = 'L4vmKsStbQaCvaKPnCzdRArZgdAxTqVx8vjMGLW5nHtWdRguiRi1';

const hashType = HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS
const signatureAlgorithm = SignatureAlgorithm.SCHNORR
const signatureTemplate = new SignatureTemplate(wif, hashType,signatureAlgorithm);

const configuredSignatureAlgorithm = signatureTemplate.getSignatureAlgorithm()
```

[wif]: https://en.bitcoin.it/wiki/Wallet_import_format
[ecpair]: https://bchjs.fullstack.cash/#api-ECPair
[privatekey]: https://github.com/bitpay/bitcore/blob/master/packages/bitcore-lib-cash/docs/privatekey.md
