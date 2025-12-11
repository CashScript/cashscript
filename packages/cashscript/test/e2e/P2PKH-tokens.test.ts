import { randomUtxo, randomToken, randomNFT } from '../../src/utils.js';
import {
  Contract, SignatureTemplate, ElectrumNetworkProvider, MockNetworkProvider,
  TransactionBuilder,
  NetworkProvider,
} from '../../src/index.js';
import {
  alicePkh,
  alicePub,
  alicePriv,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { Network, TokenDetails, Utxo } from '../../src/interfaces.js';
import artifact from '../fixture/p2pkh.artifact.js';

describe('P2PKH-tokens', () => {
  let p2pkhInstance: Contract<typeof artifact>;
  let provider: NetworkProvider;

  beforeAll(() => {
    provider = process.env.TESTS_USE_CHIPNET
      ? new ElectrumNetworkProvider(Network.CHIPNET)
      : new MockNetworkProvider();

    p2pkhInstance = new Contract(artifact, [alicePkh], { provider });
    console.log(p2pkhInstance.tokenAddress);
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo());
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({ vout: 0 }));
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({
      satoshis: 1000n,
      token: randomToken(),
    }));
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({
      satoshis: 1000n,
      token: randomToken(),
    }));
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({
      satoshis: 1000n,
      token: randomNFT(),
    }));
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({
      satoshis: 1000n,
      token: randomNFT(),
    }));
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({
      satoshis: 1000n,
      token: { ...randomNFT(), ...randomToken() },
    }));
    (provider as any).addUtxo?.(p2pkhInstance.address, randomUtxo({
      satoshis: 1000n,
      token: { ...randomToken(), ...randomNFT() },
    }));
  });

  describe('send (tokens)', () => {
    it('can send fungible tokens', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const fullBchBalance = nonTokenUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n) + tokenUtxo.satoshis;

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const { token } = tokenUtxo;
      const fee = 1000n;
      const changeAmount = fullBchBalance - fee - amount;

      const tx = await new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxos, p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
        .addInput(tokenUtxo, p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
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
      const fee = 1000n;
      const fullBchBalance = nftUtxo1.satoshis + nftUtxo2.satoshis + nonTokenUtxos.reduce(
        (total, utxo) => total + utxo.satoshis, 0n,
      );
      const changeAmount = fullBchBalance - fee - amount;

      const unlocker = p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv));

      const tx = await new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxos, unlocker)
        .addInput(nftUtxo1, unlocker)
        .addInput(nftUtxo2, unlocker)
        .addOutput({ to, amount, token: nftUtxo1.token })
        .addOutput({ to, amount, token: nftUtxo2.token })
        .addOutput({ to, amount: changeAmount })
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(
        expect.arrayContaining([{ to, amount, token: nftUtxo1.token }, { to, amount, token: nftUtxo2.token }]),
      );
    });

    it('can create new token category (NFT and fungible token)', async () => {
      const fee = 1000n;
      const to = p2pkhInstance.tokenAddress;

      // As a prerequisite to creating a new token category, we need a vout0 UTXO, so we create one here
      const nonTokenUtxosBeforeGenesis = (await p2pkhInstance.getUtxos()).filter(isNonTokenUtxo);
      const preGenesisAmount = 10_000n;
      const fullBchBalance = nonTokenUtxosBeforeGenesis.reduce((total, utxo) => total + utxo.satoshis, 0n);
      const preGenesisChangeAmount = fullBchBalance - fee - preGenesisAmount;

      await new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxosBeforeGenesis, p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount: preGenesisAmount })
        .addOutput({ to, amount: preGenesisChangeAmount })
        .send();

      //////////////////////////////////////////////////////////////////////////////////////////////////

      const contractUtxos = await p2pkhInstance.getUtxos();
      const [genesisUtxo] = contractUtxos.filter((utxo) => utxo.vout === 0 && utxo.satoshis > 2000);

      if (!genesisUtxo) {
        throw new Error('No possible genesis UTXO found');
      }

      const amount = 1000n;
      const changeAmount = genesisUtxo.satoshis - fee - amount;
      const token: TokenDetails = {
        amount: 1000n,
        category: genesisUtxo.txid,
        nft: {
          capability: 'none',
          commitment: '0000000000',
        },
      };

      const tx = await new TransactionBuilder({ provider })
        .addInput(genesisUtxo, p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
        .send();

      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount, token }]));
    });

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
      const fee = 1000n;
      const fullBchBalance = nonTokenUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n) + tokenUtxo.satoshis;
      const changeAmount = fullBchBalance - fee - amount;

      const unlocker = p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv));

      const txPromise = new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxos, unlocker)
        .addInput(tokenUtxo, unlocker)
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
        .send();

      await expect(txPromise).rejects.toThrow(
        /the sum of fungible tokens in the transaction outputs exceed that of the transaction inputs for a category/,
      );
    });

    it('should throw an error when trying to send a token the contract doesn\'t have', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { category: '0000000000000000000000000000000000000000000000000000000000000000', amount: 100n };
      const fee = 1000n;
      const fullBchBalance = nonTokenUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n);
      const changeAmount = fullBchBalance - fee - amount;

      const unlocker = p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv));
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxos, unlocker)
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
        .send();

      await expect(txPromise).rejects.toThrow(
        /the transaction creates new fungible tokens for a category without a matching genesis input/,
      );
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
      const fee = 1000n;
      const fullBchBalance = nonTokenUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n) + nftUtxo.satoshis;
      const changeAmount = fullBchBalance - fee - amount;

      const unlocker = p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv));
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxos, unlocker)
        .addInput(nftUtxo, unlocker)
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
        .send();

      await expect(txPromise).rejects.toThrow(
        /the transaction creates an immutable token for a category without a matching minting token/,
      );
    });

    it('cannot burn fungible tokens when allowImplicitFungibleTokenBurn is false (default)', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...tokenUtxo.token!, amount: tokenUtxo.token!.amount - 1n };
      const fee = 1000n;
      const fullBchBalance = nonTokenUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n) + tokenUtxo.satoshis;
      const changeAmount = fullBchBalance - fee - amount;

      const unlocker = p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv));
      const txPromise = new TransactionBuilder({ provider })
        .addInputs(nonTokenUtxos, unlocker)
        .addInput(tokenUtxo, unlocker)
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
        .send();

      await expect(txPromise).rejects.toThrow('Implicit burning of fungible tokens for category');
    });

    it('can burn fungible tokens when allowImplicitFungibleTokenBurn is true', async () => {
      const contractUtxos = await p2pkhInstance.getUtxos();
      const tokenUtxo = contractUtxos.find(isFungibleTokenUtxo);
      const nonTokenUtxos = contractUtxos.filter(isNonTokenUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTXO found with fungible tokens');
      }

      const to = p2pkhInstance.tokenAddress;
      const amount = 1000n;
      const token = { ...tokenUtxo.token!, amount: tokenUtxo.token!.amount - 1n };
      const fee = 1000n;
      const fullBchBalance = nonTokenUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n) + tokenUtxo.satoshis;
      const changeAmount = fullBchBalance - fee - amount;

      const unlocker = p2pkhInstance.unlock.spend(alicePub, new SignatureTemplate(alicePriv));
      const txPromise = new TransactionBuilder({ provider, allowImplicitFungibleTokenBurn: true })
        .addInputs(nonTokenUtxos, unlocker)
        .addInput(tokenUtxo, unlocker)
        .addOutput({ to, amount, token })
        .addOutput({ to, amount: changeAmount })
        .send();

      await expect(txPromise).resolves.toBeDefined();
    });
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
