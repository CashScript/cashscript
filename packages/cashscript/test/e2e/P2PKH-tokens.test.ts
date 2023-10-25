import { Contract, SignatureTemplate, ElectrumNetworkProvider } from '../../src/index.js';
import {
  alicePkh,
  alicePub,
  alicePriv,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { Network, TokenDetails, Utxo } from '../../src/interfaces.js';
import artifact from '../fixture/p2pkh.json' assert { type: "json" };

describe('P2PKH-tokens', () => {
  let p2pkhInstance: Contract;

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    p2pkhInstance = new Contract(artifact, [alicePkh], { provider });
    console.log(p2pkhInstance.tokenAddress);
  });

  describe('send (tokens)', () => {
    it('can send fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

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
      const [nftUtxo1, nftUtxo2] = contractUtxos.filter(isNftUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (!nftUtxo1 || !nftUtxo2) {
        throw new Error('Less than two token UTXOs found with an NFT');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;

      // We ran into a bug with the order of the properties, so we re-order the properties here to test that it works
      const reorderedToken1 = {
        nft: {
          commitment: nftUtxo1.token!.nft!.commitment,
          capability: nftUtxo1.token!.nft!.capability,
        },
        category: nftUtxo1.token!.category,
        amount: 0n,
      };

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(nftUtxo1)
        .from(nftUtxo2)
        .to(to, amount, reorderedToken1)
        .to(to, amount, nftUtxo2.token)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(
        expect.arrayContaining([{ to, amount, token: nftUtxo1.token }, { to, amount, token: nftUtxo2.token }]),
      );
    });

    it('can automatically select UTXOs for fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);

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
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

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

    it('can create new token categories', async () => {
      const to = p2pkhInstance.tokenAddress;

      // Send a transaction to be used as the genesis UTXO
      await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .to(to, 10_000n)
        .send();

      const contractUtxos = await p2pkhInstance.getUtxos();
      const [genesisUtxo] = contractUtxos.filter((utxo) => utxo.vout === 0 && utxo.satoshis > 2000);

      if (!genesisUtxo) {
        throw new Error('No possible genesis UTXO found');
      }

      const amount = 1000n;
      const token: TokenDetails = {
        amount: 1000n,
        category: genesisUtxo.txid,
        nft: {
          capability: 'none',
          commitment: '0000000000',
        },
      };

      const tx = await p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(genesisUtxo)
        .to(to, amount, token)
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

    it('adds automatic change output for NFTs', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const nftUtxo = contractUtxos.find(isNftUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

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
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

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
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

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
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...tokenUtxo.token!, category: '0000000000000000000000000000000000000000000000000000000000000000' };

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
      const nftUtxo = contractUtxos.find(isNftUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (!nftUtxo) {
        throw new Error('No token UTXO found with an NFT');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...nftUtxo.token!, category: '0000000000000000000000000000000000000000000000000000000000000000' };

      const txPromise = p2pkhInstance.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(nonTokenUtxos)
        .from(nftUtxo)
        .to(to, amount, token)
        .send();

      await expect(txPromise).rejects.toThrow(/NFT output with token category .* does not have corresponding input/);
    });

    it.todo('can mint new NFTs if the NFT has minting capabilities');
    it.todo('can change the NFT commitment if the NFT has mutable capabilities');
    // TODO: Add more edge case tests for NFTs (minting, mutable, change outputs with multiple kinds of NFTs)
  });
});

// We don't include UTXOs that contain BOTH fungible and non-fungible tokens
const isFungibleTokenUtxo = (utxo: Utxo): boolean => (
  utxo.token !== undefined && utxo.token.amount > 0n && utxo.token.nft === undefined
);

// We don't include UTXOs that contain BOTH fungible and non-fungible tokens
const isNftUtxo = (utxo: Utxo): boolean => (
  utxo.token !== undefined && utxo.token.amount === 0n && utxo.token.nft !== undefined
);

const isNonTokenUtxo = (utxo: Utxo): boolean => utxo.token === undefined;
