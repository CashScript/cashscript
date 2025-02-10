---
title: Examples
---

An extensive collection of examples is available in the [GitHub repository][github-examples]. Below we discuss the HodlVault example from the repository in full detail. The focus of this page is on the use of the SDK, while the [Examples page](/docs/language/examples) in the language section focuses on the CashScript syntax.

## HodlVault

We will break up the development of the smart contract application in 4 manageable steps:
1. Creating the keypairs
2. Generating a Contract
3. Building the Oracle
4. Sending a Transaction

### Creating the keypairs

To put the `HodlVault.cash` contract to use in a TypeScript application, we have to use the CashScript SDK in combination with a BCH library such as [Libauth][libauth], [Mainnetjs][mainnetjs] or [BCHJS][bchjs]. These libraries are used to generate public/private keys for the contract participants.
In this example we'll use [Libauth][libauth] to generate the keys `alicePriv`, `alicePub`, `oracle` & `oraclePub`. Then we can use these keys to create the smart contract.

:::caution
These 'private keys' are public just for testing, in other contexts you want to very carefully treat private keys as `environment variables`. You would also make sure to use a secure seed phrase and not 'CashScript Examples'...
:::

```ts title="common.ts"
import { hash160 } from '@cashscript/utils';
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPath,
  deriveSeedFromBip39Mnemonic,
  secp256k1,
  encodeCashAddress,
} from '@bitauth/libauth';
import { PriceOracle } from './PriceOracle.js';

// Generate entropy from BIP39 mnemonic phrase and initialise a root HD-wallet node
const seed = deriveSeedFromBip39Mnemonic('CashScript Examples');
const rootNode = deriveHdPrivateNodeFromSeed(seed, true);
const baseDerivationPath = "m/44'/145'/0'/0";

// Derive Alice's private key, public key, public key hash and address
const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);
if (typeof aliceNode === 'string') throw new Error();
export const alicePub = secp256k1.derivePublicKeyCompressed(aliceNode.privateKey) as Uint8Array;
export const alicePriv = aliceNode.privateKey;
export const alicePkh = hash160(alicePub);
export const aliceAddress = encodeCashAddress('bchtest', 'p2pkhWithTokens', alicePkh);

// Initialise a price oracle with a private key
const oracleNode = deriveHdPath(rootNode, `${baseDerivationPath}/2`);
if (typeof oracleNode === 'string') throw new Error();
export const oraclePub = secp256k1.derivePublicKeyCompressed(oracleNode.privateKey) as Uint8Array;
export const oraclePriv = oracleNode.privateKey;
export const oracle = new PriceOracle(oracleNode.privateKey);
export const oraclePkh = hash160(oraclePub);
export const oracleAddress = encodeCashAddress('bchtest', 'p2pkhWithTokens', oraclePkh);
```

### Generating a Contract

For the networkprovider, we'll use the `ElectrumNetworkProvider` from the SDK and for `Simple Transaction Builder` for this example. Once you have a smart contract address you can send funds to it. To spend the Bitcoin cash locked in the contract you will have to satisfy the spending conditions on the contract.

```ts title="hodl_vault.ts"
import { stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import { URL } from 'url';

// Import keys and price oracle from common.ts
import {
  alicePub,
  oraclePub,
} from './common.ts';

// Compile the HodlVault contract to an artifact object
const artifact = compileFile(new URL('hodl_vault.cash', import.meta.url));

// Initialise a network provider for network operations on CHIPNET
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters
const parameters = [alicePub, oraclePub, 100000n, 30000n];
const contract = new Contract(artifact, parameters, { provider });

// Get contract balance & output address + balance
console.log('contract address:', contract.address);
console.log('contract balance:', await contract.getBalance());
```

### Building the Oracle

We need the create the functionality for generating and signing the oracle message to use in the HodlVault contract:

```ts title="PriceOracle.ts"
import { padMinimallyEncodedVmNumber, flattenBinArray, secp256k1 } from '@bitauth/libauth';
import { encodeInt, sha256 } from '@cashscript/utils';

export class PriceOracle {
  constructor(public privateKey: Uint8Array) {}

  // Encode a blockHeight and bchUsdPrice into a byte sequence of 8 bytes (4 bytes per value)
  createMessage(blockHeight: bigint, bchUsdPrice: bigint): Uint8Array {
    const encodedBlockHeight = padMinimallyEncodedVmNumber(encodeInt(blockHeight), 4);
    const encodedBchUsdPrice = padMinimallyEncodedVmNumber(encodeInt(bchUsdPrice), 4);

    return flattenBinArray([encodedBlockHeight, encodedBchUsdPrice]);
  }

  signMessage(message: Uint8Array): Uint8Array {
    const signature = secp256k1.signMessageHashSchnorr(this.privateKey, sha256(message));
    if (typeof signature === 'string') throw new Error();
    return signature;
  }
}
```

### Sending a Transaction

Finally, we can put all of this together to create a working smart contract application. We use the generated keys as a contract arguments directly or in a `SignatureTemplate` to create a transaction signature.

```ts title="hodl_vault.ts"
import { stringify } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import { URL } from 'url';

// Import keys and price oracle from common.ts
import {
  alicePriv,
  alicePub,
  oracle,
  oraclePub,
} from './common.ts';

// Compile the HodlVault contract to an artifact object
const artifact = compileFile(new URL('hodl_vault.cash', import.meta.url));

// Initialise a network provider for network operations on CHIPNET
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new contract using the compiled artifact and network provider
// AND providing the constructor parameters
const parameters = [alicePub, oraclePub, 100000n, 30000n];
const contract = new Contract(artifact, parameters, { provider });

// Fetch contract utxos
const contractUtxos = await contract.getUtxos();

// Log contract output address + contract utxos
console.log('contract address:', contract.address);
console.log('contract utxos', contractUtxos);

// Produce new oracle message and signature
const oracleMessage = oracle.createMessage(100000n, 30000n);
const oracleSignature = oracle.signMessage(oracleMessage);

// Select a hodlvault utxo to spend from
const selectedContractUtxo = contractUtxos[0]

// Create the signatureTemplate for alice to sign the contract input
const aliceSignatureTemplate = new SignatureTemplate(alicePriv)

// Spend from the vault
const transferDetails = await new TransactionBuilder({ provider })
  .addInput(selectedContractUtxo, contract.unlock.spend(aliceSignatureTemplate, oracleSignature, oracleMessage))
  .addOutput({
    to: contract.address,
    amount: 1000n
  })
  .send();

console.log(transferDetails);
```

[bchjs]: https://bchjs.fullstack.cash/
[mainnetjs]: https://mainnet.cash/
[libauth]: https://libauth.org/
[github-examples]: https://github.com/CashScript/cashscript/tree/master/examples
