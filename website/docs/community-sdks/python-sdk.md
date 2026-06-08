---
title: Python SDK
---

[`cashscript-py`][pypi] is a community-maintained Python SDK for CashScript development. It is a port of the official [TypeScript SDK][typescript-sdk] and aims to give Python developers (for example those building server-side tools, bots, or Electron Cash plugins) a familiar API for constructing and interacting with CashScript contracts on BCH without re-implementing low-level details.

:::info
The Python SDK is maintained independently from the official CashScript project. For the full API reference, guides and runnable examples, see the links under [Documentation](#documentation) below.
:::

## When to use the Python SDK

Use the Python SDK when you want to build and send CashScript transactions from a Python codebase. It mirrors the structure of the TypeScript SDK, so the same four core classes are available. See the [TypeScript SDK documentation][typescript-sdk] for more details.

- the `Contract` class
- the `TransactionBuilder` class
- the `NetworkProvider` class (e.g. `ElectrumNetworkProvider`)
- the `SignatureTemplate` class

Contracts are still compiled with `cashc` and loaded from the resulting artifact JSON. The Python SDK only handles instantiation, transaction building and network interaction.

## Installation

Install from PyPI:

```bash
pip install cashscript-py
```

Or, with [`uv`][uv]:

```bash
uv add cashscript-py
```

## SDK usage

The usage of the 4 classes in your code is as follows: before using the SDK you create one or multiple contract artifacts compiled by `cashc`. Then to start using the SDK, you instantiate a `NetworkProvider`, which you then provide to instantiate a `Contract` from an `Artifact`. Once you have a `Contract` instance, you can use it in the `TransactionBuilder`. During transaction building you might need to generate a signature, in which case you would instantiate a `SignatureTemplate`.

For more complete examples of the SDK flow, refer to the [runnable examples][examples] in the Python SDK repository.

#### Example

```python
from cashscript_py import Contract, ElectrumNetworkProvider, Output, SignatureTemplate, TransactionBuilder
from .artifact import p2pkh_artifact
from .somewhere import contract_arguments, alice_wif, send_amount, recipient_address

provider = ElectrumNetworkProvider("chipnet")
contract = Contract(p2pkh_artifact, contract_arguments, provider)

alice_signature_template = SignatureTemplate(alice_wif)
unlocker = contract.unlock["transfer"](alice_signature_template)

contract_utxos = await contract.get_utxos()
contract_utxo = contract_utxos[0]

transaction_builder = TransactionBuilder(provider)
transaction_builder.add_input(contract_utxo, unlocker)
transaction_builder.add_output(Output(amount=send_amount, to=recipient_address))

tx_details = await transaction_builder.send()
```

## Feature parity with the TypeScript SDK

The Python SDK and the TypeScript SDK are developed independently and have independent versioning, so APIs and available functionality may drift between the two. The sections below call out the most notable gaps at the time of writing, but for anything beyond the basic flow you should always consult the [Python SDK documentation][readthedocs] rather than assuming parity with the TypeScript SDK.

The Python SDK covers the core `Contract`, `TransactionBuilder`, `NetworkProvider` and `SignatureTemplate` APIs, but a few features from the TypeScript SDK are not (yet) available:

- **`debug()`**: the TypeScript SDK can locally evaluate and debug transactions via a `debug()` API. The Python SDK does not currently provide an equivalent.
- **`get_bitauth_uri()`**: the TypeScript SDK can generate a [BitAuth IDE][bitauth-ide] URI via `getBitauthUri()`. The Python SDK does not currently provide this helper.
- **`generate_wc_transaction_object()`**: the TypeScript SDK can generate a WalletConnect signing payload. The Python SDK does not currently provide this feature.

See the [Python SDK Transaction Builder guide][transaction-builder-guide] in the Python SDK repository for the full details on each of these sections.

## Documentation

The Python SDK has its own documentation site and examples.

- **Documentation:** [cashscript-py.readthedocs.io][readthedocs]
- **PyPI package:** [cashscript-py][pypi]
- **Source code:** [gitlab.com/cashscript-py/cashscript-py][source]

[pypi]: https://pypi.org/project/cashscript-py/
[typescript-sdk]: ../sdk/typescript-sdk.md
[uv]: https://docs.astral.sh/uv/
[examples]: https://gitlab.com/cashscript-py/cashscript-py/-/tree/master/examples
[readthedocs]: https://cashscript-py.readthedocs.io/
[bitauth-ide]: https://ide.bitauth.com/
[transaction-builder-guide]: https://cashscript-py.readthedocs.io/en/latest/guide/transaction-builder.html
[source]: https://gitlab.com/cashscript-py/cashscript-py
