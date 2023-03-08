import {
  Contract,
  SignatureTemplate,
  ElectrumNetworkProvider,
  Network,
} from '../../src/index.js';
import {
  alicePriv,
  alicePub,
  oracle,
  oraclePub,
} from '../fixture/vars.js';
import { getTxOutputs } from '../test-util.js';
import { FailedRequireError, Reason } from '../../src/Errors.js';
import artifact from '../fixture/hodl_vault.json' assert { type: "json" };

describe('HodlVault', () => {
  let hodlVault: Contract;

  beforeAll(() => {
    const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    hodlVault = new Contract(artifact, [alicePub, oraclePub, 99000n, 30000n], { provider });
    console.log(hodlVault.address);
  });

  describe('send', () => {
    it('should fail when oracle sig is incorrect', async () => {
      // given
      const message = oracle.createMessage(100000n, 1000n);
      const wrongMessage = oracle.createMessage(100000n, 1001n);
      const wrongSig = oracle.signMessage(wrongMessage);
      const to = hodlVault.address;
      const amount = 10000n;

      // when
      const txPromise = hodlVault.functions
        .spend(new SignatureTemplate(alicePriv), wrongSig, message)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.VERIFY);
    });

    it('should fail when price is too low', async () => {
      // given
      const message = oracle.createMessage(100000n, 29900n);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000n;

      // when
      const txPromise = hodlVault.functions
        .spend(new SignatureTemplate(alicePriv), oracleSig, message)
        .to(to, amount)
        .send();

      // then
      await expect(txPromise).rejects.toThrow(FailedRequireError);
      await expect(txPromise).rejects.toThrow(Reason.VERIFY);
    });

    it('should succeed when price is high enough', async () => {
      // given
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message);
      const to = hodlVault.address;
      const amount = 10000n;

      // when
      const tx = await hodlVault.functions
        .spend(new SignatureTemplate(alicePriv), oracleSig, message)
        .to(to, amount)
        .send();

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
