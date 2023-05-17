import { stringify } from '@bitauth/libauth';
import { compileString } from 'cashc';
import {
  Contract,
  ElectrumNetworkProvider,
  Network,
  SignatureTemplate,
} from 'cashscript';
import { bobAddress, bobPriv } from './common.js';

const createContract = (network: Network = Network.REGTEST): Contract => {
  const script = `
  contract test(int nonce) {
    function test() {
      require(nonce == nonce);
      int minerFee = 800;
      int tokenValue = 1000;
      int sentValue = tx.inputs[1].value;
      int changeValue = sentValue - minerFee - tokenValue;

      require(tx.inputs.length == 2);

      // handle change
      if (changeValue < 546) {
        // discard dust change, whatever dust goes to miner fee
        // so in this case total fee = 800 + dust
        require(tx.outputs.length == 2);
      } else {
        // allow change output as outputs[2]
        require(tx.outputs.length == 3);
        // this forces the fee to be exactly 800
        require(tx.outputs[2].value == changeValue);
        // Require that the change output does not mint any NFTs
        require(tx.outputs[2].tokenCategory == 0x);
        // have the change address be the same as funding address
        bytes changeBytecode = tx.inputs[1].lockingBytecode;
        require(tx.outputs[2].lockingBytecode == changeBytecode);
      }
    }
  }
  `;

  const artifact = compileString(script);
  const nonce = 123456n;

  return new Contract(
    artifact,
    [nonce],
    { provider: new ElectrumNetworkProvider(network) },
  );
};

const minerFee = 800n;
const tokenValue = 1000n;

const contract = createContract(Network.CHIPNET);

console.log('contract address', contract.tokenAddress);
console.log('bob address', bobAddress);

const tokenCategory = 'dc92b5d83b2d2fc0b20a135664367099a0d87dcdd5e1b40504b583fdc445839b';

const contractUtxos = await contract.getUtxos();
const mintingUtxo = contractUtxos.find((utxo) => utxo.token?.category === tokenCategory);

const bobUtxos = await new ElectrumNetworkProvider(Network.CHIPNET).getUtxos(bobAddress);
const bobUtxo = bobUtxos.find((utxo) => utxo.satoshis >= 10000n);
// console.log('bob', bobUtxo)

if (!mintingUtxo || !bobUtxo) process.exit(1);

const tx = await contract.functions.test()
  .from(mintingUtxo)
  .fromP2PKH(bobUtxo, new SignatureTemplate(bobPriv))
  .to([
    {
      to: contract.tokenAddress,
      amount: mintingUtxo.satoshis,
      token: {
        category: tokenCategory,
        amount: 0n,
        nft: {
          capability: 'minting',
          commitment: 'beef',
        },
      },
    },
    {
      to: bobAddress,
      amount: tokenValue,
      token: {
        category: tokenCategory,
        amount: 0n,
        nft: {
          capability: 'none',
          commitment: 'deadbeef',
        },
      },
    },
    {
      to: bobAddress,
      amount: bobUtxo.satoshis - tokenValue - minerFee,
    },
  ])
  .withoutChange()
  // .withoutTokenChange()
  // .withHardcodedFee(BigInt(minerFee))
  .send();

console.log(stringify(tx));
