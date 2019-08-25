import { BITBOX, Crypto } from "bitbox-sdk"
import { TxnDetailsResult } from "bitcoin-com-rest"
import { ECPair, HDNode } from "bitcoincashjs-lib"
import { Contract, Instance, Sig } from "cashscript"
import * as path from "path"

class Oracle {
  constructor(public keypair: ECPair) {}

  createMessage(escrowKey: Buffer, actionByte: Buffer): Buffer {
    return Buffer.concat([escrowKey, actionByte])
  }

  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(new Crypto().sha256(message)).toDER()
  }
}

run()
export async function run(): Promise<void> {
  try {
    // Initialise BITBOX
    const network: string = "testnet"
    const bitbox: BITBOX = new BITBOX({
      restURL: "https://trest.bitcoin.com/v2/"
    })

    // Mnemonnic to root seed buffer
    const rootSeed: Buffer = bitbox.Mnemonic.toSeed("")

    // root seed buffer to master hdnode
    const masterHDNode: HDNode = bitbox.HDNode.fromSeed(rootSeed, network)

    // alice, bob, arbitrator and oracle hdnodes
    const alice: HDNode = bitbox.HDNode.derivePath(masterHDNode, "m/0'")
    const bob: HDNode = bitbox.HDNode.derivePath(masterHDNode, "m/1'")
    const arbitrator: HDNode = bitbox.HDNode.derivePath(masterHDNode, "m/2'")
    const oracleNode: HDNode = bitbox.HDNode.derivePath(masterHDNode, "m/3'")

    // alice, bob, arbitrator and oracle keypairs
    const aliceKP: ECPair = bitbox.HDNode.toKeyPair(alice)
    const bobKP: ECPair = bitbox.HDNode.toKeyPair(bob)
    const arbitratorKP: ECPair = bitbox.HDNode.toKeyPair(arbitrator)
    const oracleKP: ECPair = bitbox.HDNode.toKeyPair(oracleNode)

    // alice, bob, arbitrator and oracle pubkeys
    const alicePK: Buffer = bitbox.ECPair.toPublicKey(aliceKP)
    const bobPK: Buffer = bitbox.ECPair.toPublicKey(bobKP)
    const arbitratorPK: Buffer = bitbox.ECPair.toPublicKey(arbitratorKP)
    const oraclePK: Buffer = bitbox.ECPair.toPublicKey(oracleKP)

    // alice, bob, arbitrator and oracle pubkeyhashes
    const alicePKH: Buffer = bitbox.Crypto.hash160(alicePK)
    const bobPKH: Buffer = bitbox.Crypto.hash160(bobPK)
    const arbitratorPKH: Buffer = bitbox.Crypto.hash160(arbitratorPK)
    const oraclePKH: Buffer = bitbox.Crypto.hash160(oraclePK)

    // Initialize oracle with oracle keypair
    const oracle: Oracle = new Oracle(bitbox.HDNode.toKeyPair(alice))

    // Compile and instantiate Escrow contract
    const Escrow: Contract = Contract.fromCashFile(
      path.join(__dirname, "Escrow.cash"),
      network
    )
    let escrowKey: Buffer = Buffer.from("01", "hex")
    let actionByte: Buffer = Buffer.from("01", "hex")
    const instance: Instance = Escrow.new(
      alicePKH,
      bobPKH,
      arbitratorPKH
      //   escrowKey
    )
    Escrow.export(path.join(__dirname, "Escrow.json"))

    // Get contract balance & output address + balance
    const contractBalance: number = await instance.getBalance()
    console.log("contract address:", instance.address)
    console.log("contract balance:", contractBalance)

    // Produce new oracle message and signature
    let oracleMessage: Buffer = oracle.createMessage(escrowKey, actionByte)
    const oracleSignature: Buffer = oracle.signMessage(oracleMessage)

    // address to send funds to
    let addy: string = "bchtest:qpg8pv6zj0l8hr56sh6tn65ufmcfrnswxg36t63jpr"

    const tx: TxnDetailsResult = await instance.functions
      .spend(
        new Sig(bobKP, 0x01),
        bobPK,
        oracleMessage,
        oracleSignature,
        alicePK,
        actionByte
      )
      .send(addy, 1000)
    console.log(tx)
  } catch (error) {
    console.log(error)
  }
}
