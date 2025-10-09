import { Contract, FailedTransactionError, MockNetworkProvider, SignatureAlgorithm, SignatureTemplate, TransactionBuilder, VmTarget } from '../src/index.js';
import { aliceAddress, alicePriv, alicePub, bobPriv, bobPub } from './fixture/vars.js';
import { randomUtxo } from '../src/utils.js';
import { AuthenticationErrorCommon, binToHex, hexToBin } from '@bitauth/libauth';
import {
  artifactTestMultipleConstructorParameters,
  artifactTestLogs,
  artifactTestConsecutiveLogs,
  artifactTestMultipleLogs,
  artifactTestRequires,
  artifactTestSingleFunction,
  artifactTestMultilineRequires,
  artifactTestZeroHandling,
} from './fixture/debugging/debugging_contracts.js';
import { sha256 } from '@cashscript/utils';
import { DEFAULT_VM_TARGET } from 'cashscript/src/libauth-template/utils.js';

describe('Debugging tests', () => {
  describe('console.log statements', () => {
    const provider = new MockNetworkProvider();
    const contractTestLogs = new Contract(artifactTestLogs, [alicePub], { provider });
    const contractUtxo = randomUtxo();
    provider.addUtxo(contractTestLogs.address, contractUtxo);

    it('should log correct values', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.transfer(new SignatureTemplate(alicePriv), 1000n))
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      // console.log(ownerSig, owner, num, beef, 1, "test", true);
      const expectedLog = new RegExp(`^\\[Input #0] Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
      expect(transaction).toLog(expectedLog);
    });

    it('should log when logging happens before a failing require statement', async () => {
      const incorrectNum = 100n;
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.transfer(new SignatureTemplate(alicePriv), incorrectNum))
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      // console.log(ownerSig, owner, num, beef, 1, "test", true);
      const expectedLog = new RegExp(`^\\[Input #0] Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100 0xbeef 1 test true$`);
      expect(transaction).toLog(expectedLog);
    });

    it('should not log when logging happens after a failing require statement', async () => {
      const incorrectPriv = bobPriv;
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.transfer(new SignatureTemplate(incorrectPriv), 1000n))
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      const expectedLog = new RegExp(`^\\[Input #0] Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
      expect(transaction).not.toLog(expectedLog);
    });

    it('should only log console.log statements from the called function', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.secondFunction())
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      expect(transaction).toLog(new RegExp('^\\[Input #0] Test.cash:16 Hello Second Function$'));
      expect(transaction).not.toLog(/Hello First Function/);
    });

    it('should only log console.log statements from the called function when there are many constructor parameters', async () => {
      const contractTestMultipleConstructorParameters = new Contract(
        artifactTestMultipleConstructorParameters,
        [alicePub, 1000n, 2000n, 3000n, 4000n, 5000n],
        { provider },
      );

      const utxo = randomUtxo();
      provider.addUtxo(contractTestMultipleConstructorParameters.address, utxo);

      const transaction = new TransactionBuilder({ provider })
        .addInput(utxo, contractTestMultipleConstructorParameters.unlock.secondFunction())
        .addOutput({ to: contractTestMultipleConstructorParameters.address, amount: 10000n });

      expect(transaction).toLog(new RegExp('^\\[Input #0] Test.cash:20 Hello Second Function$'));
      expect(transaction).not.toLog(/Hello First Function/);
    });

    it('should only log console.log statements from the chosen branch in if-statement', async () => {
      const transaction1 = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.functionWithIfStatement(1n))
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      expect(transaction1).toLog(new RegExp('^\\[Input #0] Test.cash:24 a is 1$'));
      expect(transaction1).toLog(new RegExp('^\\[Input #0] Test.cash:31 a equals 1$'));
      expect(transaction1).toLog(new RegExp('^\\[Input #0] Test.cash:32 b equals 1$'));
      expect(transaction1).not.toLog(/a is not 1/);

      const transaction2 = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.functionWithIfStatement(2n))
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      expect(transaction2).toLog(new RegExp('^\\[Input #0] Test.cash:27 a is not 1$'));
      expect(transaction2).toLog(new RegExp('^\\[Input #0] Test.cash:31 a equals 2$'));
      expect(transaction2).toLog(new RegExp('^\\[Input #0] Test.cash:32 b equals 2$'));
      expect(transaction2).not.toLog(/a is 1/);
    });

    it('should log multiple consecutive console.log statements on separate lines', async () => {
      const contractTestConsecutiveLogs = new Contract(artifactTestConsecutiveLogs, [alicePub], { provider });
      const utxo = randomUtxo();
      provider.addUtxo(contractTestConsecutiveLogs.address, utxo);

      const incorrectNum = 100n;
      const transaction = new TransactionBuilder({ provider })
        .addInput(utxo, contractTestConsecutiveLogs.unlock.transfer(new SignatureTemplate(alicePriv), incorrectNum))
        .addOutput({ to: contractTestConsecutiveLogs.address, amount: 10000n });

      // console.log(ownerSig, owner, num, beef);
      expect(transaction).toLog(new RegExp(`^\\[Input #0] Test.cash:9 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100$`));
      // console.log(1, "test", true)
      expect(transaction).toLog(new RegExp('^\\[Input #0] Test.cash:10 0xbeef 1 test true$'));
    });

    it('should log multiple console.log statements with other statements in between', async () => {
      const contractTestMultipleLogs = new Contract(artifactTestMultipleLogs, [alicePub], { provider });
      const utxo = randomUtxo();
      provider.addUtxo(contractTestMultipleLogs.address, utxo);

      const incorrectNum = 100n;
      const transaction = new TransactionBuilder({ provider })
        .addInput(utxo, contractTestMultipleLogs.unlock.transfer(new SignatureTemplate(alicePriv), incorrectNum))
        .addOutput({ to: contractTestMultipleLogs.address, amount: 10000n });

      // console.log(ownerSig, owner, num);
      const expectedFirstLog = new RegExp(`^\\[Input #0] Test.cash:6 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 100$`);
      expect(transaction).toLog(expectedFirstLog);

      const expectedSecondLog = new RegExp('^\\[Input #0] Test.cash:11 0xbeef 1 test true$');
      expect(transaction).toLog(expectedSecondLog);
    });

    // This is an edge case because of optimisation position hint merging
    it('should log the correct variable value inside a notif statement', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.test_log_inside_notif_statement(false))
        .addOutput({ to: contractTestLogs.address, amount: contractUtxo.satoshis - 1000n });

      expect(transaction).toLog(new RegExp(`^\\[Input #0] Test.cash:52 before: ${contractUtxo.satoshis}$`));
      expect(transaction).toLog(new RegExp(`^\\[Input #0] Test.cash:54 after: ${contractUtxo.satoshis}$`));
    });

    it('should log intermediate results that get optimised out', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.test_log_intermediate_result())
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      const expectedHash = binToHex(sha256(alicePub));
      expect(transaction).toLog(new RegExp(`^\\[Input #0] Test.cash:43 0x${expectedHash}$`));
    });

    it.todo('intermediate results that is more complex than the test above');
  });

  describe('require statements', () => {
    const provider = new MockNetworkProvider();
    const contractTestRequires = new Contract(artifactTestRequires, [], { provider });
    const contractTestRequiresUtxo = randomUtxo();
    provider.addUtxo(contractTestRequires.address, contractTestRequiresUtxo);

    const contractTestMultiLineRequires = new Contract(artifactTestMultilineRequires, [], { provider });
    const contractTestMultiLineRequiresUtxo = randomUtxo();
    provider.addUtxo(contractTestMultiLineRequires.address, contractTestMultiLineRequiresUtxo);

    // test_require
    it('should fail with error message when require statement fails in a multi-function contract', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_require())
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:13 Require statement failed at input 0 in contract Test.cash at line 13 with the following message: 1 should equal 2.');
      expect(transaction).toFailRequireWith('Failing statement: require(1 == 2, "1 should equal 2")');
    });

    // test_require_single_function
    it('should fail with error message when require statement fails in single function', async () => {
      const contractSingleFunction = new Contract(artifactTestSingleFunction, [], { provider });
      const contractSingleFunctionUtxo = randomUtxo();
      provider.addUtxo(contractSingleFunction.address, contractSingleFunctionUtxo);

      const transaction = new TransactionBuilder({ provider })
        .addInput(contractSingleFunctionUtxo, contractSingleFunction.unlock.test_require_single_function())
        .addOutput({ to: contractSingleFunction.address, amount: 1000n })
        .addOutput({ to: contractSingleFunction.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:4 Require statement failed at input 0 in contract Test.cash at line 4 with the following message: should have 1 output.');
      expect(transaction).toFailRequireWith('Failing statement: require(tx.outputs.length == 1, "should have 1 output")');
    });

    // test_multiple_require_statements
    it('it should only fail with correct error message when there are multiple require statements', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_multiple_require_statements())
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:21 Require statement failed at input 0 in contract Test.cash at line 21 with the following message: 1 should equal 2.');
      expect(transaction).toFailRequireWith('Failing statement: require(1 == 2, "1 should equal 2")');
      expect(transaction).not.toFailRequireWith(/1 should equal 1/);
    });

    // test_multiple_require_statements_final_fails
    it('it should only fail with correct error message when there are multiple require statements where the final statement fails', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_multiple_require_statements_final_fails())
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:27 Require statement failed at input 0 in contract Test.cash at line 27 with the following message: 1 should equal 2.');
      expect(transaction).toFailRequireWith('Failing statement: require(1 == 2, "1 should equal 2")');
      expect(transaction).not.toFailRequireWith(/1 should equal 1/);
    });

    it('should not fail if no require statements fail', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_require_no_failure())
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).not.toFailRequire();
    });

    // test_multiple_require_statements_no_message_final
    it('should fail without custom message if the final require statement does not have a message', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_multiple_require_statements_no_message_final())
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:32 Require statement failed at input 0 in contract Test.cash at line 32.');
      expect(transaction).toFailRequireWith('Failing statement: require(1 == 2)');
      expect(transaction).not.toFailRequireWith(/1 should equal 1/);
    });

    // test_timeops_as_final_require
    it('should fail with correct error message for the final TimeOp require statement', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_timeops_as_final_require())
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:37 Require statement failed at input 0 in contract Test.cash at line 37 with the following message: time should be HUGE.');
      expect(transaction).toFailRequireWith('Failing statement: require(tx.time >= 100000000, "time should be HUGE")');
      expect(transaction).not.toFailRequireWith(/1 should equal 1/);
    });

    // test_final_require_in_if_statement
    it('should fail with correct error message for the final require statement in an if statement', async () => {
      const transactionIfBranch = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_final_require_in_if_statement(1n))
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transactionIfBranch).toFailRequireWith('Test.cash:43 Require statement failed at input 0 in contract Test.cash at line 43 with the following message: 1 should equal 2.');
      expect(transactionIfBranch).toFailRequireWith('Failing statement: require(1 == a, "1 should equal 2")');

      const transactionElseIfBranch = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_final_require_in_if_statement(2n))
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transactionElseIfBranch).toFailRequireWith('Test.cash:46 Require statement failed at input 0 in contract Test.cash at line 46 with the following message: 1 should equal 3.');
      expect(transactionElseIfBranch).toFailRequireWith('Failing statement: require(1 == b, "1 should equal 3")');

      const transactionElseBranch = new TransactionBuilder({ provider })
        .addInput(contractTestRequiresUtxo, contractTestRequires.unlock.test_final_require_in_if_statement(3n))
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transactionElseBranch).toFailRequireWith('Test.cash:49 Require statement failed at input 0 in contract Test.cash at line 49 with the following message: switch should equal 4.');
      expect(transactionElseBranch).toFailRequireWith('Failing statement: require(switch == c, "switch should equal 4")');
    });

    // test_final_require_in_if_statement_with_deep_reassignment
    it('should fail with correct error message for the final require statement in an if statement with a deep reassignment', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_final_require_in_if_statement_with_deep_reassignment(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:62 Require statement failed at input 0 in contract Test.cash at line 62 with the following message: sum should equal 10.');
      expect(transaction).toFailRequireWith('Failing statement: require(a + b + c + d + e == 10, "sum should equal 10")');
    });

    // test_fail_checksig
    it('should fail with correct error message when checkSig fails', async () => {
      const checkSigTransaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_fail_checksig(new SignatureTemplate(alicePriv), bobPub),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(checkSigTransaction).toFailRequireWith('Test.cash:77 Require statement failed at input 0 in contract Test.cash at line 77 with the following message: Signatures do not match.');
      expect(checkSigTransaction).toFailRequireWith('Failing statement: require(checkSig(s, pk), "Signatures do not match")');

      const checkSigTransactionNullSignature = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_fail_checksig(hexToBin(''), bobPub),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(checkSigTransactionNullSignature).toFailRequireWith('Test.cash:77 Require statement failed at input 0 in contract Test.cash at line 77 with the following message: Signatures do not match.');
      expect(checkSigTransactionNullSignature).toFailRequireWith('Failing statement: require(checkSig(s, pk), "Signatures do not match")');
    });

    // test_fail_checksig_final_verify
    it('should fail with correct error message when checkSig fails as the final verify', async () => {
      const checkSigTransaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_fail_checksig_final_verify(new SignatureTemplate(alicePriv), bobPub),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(checkSigTransaction).toFailRequireWith('Test.cash:82 Require statement failed at input 0 in contract Test.cash at line 82 with the following message: Signatures do not match.');
      expect(checkSigTransaction).toFailRequireWith('Failing statement: require(checkSig(s, pk), "Signatures do not match")');
    });

    // test_fail_checkdatasig
    it('should fail with correct error message when checkDataSig fails', async () => {
      const checkDataSigTransaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_fail_checkdatasig(new SignatureTemplate(alicePriv).generateSignature(hexToBin('0xbeef')).slice(0, -1), '0xbeef', bobPub),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(checkDataSigTransaction).toFailRequireWith('Test.cash:86 Require statement failed at input 0 in contract Test.cash at line 86 with the following message: Data Signatures do not match.');
      expect(checkDataSigTransaction).toFailRequireWith('Failing statement: require(checkDataSig(s, message, pk), "Data Signatures do not match")');

      const checkDataSigTransactionWrongMessage = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_fail_checkdatasig(new SignatureTemplate(alicePriv).generateSignature(hexToBin('0xc0ffee')).slice(0, -1), '0xbeef', alicePub),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(checkDataSigTransactionWrongMessage).toFailRequireWith('Test.cash:86 Require statement failed at input 0 in contract Test.cash at line 86 with the following message: Data Signatures do not match.');
      expect(checkDataSigTransactionWrongMessage).toFailRequireWith('Failing statement: require(checkDataSig(s, message, pk), "Data Signatures do not match")');
    });

    // test_fail_checkmultisig
    it('should fail with correct error message when checkMultiSig fails', async () => {
      const checkmultiSigTransaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_fail_checkmultisig(
            new SignatureTemplate(alicePriv, undefined, SignatureAlgorithm.ECDSA),
            bobPub,
            new SignatureTemplate(bobPriv, undefined, SignatureAlgorithm.ECDSA),
            alicePub,
          ),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(checkmultiSigTransaction).toFailRequireWith('Test.cash:90 Require statement failed at input 0 in contract Test.cash at line 90 with the following message: Multi Signatures do not match.');
      expect(checkmultiSigTransaction).toFailRequireWith('Failing statement: require(checkMultiSig([s1, s2], [pk1, pk2]), "Multi Signatures do not match")');
    });

    // test_fail_large_cleanup
    it('should fail with correct error message when a require statement fails in a function with a large cleanup', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestMultiLineRequiresUtxo,
          contractTestMultiLineRequires.unlock.test_fail_large_cleanup(),
        )
        .addOutput({ to: contractTestMultiLineRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:22 Require statement failed at input 0 in contract Test.cash at line 22 with the following message: 1 should equal 2.');
      expect(transaction).toFailRequireWith('Failing statement: require(1 == 2, "1 should equal 2")');
    });

    // test_fail_multiline_require
    it('should fail with correct error message and statement when a multiline require statement fails', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestMultiLineRequiresUtxo,
          contractTestMultiLineRequires.unlock.test_fail_multiline_require(),
        )
        .addOutput({ to: contractTestMultiLineRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:26 Require statement failed at input 0 in contract Test.cash at line 26 with the following message: 1 should equal 2.');
      expect(transaction).toFailRequireWith(`Failing statement: require(
      1 == 2,
      "1 should equal 2"
    );`);
    });

    // test_fail_multiline_final_require
    it('should fail with correct error message and statement when a multiline final require statement fails', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestMultiLineRequiresUtxo,
          contractTestMultiLineRequires.unlock.test_fail_multiline_final_require(),
        )
        .addOutput({ to: contractTestMultiLineRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:35 Require statement failed at input 0 in contract Test.cash at line 35 with the following message: 1 should equal 2.');
      expect(transaction).toFailRequireWith(`Failing statement: require(
      1 == 2,
      "1 should equal 2"
    );`);
    });

    // test_multiline_require_with_unary_op
    // Note that we add this test, because we changed the LocationHint for all Unary Ops to "END"
    it('should fail with correct error message and statement when a multiline require statement with a unary op fails', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestMultiLineRequiresUtxo,
          contractTestMultiLineRequires.unlock.test_multiline_require_with_unary_op(),
        )
        .addOutput({ to: contractTestMultiLineRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:51 Require statement failed at input 0 in contract Test.cash at line 51.');
      expect(transaction).toFailRequireWith(`Failing statement: require(
      !(
        0x000000
        .reverse()
        .length
        !=
        -(
          30
            +
          15
        )
      )
    );`);
    });

    // test_multiline_require_with_instantiation
    it('should fail with correct error message and statement when a multiline require statement with an instantiation fails', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestMultiLineRequiresUtxo,
          contractTestMultiLineRequires.unlock.test_multiline_require_with_instantiation(),
        )
        .addOutput({ to: contractTestMultiLineRequires.address, amount: 1000n });

      expect(transaction).toFailRequireWith('Test.cash:69 Require statement failed at input 0 in contract Test.cash at line 69.');
      expect(transaction).toFailRequireWith(`Failing statement: require(
      new LockingBytecodeP2PKH(
        hash160(0x000000)
      )
        ==
      new LockingBytecodeNullData([
        0x00,
        bytes(\"hello world\")
      ])
    );`);
    });
  });

  describe('Non-require error messages', () => {
    const provider = new MockNetworkProvider();

    const contractTestRequires = new Contract(artifactTestRequires, [], { provider });
    const contractTestRequiresUtxo = randomUtxo();
    provider.addUtxo(contractTestRequires.address, contractTestRequiresUtxo);

    const contractTestMultiLineRequires = new Contract(artifactTestMultilineRequires, [], { provider });
    const contractTestMultiLineRequiresUtxo = randomUtxo();
    provider.addUtxo(contractTestMultiLineRequires.address, contractTestMultiLineRequiresUtxo);

    // test_invalid_split_range
    it('should fail with correct error message when an invalid OP_SPLIT range is used', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_invalid_split_range(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(() => transaction.debug()).toThrow('Test.cash:68 Error in transaction at input 0 in contract Test.cash at line 68.');
      expect(() => transaction.debug()).toThrow('Failing statement: test.split(4)');
      expect(() => transaction.debug()).toThrow(`Reason: ${AuthenticationErrorCommon.invalidSplitIndex}`);
    });

    // test_invalid_input_index
    it('should fail with correct error message when an invalid input index is used', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_invalid_input_index(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 1000n });

      expect(() => transaction.debug()).toThrow('Test.cash:73 Error in transaction at input 0 in contract Test.cash at line 73.');
      expect(() => transaction.debug()).toThrow('Failing statement: tx.inputs[5].value');
      expect(() => transaction.debug()).toThrow(`Reason: ${AuthenticationErrorCommon.invalidTransactionUtxoIndex}`);
    });

    // test_multiline_non_require_error
    it('should fail with correct error message and statement when a multiline non-require statement fails', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestMultiLineRequiresUtxo,
          contractTestMultiLineRequires.unlock.test_multiline_non_require_error(),
        )
        .addOutput({ to: contractTestMultiLineRequires.address, amount: 1000n });

      expect(() => transaction.debug()).toThrow('Test.cash:43 Error in transaction at input 0 in contract Test.cash at line 43.');
      expect(() => transaction.debug()).toThrow(`Failing statement: tx.outputs[
        5
      ].value`);
      expect(() => transaction.debug()).toThrow(`Reason: ${AuthenticationErrorCommon.invalidTransactionOutputIndex}`);
    });
  });

  describe('Template encoding', () => {
    const provider = new MockNetworkProvider();

    // test_zero_handling
    it('should encode a locking and unlocking parameter of value 0 correctly and evaluate the execution', async () => {
      const contract = new Contract(artifactTestZeroHandling, [0n], { provider });
      const contractUtxo = randomUtxo();
      provider.addUtxo(contract.address, contractUtxo);

      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock.test_zero_handling(0n))
        .addOutput({ to: contract.address, amount: 1000n });

      expect(transaction).not.toFailRequire();
    });
  });

  describe('TestExtensions', () => {
    const provider = new MockNetworkProvider();
    const contractTestRequires = new Contract(artifactTestRequires, [], { provider });
    const contractTestRequiresUtxo = randomUtxo();
    provider.addUtxo(contractTestRequires.address, contractTestRequiresUtxo);

    // Note: happy cases are implicitly tested by the "regular" debugging tests, since the use TestExtensions

    it('should fail the TestExtensions test if an incorrect log is expected', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_logs(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 10000n });

      expect(
        () => expect(transaction).toLog('^This is definitely not the log$'),
      ).toThrow(/Expected: .*This is definitely not the log.*\nReceived: (.|\n)*?\[Input #0] Test.cash:4 Hello World/);
    });

    it('should fail the TestExtensions test if a log is logged that is NOT expected', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_logs(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 10000n });

      expect(
        () => expect(transaction).not.toLog('^\\[Input #0] Test.cash:4 Hello World$'),
      ).toThrow(
        /Expected: not .*\[Input #0] Test.cash:4 Hello World.*\nReceived: (.|\n)*?\[Input #0] Test.cash:4 Hello World/,
      );

      expect(
        () => expect(transaction).not.toLog(),
      ).toThrow(/Expected: not .*undefined.*\nReceived: (.|\n)*?\[Input #0] Test.cash:4 Hello World/);
    });

    it('should fail the TestExtensions test if a log is expected where no log is logged', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_no_logs(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 10000n });

      expect(
        () => expect(transaction).toLog('Hello World'),
      ).toThrow(/Expected: .*Hello World.*\nReceived: (.|\n)*?undefined/);
    });

    it('should fail the TestExtensions test if an incorrect require error message is expected', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_require(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 10000n });

      expect(
        () => expect(transaction).toFailRequireWith('1 should equal 3'),
      ).toThrow(/Expected pattern: .*1 should equal 3.*\nReceived string: (.|\n)*?1 should equal 2/);
    });

    it('should fail the TestExtensions test if a require error message is expected where no error is thrown', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_require_no_failure(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 10000n });

      expect(
        () => expect(transaction).toFailRequireWith('1 should equal 3'),
      ).toThrow(/Contract function did not fail a require statement/);
    });

    it('should fail the TestExtensions test if an error is thrown where it is NOT expected', async () => {
      const transaction = new TransactionBuilder({ provider })
        .addInput(
          contractTestRequiresUtxo,
          contractTestRequires.unlock.test_require(),
        )
        .addOutput({ to: contractTestRequires.address, amount: 10000n });

      expect(
        () => expect(transaction).not.toFailRequireWith('1 should equal 2'),
      ).toThrow(/Expected pattern: not .*1 should equal 2.*\nReceived string: (.|\n)*?1 should equal 2/);

      expect(
        () => expect(transaction).not.toFailRequire(),
      ).toThrow(/Contract function failed a require statement\.*\nReceived string: (.|\n)*?1 should equal 2/);
    });
  });

  describe('P2PKH only transaction', () => {
    it('should succeed when spending from P2PKH inputs with the corresponding unlocker', async () => {
      const provider = new MockNetworkProvider();
      provider.addUtxo(aliceAddress, randomUtxo());
      provider.addUtxo(aliceAddress, randomUtxo());

      const result = new TransactionBuilder({ provider })
        .addInputs(await provider.getUtxos(aliceAddress), new SignatureTemplate(alicePriv).unlockP2PKH())
        .addOutput({ to: aliceAddress, amount: 5000n })
        .debug();

      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    // We currently don't have a way to properly handle non-matching UTXOs and unlockers
    // Note: that also goes for Contract UTXOs where a user uses an unlocker of a different contract
    it.skip('should fail when spending from P2PKH inputs with an unlocker for a different public key', async () => {
      const provider = new MockNetworkProvider();
      provider.addUtxo(aliceAddress, randomUtxo());
      provider.addUtxo(aliceAddress, randomUtxo());

      const transactionBuilder = new TransactionBuilder({ provider })
        .addInputs(await provider.getUtxos(aliceAddress), new SignatureTemplate(bobPriv).unlockP2PKH())
        .addOutput({ to: aliceAddress, amount: 5000n });

      expect(() => transactionBuilder.debug()).toThrow(FailedTransactionError);
    });
  });

  describe('VmTargets', () => {
    const vmTargets = [
      undefined,
      VmTarget.BCH_2023_05,
      VmTarget.BCH_2025_05,
      VmTarget.BCH_2026_05,
      VmTarget.BCH_SPEC,
    ] as const;

    it.each(vmTargets)('should execute and log correctly with vmTarget %s', async (vmTarget) => {
      const provider = new MockNetworkProvider({ vmTarget });
      const contractTestLogs = new Contract(artifactTestLogs, [alicePub], { provider });
      const contractUtxo = randomUtxo();
      provider.addUtxo(contractTestLogs.address, contractUtxo);

      const transaction = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contractTestLogs.unlock.transfer(new SignatureTemplate(alicePriv), 1000n))
        .addOutput({ to: contractTestLogs.address, amount: 10000n });

      expect(transaction.getLibauthTemplate().supported[0]).toBe(vmTarget ?? DEFAULT_VM_TARGET);

      const expectedLog = new RegExp(`^\\[Input #0] Test.cash:10 0x[0-9a-f]{130} 0x${binToHex(alicePub)} 1000 0xbeef 1 test true$`);
      expect(transaction).toLog(expectedLog);
    });
  });
});

describe('VM Resources', () => {
  it('Should output VM resource usage', async () => {
    const provider = new MockNetworkProvider();

    const contractSingleFunction = new Contract({ ...artifactTestSingleFunction, contractName: 'SingleFunction' }, [], { provider });
    const contractZeroHandling = new Contract({ ...artifactTestZeroHandling, contractName: 'ZeroHandling' }, [0n], { provider });

    provider.addUtxo(contractSingleFunction.address, randomUtxo());
    provider.addUtxo(contractZeroHandling.address, randomUtxo());
    provider.addUtxo(aliceAddress, randomUtxo());

    const tx = new TransactionBuilder({ provider })
      .addInputs(await contractSingleFunction.getUtxos(), contractSingleFunction.unlock.test_require_single_function())
      .addInputs(await contractZeroHandling.getUtxos(), contractZeroHandling.unlock.test_zero_handling(0n))
      .addInput((await provider.getUtxos(aliceAddress))[0], new SignatureTemplate(alicePriv).unlockP2PKH())
      .addOutput({ to: aliceAddress, amount: 1000n });

    console.log = vi.fn();
    console.table = vi.fn();

    const vmUsage = tx.getVmResourceUsage();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.table).not.toHaveBeenCalled();

    tx.getVmResourceUsage(true);
    expect(console.log).toHaveBeenCalledWith('VM Resource usage by inputs:');
    expect(console.table).toHaveBeenCalled();

    vi.restoreAllMocks();

    expect(vmUsage[0]?.hashDigestIterations).toBeGreaterThan(0);
    expect(vmUsage[2]?.hashDigestIterations).toBeGreaterThan(0);
  });
});
