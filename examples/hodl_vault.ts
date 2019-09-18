import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import { Contract, Instance, Sig } from 'cashscript';
import * as path from 'path';
import { PriceOracle } from './PriceOracle';

run();
export async function run(): Promise<void> {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and owner's keypair
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const owner: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Initialise price oracle with a keypair
  const oracle: PriceOracle = new PriceOracle(
    bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1)),
  );

  // Compile and instantiate HODL Vault
  const HodlVault: Contract = Contract.fromCashFile(path.join(__dirname, 'hodl_vault.cash'), 'testnet');
  const instance: Instance = HodlVault.new(
    bitbox.ECPair.toPublicKey(owner),
    bitbox.ECPair.toPublicKey(oracle.keypair),
    597000,
    30000,
  );

  // Get contract balance & output address + balance
  const contractBalance: number = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Produce new oracle message and signature
  const oracleMessage: Buffer = oracle.createMessage(597000, 30000);
  const oracleSignature: Buffer = oracle.signMessage(oracleMessage);

  // Spend from the vault
  const tx: TxnDetailsResult = await instance.functions
    .spend(new Sig(owner, 0x01), oracleSignature, oracleMessage)
    .send(instance.address, 1000);

  console.log(tx);
}
