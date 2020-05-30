import { BITBOX, Crypto } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { Contract, SignatureTemplate } from 'cashscript';
import path from 'path';

class Oracle {
  constructor(public keypair: ECPair) {}

  createMessage(escrowKey: Buffer, actionByte: Buffer): Buffer {
    return Buffer.concat([escrowKey, actionByte]);
  }

  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(new Crypto().sha256(message)).toDER();
  }
}

run();
async function run(): Promise<void> {
  try {
    // Initialise BITBOX
    const network = 'testnet';
    const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

    // Mnemonnic to root seed buffer
    const rootSeed = bitbox.Mnemonic.toSeed('');

    // root seed buffer to master hdnode
    const masterHDNode = bitbox.HDNode.fromSeed(rootSeed, network);

    // alice, bob and arbitrator hdnodes
    const alice = bitbox.HDNode.derivePath(masterHDNode, 'm/0\'');
    const bob = bitbox.HDNode.derivePath(masterHDNode, 'm/1\'');
    const arbitrator = bitbox.HDNode.derivePath(masterHDNode, 'm/2\'');

    // alice, bob and arbitrator keypairs
    const aliceKP = bitbox.HDNode.toKeyPair(alice);
    const bobKP = bitbox.HDNode.toKeyPair(bob);
    const arbitratorKP = bitbox.HDNode.toKeyPair(arbitrator);

    // alice, bob and arbitrator pubkeys
    const alicePK = bitbox.ECPair.toPublicKey(aliceKP);
    const bobPK = bitbox.ECPair.toPublicKey(bobKP);
    const arbitratorPK = bitbox.ECPair.toPublicKey(arbitratorKP);

    // alice, bob and arbitrator pubkeyhashes
    const alicePKH = bitbox.Crypto.hash160(alicePK);
    const bobPKH = bitbox.Crypto.hash160(bobPK);
    const arbitratorPKH = bitbox.Crypto.hash160(arbitratorPK);

    // Initialize oracle with Alice's keypair
    const oracle = new Oracle(aliceKP);

    // Compile and instantiate Escrow contract
    const Escrow = Contract.compile(path.join(__dirname, 'Escrow.cash'), network);
    const escrowKey = Buffer.from('01', 'hex');
    const actionByte = Buffer.from('01', 'hex');
    const instance = Escrow.new(alicePKH, bobPKH, arbitratorPKH/* , escrowKey */);
    Escrow.export(path.join(__dirname, 'Escrow.json'));

    // Get contract balance & output address + balance
    const contractBalance = await instance.getBalance();
    console.log('contract address:', instance.address);
    console.log('contract balance:', contractBalance);

    // Produce new oracle message and signature
    const oracleMessage = oracle.createMessage(escrowKey, actionByte);
    const oracleSig = oracle.signMessage(oracleMessage);

    // address to send funds to
    const address = 'bchtest:qpg8pv6zj0l8hr56sh6tn65ufmcfrnswxg36t63jpr';

    const tx = await instance.functions
      .spend(new SignatureTemplate(bobKP), bobPK, oracleMessage, oracleSig, alicePK, actionByte)
      .to(address, 1000)
      .send();
    console.log(tx);
  } catch (error) {
    console.log(error);
  }
}
