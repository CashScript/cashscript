import { BITBOX } from 'bitbox-sdk';
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
  console.log("Player UTXOs", playerUtxo);
}
