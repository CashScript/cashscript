import { BITBOX } from 'bitbox-sdk';
import { AddressUtxoResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import { Contract, Instance, Sig } from 'cashscript';
import * as path from 'path';

run();
export async function run(): Promise<void> {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and keypairs
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const playerPk: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const challengerPk: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));
  const oraclePk: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 2));

  // Get addresses
  const playerAddr = bitbox.ECPair.toCashAddress(playerPk);
  const challengerAddr = bitbox.ECPair.toCashAddress(challengerPk);
  const oracleAddr = bitbox.ECPair.toCashAddress(oraclePk);

  // Debug
  console.log("Player address:", playerAddr);
  console.log("Challenger address:", challengerAddr);
  console.log("Oracle address:", oracleAddr);

  // Compile and instantiate contract
  const Prophet: Contract = Contract.compile(
    path.join(__dirname, 'prophet.cash'),
    'testnet'
  );

  const instance: Instance = Prophet.new(
    bitbox.ECPair.toPublicKey(playerPk),
    bitbox.ECPair.toPublicKey(challengerPk),
    bitbox.ECPair.toPublicKey(oraclePk),
  );

  // Get contract balance & output address + balance
  const contractBalance: number = await instance.getBalance();
  console.log('Contract address:', instance.address);
  console.log('Contract balance:', contractBalance);

  // Get UTXO's of players
  const playerUtxo = await bitbox.Address.utxo(playerAddr);
  const playerUtxos = playerUtxo as AddressUtxoResult;
  const playerLastUtxo = playerUtxos.utxos[0];
  console.log("Player's last UTXO", playerLastUtxo);

  // get byte count to calculate fee. paying 1.2 sat/byte
  const satoshisPerByte = 1.0;
  const byteCount = bitbox.BitcoinCash.getByteCount(
    { P2PKH: 1 },
    { P2PKH: 2 }
  )
  const txFee = Math.floor(satoshisPerByte * byteCount);
  const remainder = playerLastUtxo.satoshis - 10 - txFee;

  // Build transaction & send
  let redeemScript;
  const transactionBuilder = new bitbox.TransactionBuilder('testnet');
  transactionBuilder.addInput(playerLastUtxo.txid, playerLastUtxo.vout);
  transactionBuilder.addOutput(instance.address, 10);
  transactionBuilder.addOutput(playerAddr, remainder);
  transactionBuilder.sign(
    0,
    playerPk,
    redeemScript,
    transactionBuilder.hashTypes.SIGHASH_ALL,
    playerLastUtxo.satoshis
  );

  const tx = transactionBuilder.build();
  const hex = tx.toHex()
  console.log('Tx hex:', hex);

  // Broadcast
  const txId = await bitbox.RawTransactions.sendRawTransaction([hex])
  console.log('Tx ID:', txId);
}
