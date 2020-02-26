/*   simulation.test.ts
 *
 * - This file is used to test the simulation of operations
 */

import delay from 'delay';
import {
  applyUnaryOperator,
  applyBinaryOperator,
  applyGlobalFunction,
  applySizeOp,
  applyCast,
} from '../../src/optimisations/OperationSimulations';
import { UnaryOperator, BinaryOperator } from '../../src/ast/Operator';
import {
  IntLiteralNode,
  BoolLiteralNode,
  StringLiteralNode,
  HexLiteralNode,
  FunctionCallNode,
  IdentifierNode,
} from '../../src/ast/AST';
import { fixtures } from './fixtures';
import { ExecutionError } from '../../src/Errors';
import { literalToNode } from '../test-util';

describe('Operation simulation', () => {
  beforeAll(async () => {
    await delay(1000);
  });

  describe('applyCast', () => {
    fixtures.applyCast.success.forEach(([should, castType, input, expected]: any) => {
      it(should as string, () => {
        // given
        const inputNode = literalToNode(input);
        const expectedNode = literalToNode(expected);

        // when
        const res = applyCast(inputNode, castType);

        // then
        expect(res).toEqual(expectedNode);
      });
    });

    fixtures.applyCast.fail.forEach(([should, castType, input, expected]: any) => {
      it(should as string, () => {
        // given
        const inputNode = literalToNode(input);

        expect(() => {
          // when
          applyCast(inputNode, castType);

          // then
        }).toThrow(new ExecutionError(expected as string));
      });
    });
  });

  describe('applyGlobalFunction', () => {
    fixtures.applyGlobalFunction.success
      .forEach(([should, fn, parameters, expected]: any) => {
        it(should as string, () => {
          // given
          const parameterNodes = (parameters as (boolean | number | string)[]).map(literalToNode);
          const expectedNode = typeof expected === 'undefined' ? undefined : literalToNode(expected);

          // when
          const res = applyGlobalFunction(new FunctionCallNode(
            new IdentifierNode(fn as string),
            parameterNodes,
          ));

          // then
          expect(res).toEqual(expectedNode);
        });
      });

    fixtures.applyGlobalFunction.fail
      .forEach(([should, fn, parameters, expected]: any) => {
        it(should as string, () => {
          expect(() => {
            // given
            const parameterNodes = (parameters as (boolean | number | string)[]).map(literalToNode);

            // when
            applyGlobalFunction(new FunctionCallNode(
              new IdentifierNode(fn as string),
              parameterNodes,
            ));

            // then
          }).toThrow(new ExecutionError(expected as string));
        });
      });
  });

  describe('applySizeOp', () => {
    fixtures.applySizeOp.success.forEach(([should, input, expected]: any) => {
      it(should as string, () => {
        // given
        const inputNode = literalToNode(input as string);
        const expectedNode = literalToNode(expected);

        // when
        const res = applySizeOp(inputNode as StringLiteralNode | HexLiteralNode);

        // then
        expect(res).toEqual(expectedNode);
      });
    });
  });

  describe('applyBinaryOperator', () => {
    fixtures.applyBinaryOperator.success.forEach(([should, left, op, right, expected]: any) => {
      it(should as string, () => {
        // given
        const leftNode = literalToNode(left);
        const rightNode = literalToNode(right);
        const expectedNode = literalToNode(expected);

        // when
        const res = applyBinaryOperator(leftNode, op as BinaryOperator, rightNode);

        // then
        expect(res).toEqual(expectedNode);
      });
    });

    fixtures.applyBinaryOperator.fail.forEach(([should, left, op, right, expected]: any) => {
      it(should as string, () => {
        // given
        const leftNode = literalToNode(left);
        const rightNode = literalToNode(right);

        expect(() => {
          // when
          applyBinaryOperator(leftNode, op as BinaryOperator, rightNode);

          // then
        }).toThrow(new ExecutionError(expected as string));
      });
    });
  });

  describe('applyUnaryOperator', () => {
    fixtures.applyUnaryOperator.success.forEach(([should, op, input, expected]: any) => {
      it(should as string, () => {
        // given
        const inputNode = literalToNode(input as number | boolean);
        const expectedNode = literalToNode(expected);

        // when
        const res = applyUnaryOperator(
          op as UnaryOperator,
          inputNode as IntLiteralNode | BoolLiteralNode,
        );

        // then
        expect(res).toEqual(expectedNode);
      });
    });

    fixtures.applyUnaryOperator.fail.forEach(([should, op, input, expected]: any) => {
      it(should as string, () => {
        // given
        const inputNode = literalToNode(input as number | boolean);

        expect(() => {
          // when
          applyUnaryOperator(
            op as UnaryOperator,
            inputNode as IntLiteralNode | BoolLiteralNode,
          );

          // then
        }).toThrow(new ExecutionError(expected as string));
      });
    });
  });
});
