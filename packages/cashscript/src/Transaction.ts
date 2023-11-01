import bip68 from 'bip68';
import {
  hexToBin,
  decodeTransaction,
  Transaction as LibauthTransaction,
} from '@bitauth/libauth';
import delay from 'delay';
import {
  AbiFunction,
  placeholder,
  scriptToBytecode,
} from '@cashscript/utils';
import deepEqual from 'fast-deep-equal';
import {
  Utxo,
  Output,
  Recipient,
  TokenDetails,
  NftObject,
  isUtxoP2PKH,
  TransactionDetails,
  Unlocker,
} from './interfaces.js';
import {
  meep,
  createInputScript,
  getInputSize,
  createOpReturnOutput,
  getTxSizeWithoutInputs,
  getPreimageSize,
  buildError,
  validateOutput,
  utxoComparator,
  calculateDust,
  getOutputSize,
  utxoTokenComparator,
} from './utils.js';
import SignatureTemplate from './SignatureTemplate.js';
import { P2PKH_INPUT_SIZE } from './constants.js';
import { TransactionBuilder } from './TransactionBuilder.js';
import { Contract } from './Contract.js';

export class Transaction {
  private inputs: Utxo[] = [];
  private outputs: Output[] = [];

  private sequence = 0xfffffffe;
  private locktime: number;
  private feePerByte: number = 1.0;
  private hardcodedFee: bigint;
  private minChange: bigint = 0n;
  private tokenChange: boolean = true;

  constructor(
    private contract: Contract,
    private unlocker: Unlocker,
    private abiFunction: AbiFunction,
    private args: (Uint8Array | SignatureTemplate)[],
    private selector?: number,
  ) {}

  from(input: Utxo): this;
  from(inputs: Utxo[]): this;

  from(inputOrInputs: Utxo | Utxo[]): this {
    if (!Array.isArray(inputOrInputs)) {
      inputOrInputs = [inputOrInputs];
    }

    this.inputs = this.inputs.concat(inputOrInputs);

    return this;
  }

  fromP2PKH(input: Utxo, template: SignatureTemplate): this;
  fromP2PKH(inputs: Utxo[], template: SignatureTemplate): this;

  fromP2PKH(inputOrInputs: Utxo | Utxo[], template: SignatureTemplate): this {
    if (!Array.isArray(inputOrInputs)) {
      inputOrInputs = [inputOrInputs];
    }

    inputOrInputs = inputOrInputs.map((input) => ({ ...input, template }));

    this.inputs = this.inputs.concat(inputOrInputs);

    return this;
  }

  to(to: string, amount: bigint, token?: TokenDetails): this;
  to(outputs: Recipient[]): this;

  to(toOrOutputs: string | Recipient[], amount?: bigint, token?: TokenDetails): this {
    if (typeof toOrOutputs === 'string' && typeof amount === 'bigint') {
      const recipient = { to: toOrOutputs, amount, token };
      return this.to([recipient]);
    }

    if (Array.isArray(toOrOutputs) && amount === undefined) {
      toOrOutputs.forEach(validateOutput);
      this.outputs = this.outputs.concat(toOrOutputs);
      return this;
    }

    throw new Error('Incorrect arguments passed to function \'to\'');
  }

  withOpReturn(chunks: string[]): this {
    this.outputs.push(createOpReturnOutput(chunks));
    return this;
  }

  withAge(age: number): this {
    this.sequence = bip68.encode({ blocks: age });
    return this;
  }

  withTime(time: number): this {
    this.locktime = time;
    return this;
  }

  withHardcodedFee(hardcodedFee: bigint): this {
    this.hardcodedFee = hardcodedFee;
    return this;
  }

  withFeePerByte(feePerByte: number): this {
    this.feePerByte = feePerByte;
    return this;
  }

  withMinChange(minChange: bigint): this {
    this.minChange = minChange;
    return this;
  }

  withoutChange(): this {
    return this.withMinChange(BigInt(Number.MAX_VALUE));
  }

  withoutTokenChange(): this {
    this.tokenChange = false;
    return this;
  }

  async build(): Promise<string> {
    this.locktime = this.locktime ?? await this.contract.provider.getBlockHeight();
    await this.setInputsAndOutputs();

    const builder = new TransactionBuilder({ provider: this.contract.provider });

    this.inputs.forEach((utxo) => {
      if (isUtxoP2PKH(utxo)) {
        builder.addInput(utxo, utxo.template.unlockP2PKH(), { sequence: this.sequence });
      } else {
        builder.addInput(utxo, this.unlocker, { sequence: this.sequence });
      }
    });

    builder.addOutputs(this.outputs);
    builder.setLocktime(this.locktime);

    return builder.build();
  }

  async send(): Promise<TransactionDetails>;
  async send(raw: true): Promise<string>;

  async send(raw?: true): Promise<TransactionDetails | string> {
    const tx = await this.build();
    try {
      const txid = await this.contract.provider.sendRawTransaction(tx);
      return raw ? await this.getTxDetails(txid, raw) : await this.getTxDetails(txid);
    } catch (e: any) {
      const reason = e.error ?? e.message;
      throw buildError(reason, meep(tx, this.inputs, this.contract.redeemScript));
    }
  }

  private async getTxDetails(txid: string): Promise<TransactionDetails>
  private async getTxDetails(txid: string, raw: true): Promise<string>;

  private async getTxDetails(txid: string, raw?: true): Promise<TransactionDetails | string> {
    for (let retries = 0; retries < 1200; retries += 1) {
      await delay(500);
      try {
        const hex = await this.contract.provider.getRawTransaction(txid);

        if (raw) return hex;

        const libauthTransaction = decodeTransaction(hexToBin(hex)) as LibauthTransaction;
        return { ...libauthTransaction, txid, hex };
      } catch (ignored) {
        // ignored
      }
    }

    // Should not happen
    throw new Error('Could not retrieve transaction details for over 10 minutes');
  }

  async meep(): Promise<string> {
    const tx = await this.build();
    return meep(tx, this.inputs, this.contract.redeemScript);
  }

  private async setInputsAndOutputs(): Promise<void> {
    if (this.outputs.length === 0) {
      throw Error('Attempted to build a transaction without outputs');
    }

    // Fetched utxos are only used when no inputs are available, so only fetch in that case.
    const allUtxos: Utxo[] = this.inputs.length === 0
      ? await this.contract.provider.getUtxos(this.contract.address)
      : [];

    const tokenInputs = this.inputs.length > 0
      ? this.inputs.filter((input) => input.token)
      : selectAllTokenUtxos(allUtxos, this.outputs);

    // This throws if the manually selected inputs are not enough to cover the outputs
    if (this.inputs.length > 0) {
      selectAllTokenUtxos(this.inputs, this.outputs);
    }

    if (this.tokenChange) {
      const tokenChangeOutputs = createFungibleTokenChangeOutputs(
        tokenInputs, this.outputs, this.contract.tokenAddress,
      );
      this.outputs.push(...tokenChangeOutputs);
    }

    // Construct list with all nfts in inputs
    const listNftsInputs: NftObject[] = [];
    // If inputs are manually selected, add their tokens to balance
    this.inputs.forEach((input) => {
      if (!input.token) return;
      if (input.token.nft) {
        listNftsInputs.push({ ...input.token.nft, category: input.token.category });
      }
    });
    // Construct list with all nfts in outputs
    let listNftsOutputs: NftObject[] = [];
    // Subtract all token outputs from the token balances
    this.outputs.forEach((output) => {
      if (!output.token) return;
      if (output.token.nft) {
        listNftsOutputs.push({ ...output.token.nft, category: output.token.category });
      }
    });
    // If inputs are manually provided, check token balances
    if (this.inputs.length > 0) {
      // Compare nfts in- and outputs, check if inputs have nfts corresponding to outputs
      // Keep list of nfts in inputs without matching output
      // First check immutable nfts, then mutable & minting nfts together
      // This is so an immutible input gets matched first and is removed from the list of unused nfts
      let unusedNfts = listNftsInputs;
      for (const nftInput of listNftsInputs) {
        if (nftInput.capability === 'none') {
          for (let i = 0; i < listNftsOutputs.length; i += 1) {
            // Deep equality check token objects
            if (deepEqual(listNftsOutputs[i], nftInput)) {
              listNftsOutputs.splice(i, 1);
              unusedNfts = unusedNfts.filter((nft) => !deepEqual(nft, nftInput));
              break;
            }
          }
        }
      }
      for (const nftInput of listNftsInputs) {
        if (nftInput.capability === 'minting') {
          // eslint-disable-next-line max-len
          const newListNftsOutputs: NftObject[] = listNftsOutputs.filter((nftOutput) => nftOutput.category !== nftInput.category);
          if (newListNftsOutputs !== listNftsOutputs) {
            unusedNfts = unusedNfts.filter((nft) => !deepEqual(nft, nftInput));
            listNftsOutputs = newListNftsOutputs;
          }
        }
        if (nftInput.capability === 'mutable') {
          for (let i = 0; i < listNftsOutputs.length; i += 1) {
            if (listNftsOutputs[i].category === nftInput.category) {
              listNftsOutputs.splice(i, 1);
              unusedNfts = unusedNfts.filter((nft) => !deepEqual(nft, nftInput));
              break;
            }
          }
        }
      }
      for (const nftOutput of listNftsOutputs) {
        const genesisUtxo = getTokenGenesisUtxo(this.inputs, nftOutput.category);
        if (genesisUtxo) {
          listNftsOutputs = listNftsOutputs.filter((nft) => !deepEqual(nft, nftOutput));
        }
      }
      if (listNftsOutputs.length !== 0) {
        throw new Error(`NFT output with token category ${listNftsOutputs[0].category} does not have corresponding input`);
      }
      if (this.tokenChange) {
        for (const unusedNft of unusedNfts) {
          const tokenDetails: TokenDetails = {
            category: unusedNft.category,
            amount: BigInt(0),
            nft: {
              capability: unusedNft.capability,
              commitment: unusedNft.commitment,
            },
          };
          const nftChangeOutput = { to: this.contract.tokenAddress, amount: BigInt(1000), token: tokenDetails };
          this.outputs.push(nftChangeOutput);
        }
      }
    }

    // Replace all SignatureTemplate with 65-length placeholder Uint8Arrays
    const placeholderArgs = this.args.map((arg) => (
      arg instanceof SignatureTemplate ? placeholder(65) : arg
    ));

    // Create a placeholder preimage of the correct size
    const placeholderPreimage = this.abiFunction.covenant
      ? placeholder(getPreimageSize(scriptToBytecode(this.contract.redeemScript)))
      : undefined;

    // Create a placeholder input script for size calculation using the placeholder
    // arguments and correctly sized placeholder preimage
    const placeholderScript = createInputScript(
      this.contract.redeemScript,
      placeholderArgs,
      this.selector,
      placeholderPreimage,
    );

    // Add one extra byte per input to over-estimate tx-in count
    const contractInputSize = getInputSize(placeholderScript) + 1;

    // Note that we use the addPrecision function to add "decimal points" to BigInt numbers

    // Calculate amount to send and base fee (excluding additional fees per UTXO)
    let amount = addPrecision(this.outputs.reduce((acc, output) => acc + output.amount, 0n));
    let fee = addPrecision(this.hardcodedFee ?? getTxSizeWithoutInputs(this.outputs) * this.feePerByte);

    // Select and gather UTXOs and calculate fees and available funds
    let satsAvailable = 0n;
    if (this.inputs.length > 0) {
      // If inputs are already defined, the user provided the UTXOs and we perform no further UTXO selection
      if (!this.hardcodedFee) {
        const totalInputSize = this.inputs.reduce(
          (acc, input) => acc + (isUtxoP2PKH(input) ? P2PKH_INPUT_SIZE : contractInputSize),
          0,
        );
        fee += addPrecision(totalInputSize * this.feePerByte);
      }

      satsAvailable = addPrecision(this.inputs.reduce((acc, input) => acc + input.satoshis, 0n));
    } else {
      // If inputs are not defined yet, we retrieve the contract's UTXOs and perform selection
      const bchUtxos = allUtxos.filter((utxo) => !utxo.token);

      // We sort the UTXOs mainly so there is consistent behaviour between network providers
      // even if they report UTXOs in a different order
      bchUtxos.sort(utxoComparator).reverse();

      // Add all automatically added token inputs to the transaction
      for (const utxo of tokenInputs) {
        this.inputs.push(utxo);
        satsAvailable += addPrecision(utxo.satoshis);
        if (!this.hardcodedFee) fee += addPrecision(contractInputSize * this.feePerByte);
      }

      for (const utxo of bchUtxos) {
        if (satsAvailable > amount + fee) break;
        this.inputs.push(utxo);
        satsAvailable += addPrecision(utxo.satoshis);
        if (!this.hardcodedFee) fee += addPrecision(contractInputSize * this.feePerByte);
      }
    }

    // Remove "decimal points" from BigInt numbers (rounding up for fee, down for others)
    satsAvailable = removePrecisionFloor(satsAvailable);
    amount = removePrecisionFloor(amount);
    fee = removePrecisionCeil(fee);

    // Calculate change and check available funds
    let change = satsAvailable - amount - fee;

    if (change < 0) {
      throw new Error(`Insufficient funds: available (${satsAvailable}) < needed (${amount + fee}).`);
    }

    // Account for the fee of adding a change output
    if (!this.hardcodedFee) {
      const changeOutputSize = getOutputSize({ to: this.contract.address, amount: 0n });
      change -= BigInt(changeOutputSize * this.feePerByte);
    }

    // Add a change output if applicable
    const changeOutput = { to: this.contract.address, amount: change };
    if (change >= this.minChange && change >= calculateDust(changeOutput)) {
      this.outputs.push(changeOutput);
    }
  }
}

const getTokenGenesisUtxo = (utxos: Utxo[], tokenCategory: string): Utxo | undefined => {
  const creationUtxo = utxos.find((utxo) => utxo.vout === 0 && utxo.txid === tokenCategory);
  return creationUtxo;
};

const getTokenCategories = (outputs: Array<Output | Utxo>): string[] => (
  outputs
    .filter((output) => output.token)
    .map((output) => output.token!.category)
);

const calculateTotalTokenAmount = (outputs: Array<Output | Utxo>, tokenCategory: string): bigint => (
  outputs
    .filter((output) => output.token?.category === tokenCategory)
    .reduce((acc, output) => acc + output.token!.amount, 0n)
);

const selectTokenUtxos = (utxos: Utxo[], amountNeeded: bigint, tokenCategory: string): Utxo[] => {
  const genesisUtxo = getTokenGenesisUtxo(utxos, tokenCategory);
  if (genesisUtxo) return [genesisUtxo];

  const tokenUtxos = utxos.filter((utxo) => utxo.token?.category === tokenCategory && utxo.token?.amount > 0n);

  // We sort the UTXOs mainly so there is consistent behaviour between network providers
  // even if they report UTXOs in a different order
  tokenUtxos.sort(utxoTokenComparator).reverse();

  let amountAvailable = 0n;
  const selectedUtxos: Utxo[] = [];

  // Add token UTXOs until we have enough to cover the amount needed (no fee calculation because it's a token)
  for (const utxo of tokenUtxos) {
    if (amountAvailable >= amountNeeded) break;
    selectedUtxos.push(utxo);
    amountAvailable += utxo.token!.amount;
  }

  if (amountAvailable < amountNeeded) {
    throw new Error(`Insufficient funds for token ${tokenCategory}: available (${amountAvailable}) < needed (${amountNeeded}).`);
  }

  return selectedUtxos;
};

const selectAllTokenUtxos = (utxos: Utxo[], outputs: Output[]): Utxo[] => {
  const tokenCategories = getTokenCategories(outputs);
  return tokenCategories.flatMap(
    (tokenCategory) => selectTokenUtxos(utxos, calculateTotalTokenAmount(outputs, tokenCategory), tokenCategory),
  );
};

const createFungibleTokenChangeOutputs = (utxos: Utxo[], outputs: Output[], address: string): Output[] => {
  const tokenCategories = getTokenCategories(utxos);

  const changeOutputs = tokenCategories.map((tokenCategory) => {
    const required = calculateTotalTokenAmount(outputs, tokenCategory);
    const available = calculateTotalTokenAmount(utxos, tokenCategory);
    const change = available - required;

    if (change === 0n) return undefined;

    return { to: address, amount: BigInt(1000), token: { category: tokenCategory, amount: change } };
  });

  return changeOutputs.filter((output) => output !== undefined) as Output[];
};

// Note: the below is a very simple implementation of a "decimal point" system for BigInt numbers
// It is safe to use for UTXO fee calculations due to its low numbers, but should not be used for other purposes
// Also note that multiplication and division between two "decimal" bigints is not supported

// High precision may not work with some 'number' inputs, so we set the default to 6 "decimal places"
const addPrecision = (amount: number | bigint, precision: number = 6): bigint => {
  if (typeof amount === 'number') {
    return BigInt(Math.ceil(amount * 10 ** precision));
  }

  return amount * BigInt(10 ** precision);
};

const removePrecisionFloor = (amount: bigint, precision: number = 6): bigint => (
  amount / (10n ** BigInt(precision))
);

const removePrecisionCeil = (amount: bigint, precision: number = 6): bigint => {
  const multiplier = 10n ** BigInt(precision);
  return (amount + multiplier - 1n) / multiplier;
};
