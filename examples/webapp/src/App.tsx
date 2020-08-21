import './App.css'
import 'bootstrap/dist/css/bootstrap.css'

import React from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { BITBOX, Crypto } from 'bitbox-sdk'
import { ECPair } from 'bitcoincashjs-lib'
import { CashCompiler, ElectrumNetworkProvider, Contract, Network, SignatureTemplate } from 'cashscript'

interface AppState {
  contract?: Contract
  balance?: number
  seed: string
  keypair?: ECPair
  loading: boolean
  receiveAddress: string
  transactionLink?: string
}


class App extends React.Component<{}, AppState> {
  state: AppState = {
    seed: 'CashScript',
    loading: false,
    receiveAddress: 'bchtest:pzfsp649y00eay9mm3ky63ln72v3h6tx6gul8mlg93',
  }

  async getContractSource() {
    const contractFetch = await fetch('p2pkh.cash')
    const contractSource = await contractFetch.text()
    return contractSource
  }

  async compileContract(seed: string) {
    this.setState({ loading: true })
    // Fetch CashFile
    const source = await this.getContractSource()

    // Initialise BITBOX
    const bitbox = new BITBOX()

    // Initialise HD node and alice's keypair
    const rootSeed = bitbox.Mnemonic.toSeed(seed)
    const hdNode = bitbox.HDNode.fromSeed(rootSeed)
    const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0))

    // Derive alice's public key and public key hash
    const alicePk = bitbox.ECPair.toPublicKey(alice)
    const alicePkh = bitbox.Crypto.hash160(alicePk)

    // Compile the P2PKH contract to an artifact object
    const artifact = CashCompiler.compileString(source)

    // Initialise a network provider for network operations on TESTNET
    const provider = new ElectrumNetworkProvider(Network.TESTNET)

    // Instantiate a new contract using the compiled artifact and network provider
    // AND providing the constructor parameters (pkh: alicePkh)
    const contract = new Contract(artifact, [alicePkh], provider)

    // Retrieve contract balance
    const balance = await contract.getBalance()

    this.setState({ contract, balance, keypair: alice, loading: false })
  }

  async sendTestTransaction(receiveAddress: string) {
    const { contract, keypair } = this.state
    if (!contract || !keypair) {
      alert('Please compile the contract first')
      return
    }

    // Send a transaction using the stored keypair (alice), passing true as the send()
    // function's "raw" parameter to receive the raw hex.
    const txHex = await contract.functions
      .spend(keypair.getPublicKeyBuffer(), new SignatureTemplate(keypair))
      .to(receiveAddress, 1000)
      .send(true)

    const txid = new Crypto().hash256(Buffer.from(txHex, 'hex')).reverse().toString('hex')

    const transactionLink = `https://explorer.bitcoin.com/tbch/tx/${txid}`

    this.setState({ transactionLink })
  }

  updateSeed(seed: string) {
    this.setState({ seed })
  }

  updateReceiveAddress(receiveAddress: string) {
    this.setState({ receiveAddress })
  }

  render() {
    return (
      <Container fluid className="App">
        <Row className="Header">
          <Col></Col>
          <Col>P2PKH-in-P2SH CashScript Example Contract</Col>
          <Col></Col>
        </Row>
        <Row>
          <Col></Col>
          <Col md="6">
            <Form.Group className="form">
              <Form.Label>Seed phrase</Form.Label>
              <Form.Control value={this.state.seed || ''} onChange={(event) => this.updateSeed(event.target.value)}></Form.Control>
              <Button onClick={() => this.compileContract(this.state.seed)}>Compile and instantiate contract</Button>
            </Form.Group>


            {this.state.contract && <div>Contract address: {this.state.contract.address}</div>}
            {this.state.balance  && <div>Contract balance: {this.state.balance}</div>}

            <Form.Group className="form">
              <Form.Label>Receive address</Form.Label>
              <Form.Control value={this.state.receiveAddress || ''} onChange={(event) => this.updateReceiveAddress(event.target.value)}></Form.Control>
              <Button onClick={() => this.sendTestTransaction(this.state.receiveAddress)}>Send test transaction</Button>
            </Form.Group>
          </Col>
          <Col></Col>
        </Row>
        <Row>
          <Col></Col>
          <Col>
            {this.state.transactionLink && <a href={this.state.transactionLink}>{this.state.transactionLink}</a>}
          </Col>
          <Col></Col>
        </Row>
      </Container>
    )
  }
}

export default App
