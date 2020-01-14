import React, { useState, useEffect } from 'react';
import { BITBOX } from 'bitbox-sdk';
import  { Contract, Sig } from 'cashscript';
import logo from './logo.svg';
import './App.css';

function App() {
    async function run(setResult, setLoading) {
	setLoading(true);
	let cashFile = `
    contract P2PKH(bytes20 pkh) {
      // Require pk to match stored pkh and signature to match
      function spend(pubkey pk, sig s) {
	  require(hash160(pk) == pkh);
	  require(checkSig(s, pk));
      }
  }`
	const result = {};
	// Initialise BITBOX
	const network = 'testnet';
	const bitbox = new BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });

	// Initialise HD node and alice's keypair
	const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
	const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);
	const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

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

	result.contractBalance = contractBalance;
	result.contractAddress = instance.address;

	// Call the spend function with alice's signature + pk
	// And use it to send 0. 000 100 00 BCH back to the contract's address
	const tx = await instance.functions.spend(alicePk, new Sig(alice))
	    .send(instance.address, 10000);
	result.tx = tx;
	// Call the spend function with alice's signature + pk
	// And use it to send two outputs of 0. 000 150 00 BCH back to the contract's address
	const tx2 = await instance.functions.spend(alicePk, new Sig(alice))
    .send([
      { to: instance.address, amount: 15000 },
      { to: instance.address, amount: 15000 },
    ]);
	result.tx2 = tx2;
	console.log(result);
	setLoading(false);
	setResult(result);
	return result;
    }

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    return (
    <div className="App">
	<button onClick={() => run(setResult, setLoading)}>Run Contract</button>
	{loading && <p>Loading...</p>}
	{!loading && result && result.tx && result.tx2 && <div>
	<p><a target="_blank" href={`https://explorer.bitcoin.com/tbch/tx/${result.tx.txid}`}>Transaction 1</a></p>
	<p><a target="_blank" href={`https://explorer.bitcoin.com/tbch/tx/${result.tx2.txid}`}>Transaction 2</a></p>
	</div>}
    </div>
  );
}

export default App;
