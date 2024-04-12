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
          console.log('Hello First Function');
          require(checkSig(ownerSig, owner));

          bytes2 beef = 0xbeef;
          require(beef != 0xfeed);

          console.log(ownerSig, owner, num, beef, 1, "test", true);

          require(num == 1000);
        }

        function secondFunction() {
          console.log("Hello Second Function");
          require(1 == 1);
        }

        function functionWithIfStatement(int a) {
          if (a == 1) {
            console.log("a is 1");
          } else {
            console.log("a is not 1");
          }

          require(1 == 1);
        }

        function noLogs() {
          require(1 == 1);
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
      const expectedLog = new RegExp(`^Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
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
      const expectedLog = new RegExp(`^Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100 0xbeef 1 test true$`);
      await expect(transaction).toLog(expectedLog);
    });

    it('should not log when logging happens after a failing require statement', async () => {
      const contract = new Contract(artifact, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const incorrectPriv = bobPriv;
      const transaction = contract.functions
        .transfer(new SignatureTemplate(incorrectPriv), 1000n)
        .to(contract.address, 10000n);

      const expectedLog = new RegExp(`^Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
      await expect(transaction).not.toLog(expectedLog);
    });

    it('should only log console.log statements from the called function', async () => {
      const contract = new Contract(artifact, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions
        .secondFunction()
        .to(contract.address, 10000n);

      await expect(transaction).toLog(new RegExp('^Test.cash:16 Hello Second Function$'));
      await expect(transaction).not.toLog(/Hello First Function/);
    });

    it('should only log console.log statements from the chosen branch in if-statement', async () => {
      const contract = new Contract(artifact, [alicePub], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction1 = contract.functions
        .functionWithIfStatement(1n)
        .to(contract.address, 10000n);

      await expect(transaction1).toLog(new RegExp('^Test.cash:22 a is 1$'));
      await expect(transaction1).not.toLog(/a is not 1/);

      const transaction2 = contract.functions
        .functionWithIfStatement(2n)
        .to(contract.address, 10000n);

      await expect(transaction2).toLog(new RegExp('^Test.cash:24 a is not 1$'));
      await expect(transaction2).not.toLog(/a is 1/);
    });

    it('should log multiple consecutive console.log statements on separate lines', async () => {
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

      // console.log(ownerSig, owner, num, beef);
      await expect(transaction).toLog(new RegExp(`^Test.cash:9 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100$`));
      // console.log(1, "test", true)
      await expect(transaction).toLog(new RegExp('^Test.cash:10 0xbeef 1 test true$'));
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

    it('should only fail with correct error message when there are multiple require statements', async () => {
      const contract = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.timeout(new SignatureTemplate(bobPriv)).to(contract.address, 1000n);
      await expect(transaction).toFailRequireWith(/sigcheck custom fail/);
      await expect(transaction).not.toFailRequireWith(/timecheck custom fail/);
    });

    it('should only fail with correct error message for timecheck require statement when there are multiple require statements', async () => {
      const contract = new Contract(artifact, [alicePub, bobPub, 1000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.timeout(new SignatureTemplate(alicePriv)).to(contract.address, 1000n);
      await expect(transaction).toFailRequireWith(/timecheck custom fail/);
      await expect(transaction).not.toFailRequireWith(/sigcheck custom fail/);
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

  describe('JestExtensions', () => {
    const CONTRACT_CODE = `
      contract Test() {
        function test_logs() {
          console.log("Hello World");
          require(1 == 2);
        }

        function test_no_logs() {
          require(1 == 2);
        }

        function test_require() {
          require(1 == 2, "1 should equal 2");
        }

        function test_require_no_failure() {
          require(1 == 1, "1 should equal 1");
        }
      }
    `;

    const artifact = compileString(CONTRACT_CODE);
    const provider = new MockNetworkProvider();

    it('should fail the JestExtensions test if an incorrect log is expected', async () => {
      const contract = new Contract(artifact, [], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions
        .test_logs()
        .to(contract.address, 10000n);

      const incorrectExpectedLog = new RegExp('^This is definitely not the log$');

      // Note: We're wrapping the expect call in another expect, since we expect the inner expect to throw
      await expect(
        expect(transaction).toLog(incorrectExpectedLog),
      ).rejects.toThrow(/Expected: .*This is definitely not the log.*\nReceived: .*Test.cash:4 Hello World/);
    });

    // TODO: Investigate why it still logs, even though we call test_no_logs()
    it('should fail the JestExtensions test if a log is expected where no log is logged', async () => {
      const contract = new Contract(artifact, [], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions
        .test_no_logs()
        .to(contract.address, 10000n);

      const incorrectExpectedLog = new RegExp('Hello World');

      // Note: We're wrapping the expect call in another expect, since we expect the inner expect to throw
      await expect(
        expect(transaction).toLog(incorrectExpectedLog),
      ).rejects.toThrow(/Expected: .*Hello World.*\nReceived: undefined/);
    });

    it('[WIP] should fail the JestExtensions test if a log is expected where no log is logged', async () => {
      const contract = new Contract(artifact, [], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = await contract.functions
        .test_no_logs()
        .to(contract.address, 10000n)
        .debug();

      console.log(transaction);
    });

    it('should fail the JestExtensions test if an incorrect require error message is expected', async () => {
      const contract = new Contract(artifact, [], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions
        .test_require()
        .to(contract.address, 10000n);

      const incorrectExpectedRequire = new RegExp('1 should equal 3');

      // Note: We're wrapping the expect call in another expect, since we expect the inner expect to throw
      await expect(
        expect(transaction).toFailRequireWith(incorrectExpectedRequire),
      ).rejects.toThrow(/Expected: .*1 should equal 3.*\nReceived: .*1 should equal 2.*/);
    });


    it('should fail the JestExtensions test if a require error message is expected where no error is thrown', async () => {
      const contract = new Contract(artifact, [], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions
        .test_require_no_failure()
        .to(contract.address, 10000n);

      const incorrectExpectedRequire = new RegExp('1 should equal 3');

      // Note: We're wrapping the expect call in another expect, since we expect the inner expect to throw
      await expect(
        expect(transaction).toFailRequireWith(incorrectExpectedRequire),
      ).rejects.toThrow(/Expected: .*1 should equal 3.*\nReceived: undefined/);
    });
  });
});
