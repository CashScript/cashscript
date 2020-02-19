import { BinaryOperator } from '../../src/ast/Operator';

const MAXINT = 2147483647;

enum Error {
  DIVIDE_BY_ZERO = 'Program attempted to divide a number by zero.',
  INVALID_SCRIPT_NUMBER = 'Invalid input: this operation requires a valid Script Number.',
  ATTEMPTED_BIG_PUSH = 'Program attempted to push a stack item which exceeded the maximum stack item length (520 bytes).',
}

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
};
