/*   simulation.test.ts
 *
 * - This file is used to test the simulation of operations
 */

import delay from 'delay';
import { applyUnaryOperator, applyBinaryOperator } from '../../src/optimisations/OperationSimulations';
import { UnaryOperator, BinaryOperator } from '../../src/ast/Operator';
import {
  IntLiteralNode,
  BoolLiteralNode,
  StringLiteralNode,
  HexLiteralNode,
} from '../../src/ast/AST';
import { fixtures } from './fixtures';
import { ExecutionError } from '../../src/Errors';

describe('Operation simulation', () => {
  beforeAll(async () => {
    await delay(100);
  });

  describe('applyUnaryOperator', () => {
    fixtures.applyUnaryOperator.bool.success.forEach(([should, input, expected]: any) => {
      it(should as string, () => {
        // when
        const res = applyUnaryOperator(UnaryOperator.NOT, new BoolLiteralNode(input as boolean));

        // then
        expect(res).toBeInstanceOf(BoolLiteralNode);
        expect((res as BoolLiteralNode).value).toBe(expected);
      });
    });

    fixtures.applyUnaryOperator.int.success.forEach(([should, input, expected]: any) => {
      it(should as string, () => {
        // when
        const res = applyUnaryOperator(UnaryOperator.NEGATE, new IntLiteralNode(input as number));

        // then
        expect(res).toBeInstanceOf(IntLiteralNode);
        expect((res as IntLiteralNode).value).toBe(expected);
      });
    });

    fixtures.applyUnaryOperator.int.fail.forEach(([should, input, expected]: any) => {
      it(should as string, () => {
        expect(() => {
          // when
          applyUnaryOperator(UnaryOperator.NEGATE, new IntLiteralNode(input as number));

          // then
        }).toThrow(new ExecutionError(expected as string));
      });
    });
  });

  describe('applyBinaryOperator', () => {
    fixtures.applyBinaryOperator.bool.success
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          // when
          const res = applyBinaryOperator(
            new BoolLiteralNode(left as boolean),
            op as BinaryOperator,
            new BoolLiteralNode(right as boolean),
          );

          // then
          expect(res).toBeInstanceOf(BoolLiteralNode);
          expect((res as BoolLiteralNode).value).toBe(expected);
        });
      });

    fixtures.applyBinaryOperator.int.success
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          // when
          const res = applyBinaryOperator(
            new IntLiteralNode(left as number),
            op as BinaryOperator,
            new IntLiteralNode(right as number),
          );

          // then
          const expectedNode = typeof expected === 'boolean'
            ? new BoolLiteralNode(expected)
            : new IntLiteralNode(expected);
          expect(res).toEqual(expectedNode);
        });
      });

    fixtures.applyBinaryOperator.int.fail
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          expect(() => {
            // when
            applyBinaryOperator(
              new IntLiteralNode(left as number),
              op as BinaryOperator,
              new IntLiteralNode(right as number),
            );

            // then
          }).toThrow(new ExecutionError(expected as string));
        });
      });

    fixtures.applyBinaryOperator.string.success
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          // when
          const res = applyBinaryOperator(
            new StringLiteralNode(left as string, '"'),
            op as BinaryOperator,
            new StringLiteralNode(right as string, '"'),
          );

          // then
          const expectedNode = typeof expected === 'boolean'
            ? new BoolLiteralNode(expected)
            : new StringLiteralNode(expected, '"');
          expect(res).toEqual(expectedNode);
        });
      });

    fixtures.applyBinaryOperator.string.fail
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          expect(() => {
            // when
            applyBinaryOperator(
              new StringLiteralNode(left as string, '"'),
              op as BinaryOperator,
              new StringLiteralNode(right as string, '"'),
            );

            // then
          }).toThrow(new ExecutionError(expected as string));
        });
      });

    fixtures.applyBinaryOperator.hex.success
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          // when
          const res = applyBinaryOperator(
            new HexLiteralNode(Buffer.from(left, 'hex')),
            op as BinaryOperator,
            new HexLiteralNode(Buffer.from(right, 'hex')),
          );

          // then
          const expectedNode = typeof expected === 'boolean'
            ? new BoolLiteralNode(expected)
            : new HexLiteralNode(Buffer.from(expected, 'hex'));
          expect(res).toEqual(expectedNode);
        });
      });

    fixtures.applyBinaryOperator.hex.fail
      .forEach(([should, left, op, right, expected]: any) => {
        it(should as string, () => {
          expect(() => {
            // when
            applyBinaryOperator(
              new HexLiteralNode(Buffer.from(left, 'hex')),
              op as BinaryOperator,
              new HexLiteralNode(Buffer.from(right, 'hex')),
            );

            // then
          }).toThrow(new ExecutionError(expected as string));
        });
      });
  });
});
