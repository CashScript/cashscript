import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { Contract, Sig } from 'cashscript';
import path from 'path';
import { PriceOracle } from './PriceOracle';

run();
async function run(): Promise<void> {
  // Initialise BITBOX
  const network = 'testnet';
  const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and owner's keypair
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const owner = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Initialise price oracle with a keypair
  const oracleKeypair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));
  const oracle = new PriceOracle(oracleKeypair);

  // Compile and instantiate HODL Vault
  const HodlVault = Contract.compile(path.join(__dirname, 'hodl_vault.cash'), 'testnet');
  const instance = HodlVault.new(
    bitbox.ECPair.toPublicKey(owner),
    bitbox.ECPair.toPublicKey(oracle.keypair),
    597000,
    30000,
  );

  // Get contract balance & output address + balance
  const contractBalance = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Produce new oracle message and signature
  const oracleMessage = oracle.createMessage(597000, 30000);
  const oracleSignature = oracle.signMessage(oracleMessage);

  // Spend from the vault
  const tx: TxnDetailsResult = await instance.functions
    .spend(new Sig(owner), oracleSignature, oracleMessage)
    .to(instance.address, 1000)
    .send();

  console.log(tx);
}
