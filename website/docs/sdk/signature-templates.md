---
title: Signature Templates
---

When a contract function has a `sig` parameter, it needs a cryptographic signature from a private key for the spending transaction. 
In place of a signature, a `SignatureTemplate` can be passed, which will automatically generate the correct signature once the transaction is built.

## SignatureTemplate

### Constructor

```ts
new SignatureTemplate(
  signer: Keypair | Uint8Array | string,
  hashtype?: HashType,
  signatureAlgorithm?: SignatureAlgorithm
)
```

In place of a signature, a `SignatureTemplate` can be passed, which will automatically generate the correct signature using the `signer` parameter. This signer can be any representation of a private key, including [BCHJS' `ECPair`][ecpair], [bitcore-lib-cash' `PrivateKey`][privatekey], [WIF strings][wif], or raw private key buffers. This ensures that any BCH library can be used.

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
```

[wif]: https://en.bitcoin.it/wiki/Wallet_import_format
[ecpair]: https://bchjs.fullstack.cash/#api-ECPair
[privatekey]: https://github.com/bitpay/bitcore/blob/master/packages/bitcore-lib-cash/docs/privatekey.md
