import {
  hexToBin,
  binToHex,
  encodeTransaction,
  addressContentsToLockingBytecode,
  decodeTransaction,
  Transaction as LibauthTransaction,
  LockingBytecodeType,
} from '@bitauth/libauth';
import delay from 'delay';
import {
  AbiFunction,
  hash160,
  hash256,
  placeholder,
  Script,
  scriptToBytecode,
} from '@cashscript/utils';
import {
  Utxo,
  Output,
  Recipient,
  TokenDetails,
  isSignableUtxo,
  TransactionDetails,
} from './interfaces.js';
import {
  meep,
  createInputScript,
  getInputSize,
  createOpReturnOutput,
  getTxSizeWithoutInputs,
  getPreimageSize,
  buildError,
  createSighashPreimage,
  validateRecipient,
  utxoComparator,
  cashScriptOutputToLibauthOutput,
  calculateDust,
  getOutputSize,
} from './utils.js';
import NetworkProvider from './network/NetworkProvider.js';
import SignatureTemplate from './SignatureTemplate.js';

const bip68 = await import('bip68');

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
    private address: string,
    private provider: NetworkProvider,
    private redeemScript: Script,
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

  experimentalFromP2PKH(input: Utxo, template: SignatureTemplate): this;
  experimentalFromP2PKH(inputs: Utxo[], template: SignatureTemplate): this;

  experimentalFromP2PKH(inputOrInputs: Utxo | Utxo[], template: SignatureTemplate): this {
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
      toOrOutputs.forEach(validateRecipient);
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
    this.locktime = this.locktime ?? await this.provider.getBlockHeight();
    await this.setInputsAndOutputs();

    const bytecode = scriptToBytecode(this.redeemScript);

    const inputs = this.inputs.map((utxo) => ({
      outpointIndex: utxo.vout,
      outpointTransactionHash: hexToBin(utxo.txid),
      sequenceNumber: this.sequence,
      unlockingBytecode: new Uint8Array(),
    }));

    const outputs = this.outputs.map(cashScriptOutputToLibauthOutput);

    const transaction = {
      inputs,
      locktime: this.locktime,
      outputs,
      version: 2,
    };

    const inputScripts: Uint8Array[] = [];

    this.inputs.forEach((utxo, i) => {
      // UTXO's with signature templates are signed using P2PKH
      if (isSignableUtxo(utxo)) {
        const pubkey = utxo.template.getPublicKey();
        const pubkeyHash = hash160(pubkey);

        const addressContents = { payload: pubkeyHash, type: LockingBytecodeType.p2pkh };
        const prevOutScript = addressContentsToLockingBytecode(addressContents);

        const hashtype = utxo.template.getHashType();
        const preimage = createSighashPreimage(transaction, this.inputs, i, prevOutScript, hashtype);
        const sighash = hash256(preimage);

        const signature = utxo.template.generateSignature(sighash);

        const inputScript = scriptToBytecode([signature, pubkey]);
        inputScripts.push(inputScript);

        return;
      }

      let covenantHashType = -1;
      const completeArgs = this.args.map((arg) => {
        if (!(arg instanceof SignatureTemplate)) return arg;

        // First signature is used for sighash preimage (maybe not the best way)
        if (covenantHashType < 0) covenantHashType = arg.getHashType();

        const preimage = createSighashPreimage(transaction, this.inputs, i, bytecode, arg.getHashType());
        const sighash = hash256(preimage);

        return arg.generateSignature(sighash);
      });

      const preimage = this.abiFunction.covenant
        ? createSighashPreimage(transaction, this.inputs, i, bytecode, covenantHashType)
        : undefined;

      const inputScript = createInputScript(
        this.redeemScript, completeArgs, this.selector, preimage,
      );

      inputScripts.push(inputScript);
    });

    inputScripts.forEach((script, i) => {
      transaction.inputs[i].unlockingBytecode = script;
    });

    return binToHex(encodeTransaction(transaction));
  }

  async send(): Promise<TransactionDetails>;
  async send(raw: true): Promise<string>;

  async send(raw?: true): Promise<TransactionDetails | string> {
    const tx = await this.build();
    try {
      const txid = await this.provider.sendRawTransaction(tx);
      return raw ? await this.getTxDetails(txid, raw) : await this.getTxDetails(txid);
    } catch (e: any) {
      const reason = e.error ?? e.message;
      throw buildError(reason, meep(tx, this.inputs, this.redeemScript));
    }
  }

  private async getTxDetails(txid: string): Promise<TransactionDetails>
  private async getTxDetails(txid: string, raw: true): Promise<string>;

  private async getTxDetails(txid: string, raw?: true): Promise<TransactionDetails | string> {
    for (let retries = 0; retries < 1200; retries += 1) {
      await delay(500);
      try {
        const hex = await this.provider.getRawTransaction(txid);

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
    return meep(tx, this.inputs, this.redeemScript);
  }

  private async setInputsAndOutputs(): Promise<void> {
    if (this.outputs.length === 0) {
      throw Error('Attempted to build a transaction without outputs');
    }

    // Construct object with total output of fungible tokens by tokenId
    const netBalanceTokens: Record<string, bigint> = {};
    // Construct list with all nfts in inputs
    const listNftsInputs = [];
    // If inputs are manually selected, add their tokens to balance
    for (const input of this.inputs) {
      if (!input.token) continue;
      const tokenCategory = input.token.category;
      if (!netBalanceTokens[tokenCategory]) {
        netBalanceTokens[tokenCategory] = input.token.amount;
      } else {
        netBalanceTokens[tokenCategory] += input.token.amount;
      }
      if (input.token.nft) {
        listNftsInputs.push({ ...input.token.nft, category: input.token.category });
      }
    }
    // Construct list with all nfts in outputs
    let listNftsOutputs = [];
    // Subtract all token outputs from the token balances
    for (const output of this.outputs) {
      if (!output.token) continue;
      const tokenCategory = output.token.category;
      if (!netBalanceTokens[tokenCategory]) {
        netBalanceTokens[tokenCategory] = -output.token.amount;
      } else {
        netBalanceTokens[tokenCategory] -= output.token.amount;
      }
      if (output.token.nft) {
        listNftsOutputs.push({ ...output.token.nft, category: output.token.category });
      }
    }
    // If inputs are manually provided, check token balances
    if (this.inputs.length > 0) {
      for (const [category, balance] of Object.entries(netBalanceTokens)) {
        // Add token change outputs if applicable
        if (this.tokenChange && balance > 0) {
          const tokenDetails: TokenDetails = {
            category,
            amount: balance,
          };
          const tokenChangeOutput = { to: this.address, amount: BigInt(1000), token: tokenDetails };
          this.outputs.push(tokenChangeOutput);
        }
        // Throw error when token balance is insufficient
        if (balance < 0) {
          throw new Error(`Insufficient token balance for token with category ${category}.`);
        }
      }
      // Compare nfts in- and outputs, check if inputs have nfts corresponding to outputs
      // Keep list of nfts in inputs without matching output
      // First check immutable nfts, then mutable & minting nfts together
      // this is so the mutable nft in input does not get match to an output nft corresponding to an immutable nft in the inputs
      let unusedNfts = listNftsInputs;
      for (const nftInput of listNftsInputs) {
        if (nftInput.capability === 'none') {
          for (let i = 0; i < listNftsOutputs.length; i++) {
            // Deep equality check token objects
            if (JSON.stringify(listNftsOutputs[i]) === JSON.stringify(nftInput)) {
              listNftsOutputs.splice(i, 1);
              unusedNfts = unusedNfts.filter((nft) => nft !== nftInput);
              break;
            }
          }
        }
      }
      for (const nftInput of listNftsInputs) {
        if (nftInput.capability === 'minting') {
          const newListNftsOutputs: {
            category: string;
            capability: 'none' | 'mutable' | 'minting';
            commitment: string;
          }[] = listNftsOutputs.filter((nftOutput) => nftOutput.category !== nftInput.category);
          if (newListNftsOutputs !== listNftsOutputs) {
            unusedNfts = unusedNfts.filter((nft) => nft !== nftInput);
            listNftsOutputs = newListNftsOutputs;
          }
        }
        if (nftInput.capability === 'mutable') {
          for (let i = 0; i < listNftsOutputs.length; i++) {
            if (listNftsOutputs[i].category === nftInput.category) {
              listNftsOutputs.splice(i, 1);
              unusedNfts = unusedNfts.filter((nft) => nft !== nftInput);
              break;
            }
          }
        }
      }
      if (listNftsOutputs.length !== 0) {
        throw new Error('Nfts in outputs don\'t have corresponding nfts in inputs!');
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
          const nftChangeOutput = { to: this.address, amount: BigInt(1000), token: tokenDetails };
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
      ? placeholder(getPreimageSize(scriptToBytecode(this.redeemScript)))
      : undefined;

    // Create a placeholder input script for size calculation using the placeholder
    // arguments and correctly sized placeholder preimage
    const placeholderScript = createInputScript(
      this.redeemScript,
      placeholderArgs,
      this.selector,
      placeholderPreimage,
    );

    // Add one extra byte per input to over-estimate tx-in count
    const inputSize = getInputSize(placeholderScript) + 1;

    // Note that we use the addPrecision function to add "decimal points" to BigInt numbers

    // Calculate amount to send and base fee (excluding additional fees per UTXO)
    let amount = addPrecision(this.outputs.reduce((acc, output) => acc + output.amount, 0n));
    let fee = addPrecision(this.hardcodedFee ?? getTxSizeWithoutInputs(this.outputs) * this.feePerByte);

    // Select and gather UTXOs and calculate fees and available funds
    let satsAvailable = 0n;
    if (this.inputs.length > 0) {
      // If inputs are already defined, the user provided the UTXOs and we perform no further UTXO selection
      if (!this.hardcodedFee) fee += addPrecision(this.inputs.length * inputSize * this.feePerByte);
      satsAvailable = addPrecision(this.inputs.reduce((acc, input) => acc + input.satoshis, 0n));
    } else {
      // If inputs are not defined yet, we retrieve the contract's UTXOs and perform selection
      const utxos = await this.provider.getUtxos(this.address);

      // We sort the UTXOs mainly so there is consistent behaviour between network providers
      // even if they report UTXOs in a different order
      utxos.sort(utxoComparator).reverse();

      for (const utxo of utxos) {
        this.inputs.push(utxo);
        satsAvailable += addPrecision(utxo.satoshis);
        if (!this.hardcodedFee) fee += addPrecision(inputSize * this.feePerByte);
        if (satsAvailable > amount + fee) break;
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
      const changeOutputSize = getOutputSize({ to: this.address, amount: 0n });
      change -= BigInt(changeOutputSize * this.feePerByte);
    }

    // Add a change output if applicable
    const changeOutput = { to: this.address, amount: change };
    if (change >= this.minChange && change >= calculateDust(changeOutput)) {
      this.outputs.push(changeOutput);
    }
  }
}

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
