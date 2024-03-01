import { compileString } from 'cashc';
import { Contract, MockNetworkProvider, SignatureTemplate } from '../src/index.js';
import {
  alicePriv, alicePub, bobPriv, bobPub,
} from './fixture/vars.js';
import '../src/test/JestExtensions.js';
import { randomUtxo } from '../src/utils.js';
import { binToHex } from '@bitauth/libauth';

describe('Debugging tests', () => {
  describe('console.log statements', () => {
    const BASE_CONTRACT_CODE = `
      contract Test(pubkey owner) {
        function transfer(sig ownerSig, int num) {
          require(checkSig(ownerSig, owner));

          bytes2 beef = 0xbeef;
          require(beef != 0xfeed);

          console.log(ownerSig, owner, num, beef, 1, "test", true);

          require(num == 1000);
        }
      }
    `;

    const artifact = compileString(BASE_CONTRACT_CODE);
    const provider = new MockNetworkProvider();

    it('should log correct values', async () => {
      const contract = new Contract(artifact, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions
        .transfer(new SignatureTemplate(alicePriv), 1000n)
        .to(contract.address, 10000n);

      // console.log(ownerSig, owner, num, beef, 1, "test", true);
      const expectedLog = new RegExp(`^Test.cash:9 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
      await expect(transaction).toLog(expectedLog);
    });

    it('should log when logging happens before a failing require statement', async () => {
      const contract = new Contract(artifact, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const incorrectNum = 100n;
      const transaction = contract.functions
        .transfer(new SignatureTemplate(alicePriv), incorrectNum)
        .to(contract.address, 10000n);

      // console.log(ownerSig, owner, num, beef, 1, "test", true);
      const expectedLog = new RegExp(`^Test.cash:9 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100 0xbeef 1 test true$`);
      await expect(transaction).toLog(expectedLog);
    });

    it('should not log when logging happens after a failing require statement', async () => {
      const contract = new Contract(artifact, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const incorrectPriv = bobPriv;
      const transaction = contract.functions
        .transfer(new SignatureTemplate(incorrectPriv), 1000n)
        .to(contract.address, 10000n);

      // TODO: This is a super ugly test, we should fix this by improving the JestExtensions
      try {
        const expectedLog = new RegExp(`^Test.cash:9 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
        await expect(transaction).toLog(expectedLog);
        throw new Error('Expected to fail');
      } catch (e) {
        if ((e as any)?.message === 'Expected to fail') throw e;
      }
    });

    it('should log multiple consecutive console.log statements on a single line', async () => {
      const contractCode = `
        contract Test(pubkey owner) {
          function transfer(sig ownerSig, int num) {
            require(checkSig(ownerSig, owner));

            bytes2 beef = 0xbeef;
            require(beef != 0xfeed);

            console.log(ownerSig, owner, num);
            console.log(beef, 1, "test", true);

            require(num == 1000);
          }
        }
      `;

      const artifact2 = compileString(contractCode);

      const contract = new Contract(artifact2, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const incorrectNum = 100n;
      const transaction = contract.functions
        .transfer(new SignatureTemplate(alicePriv), incorrectNum)
        .to(contract.address, 10000n);

      // console.log(ownerSig, owner, num, beef, 1, "test", true);
      const expectedLog = new RegExp(`^Test.cash:9 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100 0xbeef 1 test true$`);
      await expect(transaction).toLog(expectedLog);
    });

    it('should log multiple console.log statements with other statements in between', async () => {
      const contractCode = `
        contract Test(pubkey owner) {
          function transfer(sig ownerSig, int num) {
            require(checkSig(ownerSig, owner));

            console.log(ownerSig, owner, num);

            bytes2 beef = 0xbeef;
            require(beef != 0xfeed);

            console.log(beef, 1, "test", true);

            require(num == 1000);
          }
        }
      `;

      const artifact2 = compileString(contractCode);

      const contract = new Contract(artifact2, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const incorrectNum = 100n;
      const transaction = contract.functions
        .transfer(new SignatureTemplate(alicePriv), incorrectNum)
        .to(contract.address, 10000n);

      // console.log(ownerSig, owner, num);
      const expectedFirstLog = new RegExp(`^Test.cash:6 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100$`);
      await expect(transaction).toLog(expectedFirstLog);

      const expectedSecondLog = new RegExp('^Test.cash:11 0xbeef 1 test true$');
      await expect(transaction).toLog(expectedSecondLog);
    });
  });

  describe('require statements', () => {
    const code = `
    contract TransferWithTimeout(
        pubkey sender,
        pubkey recipient,
        int timeout
    ) {
        // Require recipient's signature to match
        function transfer(sig recipientSig) {
            require(checkSig(recipientSig, recipient));
        }

        // Require timeout time to be reached and sender's signature to match
        function timeout(sig senderSig) {
            require(checkSig(senderSig, sender), "sigcheck custom fail");
            require(tx.time >= timeout, "timecheck custom fail");
        }

        function test(int a) {
          require(a == 1, "dropped last verify fail");
        }
    }
    `;

    const artifact = compileString(code);
    const provider = new MockNetworkProvider();

    it('should fail with correct error message when there are multiple require statements', async () => {
      const contract = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.timeout(new SignatureTemplate(bobPriv)).to(contract.address, 1000n);
      await expect(transaction).toFailRequireWith(/sigcheck custom fail/);
    });

    it('should fail with correct error message for timecheck require statemen when there are multiple require statements', async () => {
      const contract = new Contract(artifact, [alicePub, bobPub, 1000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.timeout(new SignatureTemplate(alicePriv)).to(contract.address, 1000n);
      await expect(transaction).toFailRequireWith(/timecheck custom fail/);
    });

    it('should fail with correct error message for the final require statement', async () => {
      const contract = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.test(0n).to(contract.address, 1000n);
      await expect(transaction).toFailRequireWith(/dropped last verify fail/);
    });

    it('should not fail if no require statements fail', async () => {
      const contract = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.transfer(new SignatureTemplate(bobPriv)).to(contract.address, 1000n);
      await expect(transaction).not.toFailRequireWith(/.*/);
    });
  });
});
