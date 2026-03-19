---
title: Contract Deployment
sidebar_label: Contract Deployment
---

## When Do You Need a Deployment?

In the UTXO model, multiple UTXOs can live on the same address and are spendable under the same conditions. Many contracts, like multisig wallets, vaults, or escrows, work exactly this way. You compile the contract, share the address, and anyone can send funds to it. There is no "deployment" step: the contract is ready to use the moment you know its address.

Deployment becomes necessary when you're building **stateful contract systems with authentication**. In these systems, a unique CashToken category (token ID) identifies the contract and its state. The token ID is created through a special genesis transaction, and the contract UTXOs are initialized with the right tokens, capabilities, and state. This is what we mean by "deploying" a contract.

:::tip
If your contract simply enforces spending conditions (like requiring multiple signatures or a timelock), you don't need a deployment. Just use the contract address. Deployment is for systems where CashTokens authenticate and track contract state.
:::

## Before the Genesis Transaction

### Contract Addresses

CashScript contract addresses are **deterministic**: they are derived from the contract's compiled bytecode (the artifact) combined with the constructor arguments. Given the same artifact and the same arguments, you will always get the same address.

```ts
import { Contract } from 'cashscript';
import artifact from './my_contract.artifact.js';

const constructorArgs = [oraclePublicKey, startBlockHeight] as const;
const contract = new Contract(artifact, [...constructorArgs], { provider });
console.log(contract.address);       // same inputs → same address every time
console.log(contract.tokenAddress);   // CashToken-aware address
```

This means you can reconstruct a contract's address at any time, on any machine, without querying the blockchain, as long as you have the artifact and the constructor arguments. This property is essential for [verifying deployments](#verifying-a-deployment).

### Preparing Constructor Arguments

Some constructor arguments are straightforward constants (block heights, timelocks). Others require preparation before deployment:

- **Token IDs from other categories** — in complex systems with multiple token categories, contracts often reference each other's token IDs as constructor arguments. Note that token IDs must be byte-reversed when passed as constructor arguments, because the Bitcoin Cash VM uses little-endian byte order internally while token IDs are displayed in big-endian (the same applies to transaction IDs).
- **Locking bytecodes from other contracts** — in multi-contract systems, one contract may reference another by locking bytecode. This creates a dependency chain: you must instantiate the referenced contract first, extract its locking bytecode, and pass it as a constructor argument to the dependent contract.
- **Public keys** — for contracts that validate signed messages (e.g. from an oracle provider), you need the signer's public key. For owner authentication, you need to derive the public key hash from a keypair ahead of time.

```ts
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

// Reverse byte order of a hex string (big-endian ↔ little-endian)
function reverseHex(hex: string): string {
  return hex.match(/../g)!.reverse().join('');
}

// Token IDs must be byte-reversed for use as constructor args
const argsA = [reverseHex(tokenIdB), reverseHex(tokenIdC)] as const;
const contractA = new Contract(artifactA, [...argsA], { provider });

// Extract locking bytecode to pass to a dependent contract
const lockingBytecodeResult = cashAddressToLockingBytecode(contractA.address);
if (typeof lockingBytecodeResult === 'string') throw new Error('Invalid address');
const lockingBytecodeA = binToHex(lockingBytecodeResult.bytecode);

const argsB = [lockingBytecodeA, oraclePublicKey, startBlockHeight] as const;
const contractB = new Contract(artifactB, [...argsB], { provider });
```

:::caution
Constructor arguments are baked into the contract address. If any argument changes, even a single byte of a public key, the contract address changes entirely. Double-check all arguments before deploying. Some parameters, like fee destination addresses, are permanent once deployed and cannot be changed. The wallets behind these addresses require proper creation, backup, and security before deployment.
:::

### Token IDs

In Bitcoin Cash, a new token category is created when a UTXO with `vout: 0` is spent as input index 0 of a transaction. Both conditions must be met. The resulting token ID equals the txid of that spent UTXO.

```ts
// The token ID equals the txid of the vout0 UTXO spent as input index 0
const tokenId = genesisUtxo.txid;
```

Once you have the vout0 UTXO, its txid (the future token ID) is already known before constructing the genesis transaction.

### Setup Wallet

To create vout0 UTXOs and broadcast the genesis transaction, you need a funded wallet. This is typically a standard P2PKH wallet derived from a WIF private key or an HD seed phrase, with enough BCH to fund all contract outputs (each needs at least dust amount, typically 1000 sats).

The setup wallet may already have UTXOs at vout 0, but usually you need to prepare them. You can do this by sending BCH from the setup wallet back to itself as the sole output of a transaction. Since it's the only output, it will be at index 0.

```ts
import { TransactionBuilder, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import type { Utxo } from 'cashscript';

// Helper to create a vout0 UTXO by sending BCH to yourself
async function createVout0(
  provider: ElectrumNetworkProvider,
  address: string,
  utxos: Utxo[],
  template: SignatureTemplate,
  amount: bigint,
): Promise<Utxo> {
  // Pick a non-vout0 UTXO to avoid consuming an existing vout0
  const selectedUtxo = utxos.find(utxo => utxo.satoshis > amount && utxo.vout !== 0 && !utxo.token);
  if (!selectedUtxo) throw new Error('No eligible UTXO available');

  const txBuilder = new TransactionBuilder({ provider });
  txBuilder.addInput(selectedUtxo, template.unlockP2PKH());
  txBuilder.addOutput({ to: address, amount: selectedUtxo.satoshis - 500n });
  const txDetails = await txBuilder.send();

  return { satoshis: selectedUtxo.satoshis - 500n, txid: txDetails.txid, vout: 0 };
}
```

For deployments with multiple token categories, you need multiple vout0 UTXOs, one per token category you want to create. Since contracts may reference each other's token IDs as constructor arguments, it is recommended to prepare all vout0 UTXOs first so that every token ID is known before instantiating any contracts. The genesis transactions themselves can then be broadcast in parallel since they have no inter-transaction dependencies.

:::note
If you plan to include a BCMR OP_RETURN in your genesis transaction, keep the setup wallet "quiet" with minimal transaction history. Some wallets resolve token metadata by querying all transactions on the vout0 address, and a busy address can cause this resolution to be slow or fail.
:::

:::tip
Always test your full deployment flow on chipnet before mainnet. Validating your transaction structure, constructor arguments, and initial state encoding on chipnet first avoids costly mistakes.
:::

## Genesis Transaction

The genesis transaction creates the CashToken category and distributes the initial tokens to contract addresses. This typically includes:

- **Fungible tokens** — the initial token supply distributed to contract addresses
- **NFTs with minting capability** — for contracts that need to create new NFTs during operation
- **NFTs with mutable capability** — for contracts that store updatable state in the NFT commitment
- **NFTs with no capability (immutable)** — for contracts that carry fixed identifying data

:::info
When fungible token supply will be locked inside covenants, it is common to mint the maximum possible amount (`9223372036854775807`). This is only safe when the covenants strictly enforce the actual circulating supply. Minting the max avoids needing to predict future supply needs.
:::

```ts
import { TransactionBuilder, SignatureTemplate } from 'cashscript';

const template = new SignatureTemplate(privateKey);
const tokenId = genesisUtxo.txid;

const txBuilder = new TransactionBuilder({ provider });
txBuilder.addInput(genesisUtxo, template.unlockP2PKH());
txBuilder.addOutput({
  to: contractA.tokenAddress, amount: 1000n,
  token: { category: tokenId, amount: 9223372036854775807n },
});
txBuilder.addOutput({
  to: contractB.tokenAddress, amount: 1000n,
  token: {
    category: tokenId, amount: 0n,
    nft: { capability: 'minting', commitment: initialStateHex },
  },
});
// ... add more outputs as needed
txBuilder.addBchChangeOutputIfNeeded({ to: changeAddress, feeRate: 1.0 });

const txDetails = await txBuilder.send();
```

### Initial State via NFT Commitments

NFT commitments are used to encode the initial state of a contract at deployment. For example, a contract might store a starting counter, a block height, or a configuration value in its NFT commitment. The commitment is a hex-encoded byte string that the contract's covenant logic knows how to read and update.

Use `@bitauth/libauth` to encode values into commitment bytes. This ensures values follow the same VM number encoding that the Bitcoin Cash VM uses:

```ts
import { binToHex, bigIntToVmNumber, padMinimallyEncodedVmNumber } from '@bitauth/libauth';

// Encode a bigint as a fixed-length VM number (matching OP_NUM2BIN behaviour)
function bigIntToFixedBytes(value: bigint, byteLength: number): string {
  const minimal = bigIntToVmNumber(value);
  if (minimal.length > byteLength) throw new Error('value exceeds the requested byteLength');
  // Return early if already the right length — padMinimallyEncodedVmNumber
  // would overshoot by one byte in this case
  if (minimal.length === byteLength) return binToHex(minimal);
  return binToHex(padMinimallyEncodedVmNumber(minimal, byteLength));
}

// Encode initial state as a commitment (e.g. 4-byte counter + 4-byte blockHeight)
function encodeInitialState(counter: bigint, blockHeight: bigint): string {
  return bigIntToFixedBytes(counter, 4) + bigIntToFixedBytes(blockHeight, 4);
}
```

### UTXO Duplication

For systems expecting concurrent usage, you can create multiple identical contract UTXOs in the same genesis transaction. Each duplicate UTXO sits on the same contract address with the same token type, allowing independent transactions to spend different UTXOs without conflicting. The number of duplicates you create determines the system's concurrency capacity. See [accidental race-conditions](/docs/guides/lifecycle#accidental-race-conditions) in the lifecycle guide for more on why this matters.

When duplicating contract UTXOs that hold fungible tokens, the total supply should be evenly distributed across them. The last UTXO can absorb the remainder to ensure the total is exact:

```ts
const supplyPerUtxo = MAX_TOKEN_SUPPLY / BigInt(numberOfDuplicates);
const remainder = MAX_TOKEN_SUPPLY % BigInt(numberOfDuplicates);
const supplyLastUtxo = supplyPerUtxo + remainder;
```

### BCMR Authchain

The [Bitcoin Cash Metadata Registry (BCMR)](https://cashtokens.org/docs/bcmr/chip/) is the standard for associating metadata (name, ticker, decimals, icon) with CashToken categories. The metadata is resolved through an authchain, a chain of transactions starting from a specific output in the genesis transaction.

To set up the authchain during deployment, include a dust output (e.g. 1000 sats) to a designated authchain address as part of the genesis transaction. This output becomes the starting point for metadata resolution. Wallets and indexers follow the authchain from this output to find the latest BCMR metadata.

```ts
// Include a dust output for the BCMR authchain
txBuilder.addOutput({ to: bcmrAuthchainAddress, amount: 1000n });
```

Metadata can be published in the genesis transaction itself by including an OP_RETURN output with the BCMR protocol identifier, the SHA-256 hash of the registry JSON, and the registry URL. Alternatively, the metadata can be published in a later authchain transaction. This approach is simpler since you don't need to know the registry hash at genesis time. See the [CashTokens guide](/docs/guides/cashtokens#cashtokens-bcmr-metadata) for more on BCMR metadata and tooling.

:::note
In a two-step deployment, you prepare the vout0 UTXOs first (learning the token IDs), publish the BCMR registry, then broadcast the genesis transaction with the registry hash in the OP_RETURN. This avoids needing a follow-up authchain update.
:::

## Post-Deployment

Once the genesis transaction is broadcast:

- **Save the deployment configuration** — persist the final [deployment config](#deployment-configuration) (token IDs, constructor args, network) so it can be referenced by application code, verification scripts, and future deployments.
- **Verify BCMR indexing** — if you published BCMR metadata, check that a BCMR indexer has resolved your token metadata correctly. Wallets rely on this for displaying token names and icons.
- **Verify the deployment** — if you built a standalone [verification script](#verifying-a-deployment), run it against the live deployment to confirm everything matches.
- **Set up infrastructure** — see the [infrastructure guide](/docs/guides/infrastructure) for guidance on storing contract details and setting up transaction servers.

## Deployment Configuration

After the genesis transaction, it's worth capturing all deployment parameters into a typed configuration object. This makes deployments reproducible and easy to reference in application code, verification scripts, and tests.

A deployment configuration typically includes:

- **Name and network** — a human-readable identifier and whether it targets `mainnet` or `chipnet`
- **Contract version** — which version of the contract artifacts are being deployed
- **Token IDs** — the CashToken category IDs created during genesis
- **Contract parameters** — the constructor arguments used to instantiate the contracts

```ts
interface MyDeployment {
  name: string;
  network: 'mainnet' | 'chipnet';
  contractVersion: string;
  tokenIds: {
    myTokenId: string;
  };
  contractParams: {
    oraclePublicKey: string;
    startBlockHeight: bigint;
    // ... other params
  };
}
```

Maintaining named deployment objects lets you keep multiple deployments side by side: production, staging, and testing variants with different parameters (e.g. testing oracles), so you can iterate quickly during development before committing to a mainnet deployment.

:::tip
Use your deployment configuration as the single source of truth for verification scripts, application code, and documentation. If the deployment config is correct, everything downstream can be derived from it.
:::

## Verifying a Deployment

A contract system is only trustless if its deployment can be independently verified. Deployment scripts may not be open source, and even if they are, there is no guarantee the published script is what was actually used. Contract developers should provide standalone verification scripts so that security researchers and technical users can independently confirm a deployment's correctness.

Since contract addresses are deterministic, verification works by reconstructing every expected address from the contract artifacts and deployment parameters, then comparing the result against what actually exists on-chain.

```ts
import { Contract } from 'cashscript';
import artifact from './my_contract.artifact.js';

// Reconstruct all contract addresses from the deployment config
const constructorArgs = [
  deployment.contractParams.oraclePublicKey,
  deployment.contractParams.startBlockHeight,
] as const;
const contract = new Contract(artifact, [...constructorArgs], { provider });

// This should match the address where tokens were sent
const expectedAddress = contract.tokenAddress;
```

:::caution
Provide verification scripts as part of your project, not bundled into the deployment script itself. They should be runnable independently by anyone with the contract artifacts and deployment configuration.
:::

### What to Verify

Verification should inspect every output of the genesis transaction, not just the ones you expect. If tokens are sent to an unexpected address, like a regular P2PKH, this could give full authority over the token category to the deployer. For example, a minting NFT on a personal address means the holder can mint unlimited tokens outside the contract's rules.

Build a list of all expected contract addresses, then iterate over all outputs and check:

1. **No unexpected token outputs** — every output carrying token data must go to a known contract address
2. **Token category** — do the outputs carry the correct token ID?
3. **NFT capability** — is it `minting`, `mutable`, or `none` as expected for each contract address?
4. **NFT commitment** — does it contain the correct initial state?
5. **Fungible token amount** — is the total supply distributed correctly? Fungible tokens should only appear on the expected contract addresses.
6. **Genesis transaction inputs** — does the first input's previous txid match the expected token ID? This confirms the token was genuinely created in this transaction.

```ts
// Build the list of all expected contract addresses
const expectedAddresses = new Set([
  contractA.tokenAddress,
  contractB.tokenAddress,
  // ... all expected contract addresses
]);

// Iterate over ALL outputs of the genesis transaction
for (const output of genesisTxOutputs) {
  if (output.tokenData && !expectedAddresses.has(output.address)) {
    throw new Error(`Unexpected token output to address: ${output.address}`);
  }

  // Validate each known address has the right capability, commitment, and amount
}
```

