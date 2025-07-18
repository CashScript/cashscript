import { hexToBin } from '@bitauth/libauth';
import { placeholder } from '@cashscript/utils';
import {
  Contract,
  ElectrumNetworkProvider,
  MockNetworkProvider,
  Network,
  randomUtxo,
  SignatureTemplate,
} from '../src/index.js';
import {
  alicePkh, alicePriv, alicePub, bobPriv,
} from './fixture/vars.js';
import p2pkhArtifact from './fixture/p2pkh.artifact.js';
import twtArtifact from './fixture/transfer_with_timeout.artifact.js';
import hodlVaultArtifact from './fixture/hodl_vault.artifact.js';
import mecenasArtifact from './fixture/mecenas.artifact.js';
import deprecatedMecenasArtifact from './fixture/deprecated/mecenas-v0.6.0.json' with { type: 'json' };
import boundedBytesArtifact from './fixture/bounded_bytes.artifact.js';

describe('Contract', () => {
  describe('new', () => {
    it('should fail with incorrect constructor args', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);

      // @ts-expect-error invalid constructor type
      expect(() => new Contract(p2pkhArtifact, [], { provider })).toThrow();
      // @ts-expect-error invalid constructor type
      expect(() => new Contract(p2pkhArtifact, [20n], { provider })).toThrow();
      expect(
        // @ts-expect-error invalid constructor type
        () => new Contract(p2pkhArtifact, [placeholder(20), placeholder(20)], { provider }),
      ).toThrow();
      expect(() => new Contract(p2pkhArtifact, [placeholder(19)], { provider })).toThrow();
      expect(() => new Contract(p2pkhArtifact, [placeholder(21)], { provider })).toThrow();
    });

    it('should fail with artifact compiled with unsupported compiler version', async () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const constructorArgs = [placeholder(20), placeholder(20), 1000000n];

      expect(() => new Contract(deprecatedMecenasArtifact, constructorArgs, { provider }))
        .toThrow(/unsupported compiler version/);
    });

    it('should fail with incomplete artifact', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);

      expect(() => new Contract({ ...p2pkhArtifact, abi: undefined } as any, [], { provider })).toThrow();
      expect(() => new Contract({ ...p2pkhArtifact, bytecode: undefined } as any, [], { provider })).toThrow();
      expect(
        () => new Contract({ ...p2pkhArtifact, constructorInputs: undefined } as any, [], { provider }),
      ).toThrow();
      expect(() => new Contract({ ...p2pkhArtifact, contractName: undefined } as any, [], { provider })).toThrow();
    });

    it('should create new P2PKH instance', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const instance = new Contract(p2pkhArtifact, [placeholder(20)], { provider });

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(p2pkhArtifact.contractName);
    });

    it('should create new TransferWithTimeout instance', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const instance = new Contract(twtArtifact, [placeholder(65), placeholder(65), 1000000n], { provider });

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.transfer).toBe('function');
      expect(typeof instance.functions.timeout).toBe('function');
      expect(instance.name).toEqual(twtArtifact.contractName);
    });

    it('should create new HodlVault instance', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const instance = new Contract(hodlVaultArtifact, [placeholder(65), placeholder(65), 1000000n, 10000n], { provider });

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.spend).toBe('function');
      expect(instance.name).toEqual(hodlVaultArtifact.contractName);
    });

    it('should create new Mecenas instance', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const instance = new Contract(mecenasArtifact, [placeholder(20), placeholder(20), 1000000n], { provider });

      expect(typeof instance.address).toBe('string');
      expect(typeof instance.functions.receive).toBe('function');
      expect(typeof instance.functions.reclaim).toBe('function');
      expect(instance.name).toEqual(mecenasArtifact.contractName);
    });

    it('should create a P2SH20 contract when specified in the constructor arguments', () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const p2sh20Instance = new Contract(p2pkhArtifact, [placeholder(20)], { provider, addressType: 'p2sh20' });
      const p2sh32Instance = new Contract(p2pkhArtifact, [placeholder(20)], { provider, addressType: 'p2sh32' });

      const P2SH20_ADDRESS_SIZE = 42;
      const P2SH32_ADDRESS_SIZE = 61;
      expect(p2sh20Instance.address.split(':')[1]).toHaveLength(P2SH20_ADDRESS_SIZE);
      expect(p2sh32Instance.address.split(':')[1]).toHaveLength(P2SH32_ADDRESS_SIZE);
    });
  });

  describe('getBalance', () => {
    // Not very robust, as this depends on the example P2PKH contract having balance
    it('should return balance for existing contract', async () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const instance = new Contract(p2pkhArtifact, [alicePkh], { provider });

      expect(await instance.getBalance()).toBeGreaterThan(0n);
    });

    it('should return zero balance for new contract', async () => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const instance = new Contract(p2pkhArtifact, [placeholder(20)], { provider });

      expect(await instance.getBalance()).toBe(0n);
    });
  });

  describe('getUtxos', () => {
    it('should return utxos for existing contract on mocknet', async () => {
      const provider = new MockNetworkProvider();
      const instance = new Contract(p2pkhArtifact, [alicePkh], { provider });

      provider.addUtxo(instance.address, randomUtxo());

      const utxos = await instance.getUtxos();
      const utxosFromProvider = await provider.getUtxos(instance.address);

      expect(utxos).toHaveLength(1);
      expect(utxos).toEqual(utxosFromProvider);
    });
  });

  describe('Contract functions', () => {
    let instance: Contract;
    let bbInstance: Contract;
    beforeEach(() => {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      instance = new Contract(p2pkhArtifact, [alicePkh], { provider });
      bbInstance = new Contract(boundedBytesArtifact, [], { provider });
    });

    it('can\'t call spend with incorrect signature', () => {
      expect(() => instance.functions.spend()).toThrow();
      expect(() => instance.functions.spend(0n, 1n)).toThrow();
      expect(() => instance.functions.spend(alicePub, new SignatureTemplate(alicePriv), 0n)).toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e803'), 1000n)).toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e803000000'), 1000n)).toThrow();
    });

    it('can call spend with incorrect arguments', () => {
      expect(() => instance.functions.spend(alicePub, new SignatureTemplate(bobPriv))).not.toThrow();
      expect(() => instance.functions.spend(alicePkh, placeholder(65))).not.toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e8031234'), 1000n)).not.toThrow();
    });

    it('can call spend with correct arguments', () => {
      expect(() => instance.functions.spend(alicePub, new SignatureTemplate(alicePriv))).not.toThrow();
      expect(() => bbInstance.functions.spend(hexToBin('e8030000'), 1000n)).not.toThrow();
    });
  });
});
