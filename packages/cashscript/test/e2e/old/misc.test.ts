import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
  HashType,
} from '../../../src/index.js';
import {
  alicePkh,
  bobPkh,
  aliceAddress,
  alicePub,
  alicePriv,
} from '../../fixture/vars.js';
import { getTxOutputs } from '../../test-util.js';
import simpleCovenantArtifact from '../../fixture/old/simple_covenant.json' assert { type: "json" };
import mecenasBorderArtifact from '../../fixture/old/mecenas_border.json' assert { type: "json" };

describe('v0.6.0 - Simple Covenant', () => {
  let covenant: Contract;

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    const addressType = 'p2sh20';
    covenant = new Contract(simpleCovenantArtifact, [], { provider, addressType });
    console.log(covenant.address);
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const to = covenant.address;
      const amount = 1000n;

      // when
      const tx = await covenant.functions
        .spend(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL))
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

describe('v0.6.0 - Bytecode VarInt Border Mecenas', () => {
  let mecenas: Contract;
  const pledge = 10000n;

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    const addressType = 'p2sh20';
    mecenas = new Contract(mecenasBorderArtifact, [alicePkh, bobPkh, pledge], { provider, addressType });
    console.log(mecenas.address);
  });

  it('should succeed when sending pledge to receiver', async () => {
    // given
    const to = aliceAddress;
    const amount = pledge;

    // when
    const tx = await mecenas.functions
      .receive(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_ALL))
      .to(to, amount)
      .withHardcodedFee(1000n)
      .send();

    // then
    const txOutputs = getTxOutputs(tx);
    expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
  });
});
