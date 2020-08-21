const { BITBOX } = require('bitbox-sdk');
const { stringify } = require('@bitauth/libauth');
const { Contract, SignatureTemplate, Network, CashCompiler, ElectrumNetworkProvider } = require('cashscript');
const path = require('path');

run();
async function run() {
  // Initialise BITBOX
  const bitbox = new BITBOX();

  // Initialise HD node and alice's keypair
  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed);
  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Derive alice's public key and public key hash
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const alicePkh = bitbox.Crypto.hash160(alicePk);

  // Compile the P2PKH contract to an artifact object
  const artifact = CashCompiler.compileFile(path.join(__dirname, 'p2pkh.cash'));

  // Initialise a network provider for network operations on TESTNET
  const provider = new ElectrumNetworkProvider(Network.TESTNET);

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: alicePkh)
  const contract = new Contract(artifact, [alicePkh], provider);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Call the spend function with alice's signature + pk
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const tx = await contract.functions
    .spend(alicePk, new SignatureTemplate(alice))
    .to(contract.address, 10000)
    .send();

  console.log('transaction details:', stringify(tx));

  // Call the spend function with alice's signature + pk
  // And use it to send two outputs of 0. 000 150 00 BCH back to the contract's address
  const tx2 = await contract.functions
    .spend(alicePk, new SignatureTemplate(alice))
    .to(contract.address, 15000)
    .to(contract.address, 15000)
    .send();

  console.log('transaction details:', stringify(tx2));
}
