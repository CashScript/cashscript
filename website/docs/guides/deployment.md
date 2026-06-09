---
title: Contract Deployment
sidebar_label: Contract Deployment
---

Not every CashScript contract needs a deployment transaction. In the UTXO model, many UTXOs can live on the same contract address and use the same spending rules. For contracts like multisig wallets, vaults, and escrows, you can compile the contract, share the address, and send funds to it. The contract is ready to use as soon as you know its address.

Deployment is only needed for **stateful contract systems** where CashTokens authenticate contract state. In these systems, a genesis transaction creates one or more token categories and initializes the contract UTXOs with the right token amounts, NFT capabilities, and NFT commitments.

:::tip
If your contract only enforces spending conditions, use the contract address directly. Deployment is for systems where CashTokens identify and track contract state.
:::

## Preparing a Deployment

Before constructing the genesis transaction, you need to know which constructor arguments, token IDs, setup UTXOs, initial state, and permanent addresses the deployment will use.

### Contract Addresses

CashScript contract addresses are deterministic. They are derived from the compiled artifact and the constructor arguments. Given the same artifact and arguments, the SDK produces the same address every time.

```ts
import { Contract } from 'cashscript';
import artifact from './my_contract.artifact.js';

const constructorArgs = [oraclePublicKey, startBlockHeight] as const;
const contract = new Contract(artifact, [...constructorArgs], { provider });

console.log(contract.address);      // same inputs produce the same address
console.log(contract.tokenAddress); // CashToken-aware address
```

This means you can reconstruct a contract address on any machine without querying the blockchain, as long as you have the artifact and constructor arguments. This property is essential for [verifying deployments](#verifying-a-deployment).

### Constructor Arguments

Some constructor arguments are simple constants. Others need to be prepared before deployment:

- **Token IDs from other categories**: multi-contract systems often pass other token category IDs as constructor arguments.
- **Locking bytecodes from other contracts**: one contract may authenticate another by locking bytecode. Instantiate the referenced contract first, then pass its `lockingBytecode` to the dependent contract.
- **Public keys**: oracle or owner checks often require a public key or public key hash that must be derived before deployment.

```ts
import { swapEndianness } from '@bitauth/libauth';
import { Contract } from 'cashscript';

// when using a standard encoded tokenId, swap the endianness of the hex before using it in your contract
const argsA = [swapEndianness(tokenIdX), swapEndianness(tokenIdY)] as const;
const contractA = new Contract(artifactA, [...argsA], { provider });

// Pass contractA's locking bytecode to a dependent contract.
const argsB = [contractA.lockingBytecode, oraclePublicKey, startBlockHeight] as const;
const contractB = new Contract(artifactB, [...argsB], { provider });
```

:::caution
Double-check all constructor arguments before deploying. Some values, such as fee destination addresses or authority keys, may be permanent once the contract system is live.
:::

### Token IDs and vout0 UTXOs

On Bitcoin Cash, a new token category can be created by spending a UTXO at output index `0`. The token ID equals the txid of that UTXO. If you know which `vout: 0` UTXO will be used for the genesis transaction, you already know the token ID that transaction can create.

For deployments with multiple token categories, prepare one `vout: 0` UTXO per token category. This lets you know every token ID before instantiating contracts that reference those IDs. Once the setup UTXOs are prepared, the genesis transactions can be broadcast in parallel if they do not spend from each other.

### Setup Wallet

Use a funded setup wallet to create the `vout: 0` UTXOs and broadcast the genesis transaction. Each contract output also needs enough BCH for dust, commonly 1000 sats.

The setup wallet may already have suitable `vout: 0` UTXOs. If not, send BCH from the setup wallet back to itself as the only output of a transaction. Since it is the only output, it will be at index `0`.

```ts
import { TransactionBuilder, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import type { Utxo } from 'cashscript';

// Create a vout0 UTXO by sending BCH to yourself.
async function createVout0(
  provider: ElectrumNetworkProvider,
  address: string,
  utxos: Utxo[],
  template: SignatureTemplate,
): Promise<Utxo> {
  const selectedUtxo = utxos.find(utxo => utxo.vout !== 0 && !utxo.token);
  if (!selectedUtxo) throw new Error('No eligible UTXO available');

  const amount = selectedUtxo.satoshis - 500n;
  const txBuilder = new TransactionBuilder({ provider });
  txBuilder.addInput(selectedUtxo, template.unlockP2PKH());
  txBuilder.addOutput({ to: address, amount });

  const txDetails = await txBuilder.send();
  return { satoshis: amount, txid: txDetails.txid, vout: 0 };
}
```

:::tip
Test the full deployment flow on chipnet before mainnet. This validates your transaction structure, constructor arguments, and state encoding before anything has permanent value.
:::

## Genesis Transaction

The genesis transaction creates the CashToken category and sends the initial token outputs to the relevant contract addresses. It can include:

- **Fungible tokens**: the initial token supply.
- **Minting NFTs**: authority for contracts that need to create new NFTs later.
- **Mutable NFTs**: updatable contract state stored in NFT commitments.
- **Immutable NFTs**: fixed identifying data.

:::info
When fungible token supply will be locked inside covenants, it is common to mint the maximum possible amount (`9223372036854775807`). This is only safe when the covenants strictly enforce the actual circulating supply.
:::

```ts
import { TransactionBuilder, SignatureTemplate } from 'cashscript';

const template = new SignatureTemplate(privateKey);
const tokenId = genesisUtxo.txid;

const txBuilder = new TransactionBuilder({ provider });
txBuilder.addInput(genesisUtxo, template.unlockP2PKH());
txBuilder.addOutput({
  to: contractA.tokenAddress,
  amount: 1000n,
  token: { category: tokenId, amount: 9223372036854775807n },
});
txBuilder.addOutput({
  to: contractB.tokenAddress,
  amount: 1000n,
  token: {
    category: tokenId,
    amount: 0n,
    nft: { capability: 'minting', commitment: initialStateHex },
  },
});
// Add more outputs as needed.
txBuilder.addBchChangeOutputIfNeeded({ to: changeAddress, feeRate: 1.0 });

const txDetails = await txBuilder.send();
```

### Initial State

NFT commitments are commonly used to encode the initial state of a contract at deployment. For example, a contract might store a starting counter, block height, or configuration value in the NFT commitment.

Use the same encoding that your contract expects. For VM number values, use `@cashscript/utils` and `@bitauth/libauth` helpers to avoid mismatches.

```ts
import { binToHex } from '@bitauth/libauth';
import { encodeIntAsFixedBytes } from '@cashscript/utils';

// Encode initial state as 4-byte counter + 4-byte block height.
function encodeInitialState(counter: bigint, blockHeight: bigint): string {
  const encodedCounter = encodeIntAsFixedBytes(counter, 4);
  const encodedBlockHeight = encodeIntAsFixedBytes(blockHeight, 4);
  return binToHex(encodedCounter) + binToHex(encodedBlockHeight);
}
```

### Duplicate Contract UTXOs

For systems expecting [concurrent usage](/docs/guides/concurrency), create multiple identical contract UTXOs in the genesis transaction. Each duplicate sits at the same contract address with the same token type, allowing independent transactions to spend different UTXOs without conflicting.

When duplicating UTXOs that hold fungible tokens, distribute the total supply exactly across them:

```ts
const supplyPerUtxo = MAX_TOKEN_SUPPLY / BigInt(numberOfDuplicates);
const remainder = MAX_TOKEN_SUPPLY % BigInt(numberOfDuplicates);
const supplyLastUtxo = supplyPerUtxo + remainder;
```

### BCMR Metadata

The [Bitcoin Cash Metadata Registry (BCMR)][bcmr] is the standard for associating metadata with CashToken categories, such as name, ticker, decimals, and icon. Wallets and indexers resolve this metadata through an authchain.

To start the authchain during deployment, include a dust output at index `0` to a designated authchain address. This output becomes the starting point for metadata resolution.

```ts
// Include a dust output for the BCMR authchain.
txBuilder.addOutput({ to: bcmrAuthchainAddress, amount: 1000n });
```

Metadata can be published in the genesis transaction with an `OP_RETURN` output containing the BCMR protocol identifier, registry hash, and registry URL. It can also be published later in an authchain transaction. See the [CashTokens guide](/docs/guides/cashtokens#cashtokens-bcmr-metadata) for more on BCMR metadata and tooling.

:::note
A two-step deployment can avoid a follow-up authchain update: prepare the `vout: 0` UTXO first, publish the BCMR registry, then broadcast the genesis transaction with the registry hash in the `OP_RETURN`.
:::

## After Deployment

Once the genesis transaction is broadcast:

- **Save the deployment configuration**: persist token IDs, constructor arguments, network, artifact version, and other parameters.
- **Verify BCMR indexing**: check that a BCMR indexer resolves your token metadata correctly.
- **Verify the deployment**: run a standalone verification script against the live deployment.
- **Set up infrastructure**: see the [infrastructure guide](/docs/guides/infrastructure) for storing contract details and setting up transaction servers.

## Deployment Configuration

Capture deployment parameters in a typed configuration object. This makes deployments reproducible and easy to reference from application code, verification scripts, and tests.

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
    // Add other params here.
  };
}
```

Use your deployment configuration as the single source of truth for verification scripts, application code, and documentation.

:::tip
Maintaining named deployment objects lets you keep production, staging, and testing deployments side by side. This makes it easy to use different parameters, such as testing oracles, while iterating before a mainnet deployment.
:::

## Verifying a Deployment

A contract system is only trustless if its deployment can be independently verified. Deployment scripts may not be open source, and even if they are, users still need a way to verify what exists on-chain.

Since contract addresses are deterministic, verification works by reconstructing every expected address from the artifacts and deployment parameters, then comparing the result against the genesis transaction outputs.

```ts
import { Contract } from 'cashscript';
import artifact from './my_contract.artifact.js';

const constructorArgs = [
  deployment.contractParams.oraclePublicKey,
  deployment.contractParams.startBlockHeight,
] as const;

const contract = new Contract(artifact, [...constructorArgs], { provider });
const expectedAddress = contract.tokenAddress;
```

:::caution
Provide verification scripts as part of your project, not bundled into the deployment script itself. They should be runnable independently by anyone with the contract artifacts and deployment configuration.
:::

### What to Verify

Verification should inspect every output of the genesis transaction, not just the outputs you expect. If tokens are sent to an unexpected address, such as a regular P2PKH address, that address may hold authority over the token category.

Check at least the following:

1. **Token outputs**: every token output goes to a known contract address or expected authchain address.
2. **Token category**: each token output uses the expected token ID.
3. **NFT capability**: each NFT has the expected capability, such as `minting`, `mutable`, or `none`.
4. **NFT commitment**: commitments contain the expected initial state.
5. **Fungible token amount**: total supply is distributed correctly.
6. **Genesis input**: the first input's previous txid matches the expected token ID.

```ts
const expectedAddresses = new Set([
  contractA.tokenAddress,
  contractB.tokenAddress,
  // Add all expected contract addresses.
]);

for (const output of genesisTxOutputs) {
  if (output.tokenData && !expectedAddresses.has(output.address)) {
    throw new Error(`Unexpected token output to address: ${output.address}`);
  }

  // Validate capability, commitment, and amount for each known address.
}
```

[bcmr]: https://cashtokens.org/docs/bcmr/chip/
