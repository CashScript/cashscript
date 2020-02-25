import { BinaryOperator } from '../../src/ast/Operator';
import { GlobalFunction } from '../../src/ast/Globals';

const MAXINT = 2147483647;

enum Error {
  DIVIDE_BY_ZERO = 'Program attempted to divide a number by zero.',
  INVALID_SCRIPT_NUMBER = 'Invalid input: this operation requires a valid Script Number.',
  ATTEMPTED_BIG_PUSH = 'Program attempted to push a stack item which exceeded the maximum stack item length (520 bytes).',
  FAILED_VERIFY = 'Program failed an OP_VERIFY operation.',
  IMPROPERLY_ENCODED_SIG = 'Encountered an improperly encoded signature.',
  NULLFAIL = 'Program failed a signature verification with a non-null signature (violating the "NULLFAIL" rule).',
}

// (https://kjur.github.io/jsrsasign/sample/sample-ecdsa.html)
const SigCheck = {
  privateKey: '0xce0505a758bcdc077280ec5ba3784ebb379222bc174a43085f1175e07567ca48',
  publicKey: '0x02037f06dfa5fce0aad70228758c6943d65dfda55fee3be6378803faca367f93a7',
  message: '0x4372616967205772696768742069732061206c69617220616e642061206672617564',
  signature: '0x304502210084aa14c5b64d398139123681eab5f7ce7c31ea2ef2617ac48a8e5d4c90b7802002200783fcf94417bf7c519126f70dea77caa097ed1e5d5a988f7c61799a72601e83',
};

export const fixtures = {
  applyUnaryOperator: {
    bool: {
      success: [
        ['should apply !true', true, false],
        ['should apply !false', false, true],
      ],
    },
    int: {
      success: [
        ['should apply -10', 10, -10],
        ['should apply -(-10)', -10, 10],
        ['should apply -MAXINT', MAXINT, -MAXINT],
        ['should apply -(-MAXINT)', -MAXINT, MAXINT],
        ['should apply -0', 0, 0],
        ['should apply -(-0)', -0, 0],
      ],
      fail: [
        ['should fail on -(MAXINT + 1)', MAXINT + 1, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on -(-MAXINT - 1)', -MAXINT - 1, Error.INVALID_SCRIPT_NUMBER],
      ],
    },
  },
  applyBinaryOperator: {
    bool: {
      success: [
        ['should apply true && false', true, BinaryOperator.AND, false, false],
        ['should apply true && true', true, BinaryOperator.AND, true, true],
        ['should apply false && false', false, BinaryOperator.AND, false, false],
        ['should apply true || false', true, BinaryOperator.OR, false, true],
        ['should apply true || true', true, BinaryOperator.OR, true, true],
        ['should apply false || false', false, BinaryOperator.OR, false, false],
      ],
    },
    int: {
      success: [
        // DIV
        ['should apply 27 / 7', 27, BinaryOperator.DIV, 7, 3],
        ['should apply 27 / (-7)', 27, BinaryOperator.DIV, -7, -3],
        ['should apply (-27) / 7', -27, BinaryOperator.DIV, 7, -3],
        ['should apply (-27) / (-7)', -27, BinaryOperator.DIV, -7, 3],
        ['should apply MAXINT / MAXINT', MAXINT, BinaryOperator.DIV, MAXINT, 1],
        ['should apply 1 / MAXINT', 1, BinaryOperator.DIV, MAXINT, 0],
        ['should apply (-MAXINT) / MAXINT', -MAXINT, BinaryOperator.DIV, MAXINT, -1],
        ['should apply (-1) / MAXINT', -1, BinaryOperator.DIV, MAXINT, 0],
        // MOD
        ['should apply 27 % 7', 27, BinaryOperator.MOD, 7, 6],
        ['should apply 27 % (-7)', 27, BinaryOperator.MOD, -7, 6],
        ['should apply (-27) % 7', -27, BinaryOperator.MOD, 7, -6],
        ['should apply (-27) % (-7)', -27, BinaryOperator.MOD, -7, -6],
        ['should apply MAXINT % MAXINT', MAXINT, BinaryOperator.MOD, MAXINT, 0],
        ['should apply 1 % MAXINT', 1, BinaryOperator.MOD, MAXINT, 1],
        ['should apply (-MAXINT) % MAXINT', -MAXINT, BinaryOperator.MOD, MAXINT, 0],
        ['should apply (-1) % MAXINT', -1, BinaryOperator.MOD, MAXINT, -1],
        // PLUS
        ['should apply 27 + 7', 27, BinaryOperator.PLUS, 7, 34],
        ['should apply 27 + (-7)', 27, BinaryOperator.PLUS, -7, 20],
        ['should apply (-27) + 7', -27, BinaryOperator.PLUS, 7, -20],
        ['should apply (-27) + (-7)', -27, BinaryOperator.PLUS, -7, -34],
        ['should apply 1 + MAXINT', 1, BinaryOperator.PLUS, MAXINT, MAXINT + 1],
        ['should apply (-MAXINT) + MAXINT', -MAXINT, BinaryOperator.PLUS, MAXINT, 0],
        // MINUS
        ['should apply 27 - 7', 27, BinaryOperator.MINUS, 7, 20],
        ['should apply 27 - (-7)', 27, BinaryOperator.MINUS, -7, 34],
        ['should apply (-27) - 7', -27, BinaryOperator.MINUS, 7, -34],
        ['should apply (-27) - (-7)', -27, BinaryOperator.MINUS, -7, -20],
        ['should apply (-1) - MAXINT', -1, BinaryOperator.MINUS, MAXINT, -MAXINT - 1],
        ['should apply MAXINT - MAXINT', MAXINT, BinaryOperator.MINUS, MAXINT, 0],
        // LT
        ['should apply 5 < 4', 5, BinaryOperator.LT, 4, false],
        ['should apply 4 < 4', 4, BinaryOperator.LT, 4, false],
        ['should apply 3 < 4', 3, BinaryOperator.LT, 4, true],
        // LE
        ['should apply 5 <= 4', 5, BinaryOperator.LE, 4, false],
        ['should apply 4 <= 4', 4, BinaryOperator.LE, 4, true],
        ['should apply 3 <= 4', 3, BinaryOperator.LE, 4, true],
        // GT
        ['should apply 5 > 4', 5, BinaryOperator.GT, 4, true],
        ['should apply 4 > 4', 4, BinaryOperator.GT, 4, false],
        ['should apply 3 > 4', 3, BinaryOperator.GT, 4, false],
        // GE
        ['should apply 5 >= 4', 5, BinaryOperator.GE, 4, true],
        ['should apply 4 >= 4', 4, BinaryOperator.GE, 4, true],
        ['should apply 3 >= 4', 3, BinaryOperator.GE, 4, false],
        // EQ
        ['should apply 5 == 4', 5, BinaryOperator.EQ, 4, false],
        ['should apply 4 == 4', 4, BinaryOperator.EQ, 4, true],
        ['should apply 3 == 4', 3, BinaryOperator.EQ, 4, false],
        // NE
        ['should apply 5 != 4', 5, BinaryOperator.NE, 4, true],
        ['should apply 4 != 4', 4, BinaryOperator.NE, 4, false],
        ['should apply 3 != 4', 3, BinaryOperator.NE, 4, true],
      ],
      fail: [
        // DIV
        ['should fail on 27 / 0', 27, BinaryOperator.DIV, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on MAXINT / 0', MAXINT, BinaryOperator.DIV, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on (-MAXINT) / 0', -MAXINT, BinaryOperator.DIV, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on 0 / 0', 0, BinaryOperator.DIV, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on (MAXINT + 1) / 2', MAXINT + 1, BinaryOperator.DIV, 2, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) / 2', -MAXINT - 1, BinaryOperator.DIV, 2, Error.INVALID_SCRIPT_NUMBER],
        // MOD
        ['should fail on 27 % 0', 27, BinaryOperator.MOD, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on MAXINT % 0', MAXINT, BinaryOperator.MOD, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on (-MAXINT) % 0', -MAXINT, BinaryOperator.MOD, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on 0 % 0', 0, BinaryOperator.MOD, 0, Error.DIVIDE_BY_ZERO],
        ['should fail on (MAXINT + 1) % 2', MAXINT + 1, BinaryOperator.MOD, 2, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) % 2', -MAXINT - 1, BinaryOperator.MOD, 2, Error.INVALID_SCRIPT_NUMBER],
        // PLUS
        ['should fail on (MAXINT + 1) + 1', MAXINT + 1, BinaryOperator.PLUS, 1, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) + 1', -MAXINT - 1, BinaryOperator.PLUS, 1, Error.INVALID_SCRIPT_NUMBER],
        // MINUS
        ['should fail on (MAXINT + 1) - 1', MAXINT + 1, BinaryOperator.MINUS, 1, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) - 1', -MAXINT - 1, BinaryOperator.MINUS, 1, Error.INVALID_SCRIPT_NUMBER],
        // LT
        ['should fail on MAXINT + 1 < 4', MAXINT + 1, BinaryOperator.LT, 4, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) < 4', -MAXINT - 1, BinaryOperator.LT, 4, Error.INVALID_SCRIPT_NUMBER],
        // LE
        ['should fail on MAXINT + 1 <= 4', MAXINT + 1, BinaryOperator.LE, 4, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) <= 4', -MAXINT - 1, BinaryOperator.LE, 4, Error.INVALID_SCRIPT_NUMBER],
        // GT
        ['should fail on MAXINT + 1 > 4', MAXINT + 1, BinaryOperator.GT, 4, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) > 4', -MAXINT - 1, BinaryOperator.GT, 4, Error.INVALID_SCRIPT_NUMBER],
        // GE
        ['should fail on MAXINT + 1 >= 4', MAXINT + 1, BinaryOperator.GE, 4, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) >= 4', -MAXINT - 1, BinaryOperator.GE, 4, Error.INVALID_SCRIPT_NUMBER],
        // EQ
        ['should fail on MAXINT + 1 == 4', MAXINT + 1, BinaryOperator.EQ, 4, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) == 4', -MAXINT - 1, BinaryOperator.EQ, 4, Error.INVALID_SCRIPT_NUMBER],
        // NE
        ['should fail on MAXINT + 1 != 4', MAXINT + 1, BinaryOperator.NE, 4, Error.INVALID_SCRIPT_NUMBER],
        ['should fail on (-MAXINT - 1) != 4', -MAXINT - 1, BinaryOperator.NE, 4, Error.INVALID_SCRIPT_NUMBER],
      ],
    },
    string: {
      success: [
        // PLUS
        ['should apply "Chancellor on brink of " + "second bailout for banks"',
          'Chancellor on brink of ', BinaryOperator.PLUS, 'second bailout for banks',
          'Chancellor on brink of second bailout for banks'],
        ['should apply "" + ""', '', BinaryOperator.PLUS, '', ''],
        ['should apply almost_maxlen_x + "X"', 'X'.repeat(519), BinaryOperator.PLUS, 'X', 'X'.repeat(520)],
        ['should apply maxlen_x + ""', 'X'.repeat(520), BinaryOperator.PLUS, '', 'X'.repeat(520)],
        ['should apply "" + maxlen_x', '', BinaryOperator.PLUS, 'X'.repeat(520), 'X'.repeat(520)],
        // EQ
        ['should apply "BCH" == "BCH"', 'BCH', BinaryOperator.EQ, 'BCH', true],
        ['should apply "BCH" == "BTC"', 'BCH', BinaryOperator.EQ, 'BTC', false],
        ['should apply "BCH" == "BSV"', 'BCH', BinaryOperator.EQ, 'BSV', false],
        // NE
        ['should apply "BCH" != "BCH"', 'BCH', BinaryOperator.NE, 'BCH', false],
        ['should apply "BCH" != "BTC"', 'BCH', BinaryOperator.NE, 'BTC', true],
        ['should apply "BCH" != "BSV"', 'BCH', BinaryOperator.NE, 'BSV', true],
      ],
      fail: [
        // PLUS
        ['should fail on maxlen_x + "X"', 'X'.repeat(520), BinaryOperator.PLUS, 'X', Error.ATTEMPTED_BIG_PUSH],
        ['should fail on large_x + large_y', 'X'.repeat(260), BinaryOperator.PLUS, 'Y'.repeat(261), Error.ATTEMPTED_BIG_PUSH],
      ],
    },
    hex: {
      success: [
        // PLUS
        ['should apply 0xdead + 0xbeef', 'dead', BinaryOperator.PLUS, 'beef', 'deadbeef'],
        ['should apply 0x + 0x', '', BinaryOperator.PLUS, '', ''],
        ['should apply almost_maxlen_x + 0x58', '58'.repeat(519), BinaryOperator.PLUS, '58', '58'.repeat(520)],
        ['should apply maxlen_x + 0x', '58'.repeat(520), BinaryOperator.PLUS, '', '58'.repeat(520)],
        ['should apply 0x + maxlen_x', '', BinaryOperator.PLUS, '58'.repeat(520), '58'.repeat(520)],
        // EQ
        ['should apply 0x424348 == 0x424348', '424348', BinaryOperator.EQ, '424348', true],
        ['should apply 0x424348 == 0x425443', '424348', BinaryOperator.EQ, '425443', false],
        ['should apply 0x424348 == 0x425356', '424348', BinaryOperator.EQ, '425356', false],
        // NE
        ['should apply 0x424348 != 0x424348', '424348', BinaryOperator.NE, '424348', false],
        ['should apply 0x424348 != 0x425443', '424348', BinaryOperator.NE, '425443', true],
        ['should apply 0x424348 != 0x425356', '424348', BinaryOperator.NE, '425356', true],
      ],
      fail: [
        // PLUS
        ['should fail on maxlen_x + 0x58', '58'.repeat(520), BinaryOperator.PLUS, '58', Error.ATTEMPTED_BIG_PUSH],
        ['should fail on large_x + large_y', '58'.repeat(260), BinaryOperator.PLUS, '59'.repeat(261), Error.ATTEMPTED_BIG_PUSH],
      ],
    },
  },
  applyGlobalFunction: {
    success: [
      // ABS
      ['should apply abs(1)', GlobalFunction.ABS, [1], 1],
      ['should apply abs(-1)', GlobalFunction.ABS, [-1], 1],
      ['should apply abs(0)', GlobalFunction.ABS, [0], 0],
      ['should apply abs(-0)', GlobalFunction.ABS, [-0], 0],
      ['should apply abs(MAXINT)', GlobalFunction.ABS, [MAXINT], MAXINT],
      ['should apply abs(-MAXINT)', GlobalFunction.ABS, [-MAXINT], MAXINT],
      // MIN
      ['should apply min(42, 43)', GlobalFunction.MIN, [42, 43], 42],
      ['should apply min(-41, -42)', GlobalFunction.MIN, [-41, -42], -42],
      ['should apply min(42, 42)', GlobalFunction.MIN, [42, 42], 42],
      ['should apply min(MAXINT, MAXINT - 1)', GlobalFunction.MIN, [MAXINT, MAXINT - 1], MAXINT - 1],
      ['should apply min(-MAXINT, -MAXINT + 1)', GlobalFunction.MIN, [-MAXINT, -MAXINT + 1], -MAXINT],
      // MAX
      ['should apply max(41, 42)', GlobalFunction.MAX, [41, 42], 42],
      ['should apply max(-42, -43)', GlobalFunction.MAX, [-42, -43], -42],
      ['should apply max(42, 42)', GlobalFunction.MAX, [42, 42], 42],
      ['should apply max(MAXINT, MAXINT - 1)', GlobalFunction.MAX, [MAXINT, MAXINT - 1], MAXINT],
      ['should apply max(-MAXINT, -MAXINT + 1)', GlobalFunction.MAX, [-MAXINT, -MAXINT + 1], -MAXINT + 1],
      // WITHIN
      ['should apply within(0, 0, 1)', GlobalFunction.WITHIN, [0, 0, 1], true],
      ['should apply within(-1, 0, 1)', GlobalFunction.WITHIN, [-1, 0, 1], false],
      ['should apply within(1, 0, 1)', GlobalFunction.WITHIN, [1, 0, 1], false],
      ['should apply within(0, -MAXINT, MAXINT)', GlobalFunction.WITHIN, [0, -MAXINT, MAXINT], true],
      // WITHIN
      ['should apply within(0, 0, 1)', GlobalFunction.WITHIN, [0, 0, 1], true],
      ['should apply within(-1, 0, 1)', GlobalFunction.WITHIN, [-1, 0, 1], false],
      ['should apply within(1, 0, 1)', GlobalFunction.WITHIN, [1, 0, 1], false],
      ['should apply within(0, -MAXINT, MAXINT)', GlobalFunction.WITHIN, [0, -MAXINT, MAXINT], true],
      // RIPEMD160
      ['should apply ripemd160(MAXINT)', GlobalFunction.RIPEMD160, [MAXINT], '0x6f16403bdabf8cf81c538fad9ede667a79d110c2'],
      ['should apply ripemd160(MAXINT + 1)', GlobalFunction.RIPEMD160, [MAXINT + 1], '0xa4fb59ff07445e291b2aadcfe5ff07e66bcd59c7'],
      ['should apply ripemd160("Bitcoin Cash")', GlobalFunction.RIPEMD160, ['Bitcoin Cash'], '0x780e2f7d61a3656b798469deb77217c2f74fbe07'],
      ['should apply ripemd160(0xbeef)', GlobalFunction.RIPEMD160, ['0xbeef'], '0x80bfa1e5e3df329b05042b3b00f6ceb823869644'],
      // SHA1
      ['should apply sha1(MAXINT)', GlobalFunction.SHA1, [MAXINT], '0xf8cc915cc37c33ac4821bef67546385089e61a28'],
      ['should apply sha1(MAXINT + 1)', GlobalFunction.SHA1, [MAXINT + 1], '0x8a15949805d1f859ee2eb8621285c8751cd4b840'],
      ['should apply sha1("Bitcoin Cash")', GlobalFunction.SHA1, ['Bitcoin Cash'], '0xfec4fda3473ceb5ebf9e4c2144d00a50f4e3a326'],
      ['should apply sha1(0xbeef)', GlobalFunction.SHA1, ['0xbeef'], '0x536391604f507559af68c402bff2ca9f8f5a0b66'],
      // SHA256
      ['should apply sha256(MAXINT)', GlobalFunction.SHA256, [MAXINT], '0xa2c70538651a7e9296b097e8c3dfc1b195a945802ffe45aa471868fba6f1042e'],
      ['should apply sha256(MAXINT + 1)', GlobalFunction.SHA256, [MAXINT + 1], '0xe78d3dd142c149e0d63d8456546e562ad0fcf348b1dbd2721fd599e82bea503a'],
      ['should apply sha256("Bitcoin Cash")', GlobalFunction.SHA256, ['Bitcoin Cash'], '0x8a9851255d671c4e0ac3ad525ad0ff595cb31a1ad85327a77df3d15129b0a245'],
      ['should apply sha256(0xbeef)', GlobalFunction.SHA256, ['0xbeef'], '0x17e117288642879110850b62f83cb13d07e7961e321c1c762ff5e5ab83029c7c'],
      // HASH160
      ['should apply hash160(MAXINT)', GlobalFunction.HASH160, [MAXINT], '0xdcf9155897114017018437a6068c7de036fe16a2'],
      ['should apply hash160(MAXINT + 1)', GlobalFunction.HASH160, [MAXINT + 1], '0x82b956f8d10ef7e818ea574b5f60b1e16d653273'],
      ['should apply hash160("Bitcoin Cash")', GlobalFunction.HASH160, ['Bitcoin Cash'], '0x2d74b8d22f4c09d36f7d22e6cf1c796dcaee272a'],
      ['should apply hash160(0xbeef)', GlobalFunction.HASH160, ['0xbeef'], '0x0514fea7ae9f4fa3c4d2db22b196ca26e1bffc94'],
      // HASH256
      ['should apply hash256(MAXINT)', GlobalFunction.HASH256, [MAXINT], '0x13f876b544a4baf1867dcb3f52f2c096cea373e0659ab046f55596b045ac4ffb'],
      ['should apply hash256(MAXINT + 1)', GlobalFunction.HASH256, [MAXINT + 1], '0x280846b322340fa8c0e4464d6cd8631b10685cf3a9a15325583cc934ac42bf84'],
      ['should apply hash256("Bitcoin Cash")', GlobalFunction.HASH256, ['Bitcoin Cash'], '0x00d44bd6d8ba4fd7c154ac2c073394aa3a755334992fa1b254f3f4a984f6d0fb'],
      ['should apply hash256(0xbeef)', GlobalFunction.HASH256, ['0xbeef'], '0x44ee00d701711b07ee3b4ddf7f165f6b09cd2e7c512d6d2a9a25aab487f2f740'],
      // CHECKSIG (only check empty sig)
      [`should apply checkSig(0x, ${SigCheck.publicKey})`, GlobalFunction.CHECKSIG, ['0x', SigCheck.publicKey], false],
      // TODO CHECKMULTISIG (need to refactor code generation)
      // CHECKDATASIG
      [`should apply checkDataSig(${SigCheck.signature}, ${SigCheck.message}, ${SigCheck.publicKey})`, GlobalFunction.CHECKDATASIG, [SigCheck.signature, SigCheck.message, SigCheck.publicKey], true],
      [`should apply checkDataSig(0x, ${SigCheck.message}, ${SigCheck.publicKey})`, GlobalFunction.CHECKDATASIG, ['0x', SigCheck.message, SigCheck.publicKey], false],
    ],
    fail: [
      // ABS
      ['should fail on abs(MAXINT + 1)', GlobalFunction.ABS, [MAXINT + 1], Error.INVALID_SCRIPT_NUMBER],
      ['should fail on abs(-MAXINT - 1)', GlobalFunction.ABS, [-MAXINT - 1], Error.INVALID_SCRIPT_NUMBER],
      // MIN
      ['should fail on min(-MAXINT - 1, 0)', GlobalFunction.MIN, [-MAXINT - 1, 0], Error.INVALID_SCRIPT_NUMBER],
      ['should fail on min(MAXINT + 1, 0)', GlobalFunction.MIN, [MAXINT + 1, 0], Error.INVALID_SCRIPT_NUMBER],
      // MAX
      ['should fail on max(-MAXINT - 1, 0)', GlobalFunction.MAX, [-MAXINT - 1, 0], Error.INVALID_SCRIPT_NUMBER],
      ['should fail on max(MAXINT + 1, 0)', GlobalFunction.MAX, [MAXINT + 1, 0], Error.INVALID_SCRIPT_NUMBER],
      // WITHIN
      ['should fail on within(-MAXINT - 1, 0, 1)', GlobalFunction.WITHIN, [-MAXINT - 1, 0, 1], Error.INVALID_SCRIPT_NUMBER],
      ['should fail on within(MAXINT + 1, 0, 1)', GlobalFunction.WITHIN, [MAXINT + 1, 0, 1], Error.INVALID_SCRIPT_NUMBER],
      // CHECKSIG
      [`should fail on checkSig(0x01, ${SigCheck.publicKey})`, GlobalFunction.CHECKSIG, ['0x01', SigCheck.publicKey], Error.IMPROPERLY_ENCODED_SIG],
      [`should fail on checkSig(${SigCheck.signature}41, ${SigCheck.publicKey})`, GlobalFunction.CHECKSIG, [`${SigCheck.signature}41`, SigCheck.publicKey], Error.NULLFAIL],
      // CHECKDATASIG
      [`should fail on checkDataSig(0x01, ${SigCheck.message}, ${SigCheck.publicKey})`, GlobalFunction.CHECKDATASIG, ['0x01', SigCheck.message, SigCheck.publicKey], Error.IMPROPERLY_ENCODED_SIG],
      [`should fail on checkDataSig(${SigCheck.signature.slice(0, -2)}00, ${SigCheck.message}, ${SigCheck.publicKey})`, GlobalFunction.CHECKDATASIG, [`${SigCheck.signature.slice(0, -2)}00`, SigCheck.message, SigCheck.publicKey], Error.NULLFAIL],
    ],
  },
};
