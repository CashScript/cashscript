import React, { useState } from 'react';
import { BITBOX } from 'bitbox-sdk';
import { Contract, Sig } from 'cashscript';
import './App.css';

function App() {
  async function spend(instance, keyPair, address, amount, setResult, setLoading) {
    console.log(address);
    console.log(amount);
    const bitbox = new BITBOX({ restURL: network === 'testnet' ? 'https://trest.bitcoin.com/v2/' : 'https://rest.bitcoin.com/v2/' });

    setLoading(true);
    const result = {};
    const alicePk = bitbox.ECPair.toPublicKey(keyPair);

    // Call the spend function with alice's signature + pk
    // And use it to send 0. 000 100 00 BCH back to the contract's address
    const tx = await instance.functions
            .spend(alicePk, new Sig(keyPair))
            .to(address, Number(amount))
            .send();
    result.tx = tx;
    setResult(result);
    setLoading(false);
  }

  async function compileAndInstantiate(setInstance, setKeyPair, setLoading, seed, network) {
    setLoading(true);
    // Fetch CashFile
    const cashFileFetch = await fetch('p2pkh.cash');
    const cashFile = await cashFileFetch.text();
    console.log(cashFile);

    // Initialise BITBOX
    const bitbox = new BITBOX({ restURL: network === 'testnet' ? 'https://trest.bitcoin.com/v2/' : 'https://rest.bitcoin.com/v2/' });

    // Initialise HD node and alice's keypair
    const rootSeed = bitbox.Mnemonic.toSeed(seed);
    const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
    const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
    setKeyPair(alice);

    // Derive alice's public key and public key hash
    const alicePk = bitbox.ECPair.toPublicKey(alice);
    const alicePkh = bitbox.Crypto.hash160(alicePk);

    // Compile the P2PKH Cash Contract
    const P2PKH = Contract.compile(cashFile, network);

    // Instantiate a new P2PKH contract with constructor arguments: { pkh: alicePkh }
    const instance = P2PKH.new(alicePkh);
    // Get contract balance & output address + balance
    let contractBalance;
    try {
      contractBalance = await instance.getBalance();
    } catch(e) {
      console.log(e);
    }

    instance.balance = contractBalance;
    setInstance(instance);
    setLoading(false);
  }

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState('CashScript');
  const [network, setNetwork] = useState('testnet');
  const [instance, setInstance] = useState(null);
  const [address, setAddress] = useState(null);
  const [amount, setAmount] = useState(null);
  const [keyPair, setKeyPair] = useState();

  return (
    <div className="App">
      <h1>CashScript P2PKH Example</h1>
      <label>Network</label>
      <select selected={network} onChange={(e) => setNetwork(e.target.value)}>
        <option value="testnet">testnet</option>
        <option value="mainnet">mainnet</option>
      </select>
      <label>Seed Words (caution!)</label>
      <textarea onChange={(e) => setSeed(e.target.value)}>{seed}</textarea>
      <button onClick={() => compileAndInstantiate(setInstance, setKeyPair, setLoading, seed, network)}>Compile and Instantiate Contract</button>
      <label>Amount to spend from Contract</label>
      <input type="number" onChange={(e) => setAmount(e.target.value)} />
      <label>Address to send satoshis from Contract</label>
      <input type="text" onChange={(e) => setAddress(e.target.value)} />
      <button onClick={() => spend(instance, keyPair, address, amount, setResult, setLoading)}>Run Contract</button>
      {loading && <p>Loading...</p>}
      {!loading && instance && <div>
        <p>Contract Address: {instance.address}</p>
        <p>Contract Balance: {instance.balance}</p>
      </div>}
      {!loading && result && result.tx && <div>
        <p><a target="_blank" rel="noopener noreferrer" href={`https://explorer.bitcoin.com/tbch/tx/${result.tx.txid}`}>Transaction Details</a></p>
      </div>}
    </div>
  );
}

export default App;
