import { stringify } from '@bitauth/libauth';
import { BITBOX } from 'bitbox-sdk';
import {
  Contract,
  SignatureTemplate,
  CashCompiler,
  ElectrumNetworkProvider,
  Network,
} from 'cashscript';
import path from 'path';
import { PriceOracle } from './PriceOracle';

run();
async function run(): Promise<void> {
  // Initialise BITBOX
  const bitbox = new BITBOX();

  // Initialise HD node and owner's keypair
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed);

  const owner = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const ownerPk = bitbox.ECPair.toPublicKey(owner);

  // Initialise price oracle with a keypair
  const oracleKeypair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));
  const oraclePk = bitbox.ECPair.toPublicKey(oracleKeypair);
  const oracle = new PriceOracle(oracleKeypair);

  // Compile the HodlVault contract to an artifact object
  const artifact = CashCompiler.compileFile(path.join(__dirname, 'hodl_vault.cash'));

  // Initialise a network provider for network operations on TESTNET
  const provider = new ElectrumNetworkProvider(Network.TESTNET);

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters
  const parameters = [ownerPk, oraclePk, 597000, 30000];
  const contract = new Contract(artifact, parameters, provider);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Produce new oracle message and signature
  const oracleMessage = oracle.createMessage(597000, 30000);
  const oracleSignature = oracle.signMessage(oracleMessage);

  // Spend from the vault
  const tx = await contract.functions
    .spend(new SignatureTemplate(owner), oracleSignature, oracleMessage)
    .to(contract.address, 1000)
    .send();

  console.log(stringify(tx));
}
