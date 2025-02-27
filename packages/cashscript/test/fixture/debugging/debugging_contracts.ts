import { compileString } from 'cashc';

const CONTRACT_TEST_REQUIRES = `
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

  function test_multiple_require_statements() {
    require(1 == 2, "1 should equal 2");
    require(1 == 1, "1 should equal 1");
  }

  function test_multiple_require_statements_final_fails() {
    require(1 == 1, "1 should equal 1");
    require(1 == 2, "1 should equal 2");
  }

  function test_multiple_require_statements_no_message_final() {
    require(1 == 1, "1 should equal 1");
    require(1 == 2);
  }

  function test_timeops_as_final_require() {
    require(1 == 1, "1 should equal 1");
    require(tx.time >= 100000000, "time should be HUGE");
  }

  function test_final_require_in_if_statement(int switch) {
    if (switch == 1) {
      int a = 2;
      require(1 == a, "1 should equal 2");
    } else if (switch == 2) {
      int b = 3;
      require(1 == b, "1 should equal 3");
    } else {
      int c = 4;
      require(switch == c, "switch should equal 4");
    }
  }

  function test_final_require_in_if_statement_with_deep_reassignment() {
    int a = 0;
    int b = 1;
    int c = 2;
    int d = 3;
    int e = 4;
    if (a == 0) {
      a =
        10 + 10;
      require(a + b + c + d + e == 10, "sum should equal 10");
    }
  }

  function test_invalid_split_range() {
    bytes test = 0x1234;
    bytes test2 = test.split(4)[0];
    require(test2 == 0x1234);
  }

  function test_invalid_input_index() {
    require(tx.inputs[5].value == 1000);
  }

  function test_fail_checksig(sig s, pubkey pk) {
    require(checkSig(s, pk), "Signatures do not match");
    require(1 == 2, "1 should equal 2");
  }

  function test_fail_checksig_final_verify(sig s, pubkey pk) {
    require(checkSig(s, pk), "Signatures do not match");
  }

  function test_fail_checkdatasig(datasig s, bytes message, pubkey pk) {
    require(checkDataSig(s, message, pk), "Data Signatures do not match");
  }

  function test_fail_checkmultisig(sig s1, pubkey pk1, sig s2, pubkey pk2) {
    require(checkMultiSig([s1, s2], [pk1, pk2]), "Multi Signatures do not match");
  }
}
`;

const CONTRACT_TEST_REQUIRE_SINGLE_FUNCTION = `
contract Test() {
  function test_require_single_function() {
    require(tx.outputs.length == 1, "should have 1 output");
  }
}`;

const CONTRACT_TEST_MULTILINE_REQUIRES = `
contract Test() {
  // We test this because the cleanup looks different and the final OP_VERIFY isn't removed for these kinds of functions
  function test_fail_large_cleanup() {
    int a = 1;
    int b = 2;
    int c = 3;
    int d = 4;
    int e = 5;
    int f = 6;
    int g = 7;
    int h = 8;

    // Use all variables inside this if-statement so they do not get OP_ROLL'ed
    if (
    1
      == 2
    ) {
      require(a + b + c + d + e + f + g + h == 1, "sum should equal 36");
    }

    require(1 == 2, "1 should equal 2");
  }

  function test_fail_multiline_require() {
    require(
      1 == 2,
      "1 should equal 2"
    );

    require(1 == 1);
  }

  function test_fail_multiline_final_require() {
    require(
      1 == 2,
      "1 should equal 2"
    );
  }

  function test_multiline_non_require_error() {
    int x =
      tx.outputs[
        5
      ].value +
      tx.inputs[5].value;
    require(x == 1000);
  }

  function test_multiline_require_with_unary_op() {
    require(
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
    );

    require(1 == 1);
  }

  function test_multiline_require_with_instantiation() {
    require(
      new LockingBytecodeP2PKH(
        hash160(0x000000)
      )
        ==
      new LockingBytecodeNullData([
        0x00,
        bytes("hello world")
      ])
    );

    require(1 == 1);
  }
}
`;

const CONTRACT_TEST_ZERO_HANDLING = `
contract Test(int a) {
  function test_zero_handling(int b) {
    require(a == 0, "a should be 0");
    require(b == 0, "b should be 0");
    require(a == b, "a should equal b");
  }
}
`;

const CONTRACT_TEST_LOGS = `
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
    int b = 0;

    if (a == 1) {
      console.log("a is 1");
      b = a;
    } else {
      console.log("a is not 1");
      b = 2;
    }

    console.log('a equals', a);
    console.log('b equals', b);

    require(1 == 1);
  }

  function noLogs() {
    require(1 == 1);
  }
}
`;

const CONTRACT_TEST_CONSECUTIVE_LOGS = `
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

const CONTRACT_TEST_MULTPLE_LOGS = `
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

export const artifactTestRequires = compileString(CONTRACT_TEST_REQUIRES);
export const artifactTestSingleFunction = compileString(CONTRACT_TEST_REQUIRE_SINGLE_FUNCTION);
export const artifactTestMultilineRequires = compileString(CONTRACT_TEST_MULTILINE_REQUIRES);
export const artifactTestZeroHandling = compileString(CONTRACT_TEST_ZERO_HANDLING);
export const artifactTestLogs = compileString(CONTRACT_TEST_LOGS);
export const artifactTestConsecutiveLogs = compileString(CONTRACT_TEST_CONSECUTIVE_LOGS);
export const artifactTestMultipleLogs = compileString(CONTRACT_TEST_MULTPLE_LOGS);
