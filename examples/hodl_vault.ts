import { BITBOX, Script, Crypto } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import { ECPair, HDNode } from 'bitcoincashjs-lib';
import { Contract, Instance, Sig } from 'cashscript';
import * as path from 'path';

class PriceOracle {
  constructor(public keypair: ECPair) {}

  // Encode a blockHeight and bchUsdPrice into a byte sequence of 8 bytes (4 bytes per value)
  createMessage(blockHeight: number, bchUsdPrice: number): Buffer {
    const lhs: Buffer = Buffer.alloc(4, 0);
    const rhs: Buffer = Buffer.alloc(4, 0);
    new Script().encodeNumber(blockHeight).copy(lhs);
    new Script().encodeNumber(bchUsdPrice).copy(rhs);
    return Buffer.concat([lhs, rhs]);
  }

  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(new Crypto().sha256(message)).toDER();
  }
}

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
  const oracle: PriceOracle = new PriceOracle(bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1)));

  // Compile and instantiate HODL Vault
  const HodlVault: Contract = Contract.fromCashFile(path.join(__dirname, 'hodl_vault.cash'), 'testnet');
  const instance: Instance = HodlVault.new(
    bitbox.ECPair.toPublicKey(owner),
    bitbox.ECPair.toPublicKey(oracle.keypair),
    597000,
    30000,
  );

  // Produce new oracle message and signature
  const oracleMessage: Buffer = oracle.createMessage(597000, 30000);
  const oracleSignature: Buffer = oracle.signMessage(oracleMessage);

  // Spend from the vault
  const tx: TxnDetailsResult = await instance.functions
    .spend(new Sig(owner, 0x01), oracleSignature, oracleMessage)
    .send(instance.address, 1000);

  console.log(tx);
}
