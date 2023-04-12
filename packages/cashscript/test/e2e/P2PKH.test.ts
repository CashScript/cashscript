import { binToHex } from '@bitauth/libauth';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src/index.js';
import {
  alicePkh,
  aliceAddress,
  alicePub,
  bobPriv,
  alicePriv,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { Network, Utxo } from '../../src/interfaces.js';
import { createOpReturnOutput, utxoComparator } from '../../src/utils.js';
import { FailedSigCheckError, Reason } from '../../src/Errors.js';
import artifact from '../fixture/p2pkh.json' assert { type: "json" };

describe('P2PKH', () => {
  let p2pkhInstance: Contract;

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    p2pkhInstance = new Contract(artifact, [alicePkh], { provider });
    console.log(p2pkhInstance.tokenAddress);
  });

  describe('send', () => {
    it('should fail when using incorrect function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000n;

      // when
      const txPromise = p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(bobPriv))
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedSigCheckError);
      await expect(txPromise).rejects.toThrow(Reason.SIG_NULLFAIL);
    });

    it('should succeed when using correct function arguments', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 10000n;

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
      expect(tx.txid).toBeDefined();
    });

    it('should fail when not enough satoshis are provided in utxos', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 1000n;
      const utxos = await p2pkhInstance.getUtxos();
      utxos.sort(utxoComparator).reverse();
      const { utxos: gathered } = gatherUtxos(utxos, { amount });
      const failureAmount = gathered.reduce((acc, utxo) => acc + utxo.satoshis, 0n) + 1n;

      // when
      const txPromise = p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(gathered)
        .to(to, failureAmount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow();
    });

    it('should succeed when providing UTXOs', async () => {
      // given
      const to = p2pkhInstance.address;
      const amount = 1000n;
      const utxos = await p2pkhInstance.getUtxos();
      utxos.sort(utxoComparator).reverse();
      const { utxos: gathered } = gatherUtxos(utxos, { amount });

      // when
      const receipt = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(gathered)
        .to(to, amount)
        .send();

      // then
      expect.hasAssertions();
      receipt.inputs.forEach((input) => {
        expect(gathered.find((utxo) => (
          utxo.txid === binToHex(input.outpointTransactionHash)
          && utxo.vout === input.outpointIndex
        ))).toBeTruthy();
      });
    });

    it('can call to() multiple times', async () => {
      // given
      const outputs = [
        { to: p2pkhInstance.address, amount: 10000n },
        { to: p2pkhInstance.address, amount: 20000n },
      ];

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .to(outputs[0].to, outputs[0].amount)
        .to(outputs[1].to, outputs[1].amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can send to list of recipients', async () => {
      // given
      const outputs = [
        { to: p2pkhInstance.address, amount: 10000n },
        { to: p2pkhInstance.address, amount: 20000n },
      ];

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .to(outputs)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining(outputs));
    });

    it('can include OP_RETURN data as an output', async () => {
      // given
      const opReturn = ['0x6d02', 'Hello, World!', '0x01'];
      const to = p2pkhInstance.address;
      const amount = 10000n;

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .to(to, amount)
        .withOpReturn(opReturn)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      const expectedOutputs = [{ to, amount }, createOpReturnOutput(opReturn)];
      expect(txOutputs).toEqual(expect.arrayContaining(expectedOutputs));
    });

    it('can include UTXOs from P2PKH addresses', async () => {
      // given
      const to = aliceAddress;
      const amount = 10000n;

      const contractUtxos = await p2pkhInstance.getUtxos();
      const aliceUtxos = await getAddressUtxos(aliceAddress);

      // when
      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .experimentalFromP2PKH(aliceUtxos[0], new SignatureTemplate(alicePriv))
        .from(contractUtxos[0])
        .experimentalFromP2PKH(aliceUtxos[1], new SignatureTemplate(alicePriv))
        .from(contractUtxos[1])
        .to(to, amount)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });

  describe('send (tokens)', () => {
    it('can send fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.amount > 0);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const { token } = tokenUtxo;

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(tokenUtxo)
        .to(to, amount, token)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

    it('can send NFTs', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const nftUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.nft !== undefined);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!nftUtxo) {
        throw new Error('No token UTXO found with an NFT');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const { token } = nftUtxo;

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(nftUtxo)
        .to(to, amount, token)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

    it('can automatically select UTXOs for fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.amount > 0);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const { token } = tokenUtxo;

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .to(to, amount, token)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

    it('adds automatic change output for fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.amount > 0);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const { token } = tokenUtxo;

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(tokenUtxo)
        .to(to, amount)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

    it('adds automatic change output for NFTs', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const nftUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.nft !== undefined);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!nftUtxo) {
        throw new Error('No token UTXO found with an NFT');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const { token } = nftUtxo;

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(nftUtxo)
        .to(to, amount)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

    it('can disable automatic change output for fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.amount > 0);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...tokenUtxo.token!, amount: tokenUtxo.token!.amount - 1n };

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(tokenUtxo)
        .to(to, amount, token)
        .withoutTokenChange()
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));

      // Check that the change output is not present
      txOutputs.forEach((output) => {
        expect(output.token?.amount).not.toEqual(1n);
      });
    });

    it.todo('can disable automatic change output for NFTs');

    it('should throw an error when trying to send more tokens than the contract has', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.amount > 0);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...tokenUtxo.token!, amount: tokenUtxo.token!.amount + 1n };

      const txPromise = p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(tokenUtxo)
        .to(to, amount, token)
        .send();

      await expect(txPromise).rejects.toThrow(/Insufficient funds for token/);
    });

    it('should throw an error when trying to send a token the contract doesn\'t have', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.amount > 0);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...tokenUtxo.token!, category: '0x0000000000000000000000000000000000000000000000000000000000000000' };

      const txPromise = p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(tokenUtxo)
        .to(to, amount, token)
        .send();

      await expect(txPromise).rejects.toThrow(/Insufficient funds for token/);
    });

    it('should throw an error when trying to send an NFT the contract doesn\'t have', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const nftUtxo = contractUtxos.find((utxo) => utxo.token !== undefined && utxo.token.nft !== undefined);
      const nonTokenUtxos = contractUtxos.filter((utxo) => utxo.token === undefined);

      if (!nftUtxo) {
        throw new Error('No token UTXO found with an NFT');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...nftUtxo.token!, category: '0x0000000000000000000000000000000000000000000000000000000000000000' };

      const txPromise = p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(nftUtxo)
        .to(to, amount, token)
        .send();

      await expect(txPromise).rejects.toThrow(/Nfts in outputs don't have corresponding nfts in inputs/);
    });

    it.todo('can mint new NFTs if the NFT has minting capabilities');
    it.todo('can change the NFT commitment if the NFT has mutable capabilities');
    // TODO: Add more edge case tests for NFTs (minting, mutable, change outputs with multiple kinds of NFTs)
  });
});

async function getAddressUtxos(address: string): Promise<Utxo[]> {
  return new ElectrumNetworkProvider(Network.CHIPNET).getUtxos(address);
}

function gatherUtxos(
  utxos: Utxo[],
  options?: { amount?: bigint, fees?: bigint },
): { utxos: Utxo[], total: bigint } {
  const targetUtxos: Utxo[] = [];
  let total = 0n;

  // 1000 for fees
  const { amount = 0n, fees = 1000n } = options ?? {};

  for (const utxo of utxos) {
    if (total - fees > amount) break;
    total += utxo.satoshis;
    targetUtxos.push(utxo);
  }

  return {
    utxos: targetUtxos,
    total,
  };
}
