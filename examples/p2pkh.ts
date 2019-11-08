import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import { Contract, Instance, Sig } from 'cashscript';
import * as path from 'path';

run();
export async function run(): Promise<void> {
  // Initialise BITBOX
  const network: string = 'testnet';
  const bitbox: BITBOX = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

  // Initialise HD node and alice's keypair
  const rootSeed: Buffer = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network);
  const alice: ECPair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

  // Derive alice's public key and public key hash
  const alicePk: Buffer = bitbox.ECPair.toPublicKey(alice);
  const alicePkh: Buffer = bitbox.Crypto.hash160(alicePk);

  // Compile the P2PKH Cash Contract
  const P2PKH: Contract = Contract.compile(path.join(__dirname, 'p2pkh.cash'), network);

  // Instantiate a new P2PKH contract with constructor arguments: { pkh: alicePkh }
  const instance: Instance = P2PKH.new(alicePkh);

  // Get contract balance & output address + balance
  const contractBalance: number = await instance.getBalance();
  console.log('contract address:', instance.address);
  console.log('contract balance:', contractBalance);

  // Call the spend function with alice's signature + pk
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const tx: TxnDetailsResult = await instance.functions.spend(alicePk, new Sig(alice))
    .send(instance.address, 10000);
  console.log('transaction details:', tx);

  // Call the spend function with alice's signature + pk
  // And use it to send two outputs of 0. 000 150 00 BCH back to the contract's address
  const tx2: TxnDetailsResult = await instance.functions.spend(alicePk, new Sig(alice))
    .send([
      { to: instance.address, amount: 15000 },
      { to: instance.address, amount: 15000 },
    ]);
  console.log('transaction details:', tx2);
}
