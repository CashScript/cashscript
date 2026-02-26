import {
  Ast,
  Node,
  BlockNode,
  BranchNode,
  DoWhileNode,
  ForNode,
  WhileNode,
  AssignNode,
  VariableDefinitionNode,
} from '../../src/ast/AST.js';
import AstTraversal from '../../src/ast/AstTraversal.js';
import { parseCode } from '../../src/compiler.js';
import LoopLoweringTraversal from '../../src/semantic/LoopLoweringTraversal.js';

class LoopNodeCounterTraversal extends AstTraversal {
  whileCount = 0;
  forCount = 0;
  doWhileCount = 0;

  visitWhile(node: WhileNode): Node {
    this.whileCount += 1;
    return super.visitWhile(node);
  }

  visitFor(node: ForNode): Node {
    this.forCount += 1;
    return super.visitFor(node);
  }

  visitDoWhile(node: DoWhileNode): Node {
    this.doWhileCount += 1;
    return super.visitDoWhile(node);
  }
}

function countLoopNodes(ast: Ast): LoopNodeCounterTraversal {
  const counter = new LoopNodeCounterTraversal();
  ast.accept(counter);
  return counter;
}

function lowerCode(code: string): Ast {
  const ast = parseCode(code);
  return ast.accept(new LoopLoweringTraversal()) as Ast;
}

describe('LoopLoweringTraversal', () => {
  it('should lower while loops to branch + do-while with cloned conditions', () => {
    const code = `
      contract C() {
        function f() {
          int i = 0;
          while (i < 3) {
            i = i + 1;
          }
          require(i == 3);
        }
      }
    `;

    const ast = parseCode(code);
    const originalWhile = ast.contract.functions[0].body.statements?.[1] as WhileNode;
    const originalCondition = originalWhile.condition;

    const lowered = ast.accept(new LoopLoweringTraversal()) as Ast;

    // The lowered branch statement is the second statement in the function body (after int i = 0;)
    const loweredBranch = lowered.contract.functions[0].body.statements?.[1] as BranchNode;
    const loweredDoWhile = loweredBranch.ifBlock.statements?.[0] as DoWhileNode;

    expect(loweredBranch).toBeInstanceOf(BranchNode);
    expect(loweredDoWhile).toBeInstanceOf(DoWhileNode);

    // The conditions should be distinct objects
    expect(loweredBranch.condition).not.toBe(originalCondition);
    expect(loweredDoWhile.condition).not.toBe(originalCondition);
    expect(loweredDoWhile.condition).not.toBe(loweredBranch.condition);

    // The conditions should be equal
    expect(loweredBranch.condition).toEqual(originalCondition);
    expect(loweredDoWhile.condition).toEqual(originalCondition);
    expect(loweredDoWhile.condition).toEqual(loweredBranch.condition);

    // Diagnostics should stay anchored to the original while source range.
    expect(loweredBranch.location).toBe(originalWhile.location);
    expect(loweredDoWhile.location).toBe(originalWhile.location);
    expect(loweredBranch.condition.location).toBe(originalCondition.location);
    expect(loweredDoWhile.condition.location).toBe(originalCondition.location);
  });

  it('should lower for loops to scoped init + branch + do-while + trailing update', () => {
    const code = `
      contract C() {
        function f() {
          int sum = 0;
          for (int i = 0; i < 3; i = i + 1) {
            sum = sum + i;
          }
          require(sum == 3);
        }
      }
    `;

    const ast = parseCode(code);
    const originalFor = ast.contract.functions[0].body.statements?.[1] as ForNode;
    const originalCondition = originalFor.condition;

    const lowered = ast.accept(new LoopLoweringTraversal()) as Ast;
    const scopedBlock = lowered.contract.functions[0].body.statements?.[1] as BlockNode;
    const init = scopedBlock.statements?.[0] as VariableDefinitionNode;
    const loopBranch = scopedBlock.statements?.[1] as BranchNode;
    const loweredDoWhile = loopBranch.ifBlock.statements?.[0] as DoWhileNode;
    const doWhileStatements = loweredDoWhile.block.statements ?? [];
    const finalDoWhileStatement = doWhileStatements[doWhileStatements.length - 1];

    const originalSumAdditionStatement = originalFor.block.statements?.[0] as AssignNode;
    const loweredSumAdditionStatement = loweredDoWhile.block.statements?.[0] as AssignNode;

    expect(scopedBlock).toBeInstanceOf(BlockNode);
    expect(init).toBeInstanceOf(VariableDefinitionNode);
    expect(loopBranch).toBeInstanceOf(BranchNode);
    expect(loweredDoWhile).toBeInstanceOf(DoWhileNode);
    expect(finalDoWhileStatement).toBeInstanceOf(AssignNode);

    // The conditions should be distinct objects
    expect(loopBranch.condition).not.toBe(originalCondition);
    expect(loweredDoWhile.condition).not.toBe(originalCondition);
    expect(loweredDoWhile.condition).not.toBe(loopBranch.condition);

    // The conditions should be equal
    expect(loopBranch.condition).toEqual(originalCondition);
    expect(loweredDoWhile.condition).toEqual(originalCondition);
    expect(loweredDoWhile.condition).toEqual(loopBranch.condition);

    // Diagnostics should stay anchored to the original for source range.
    expect(scopedBlock.location).toBe(originalFor.location);
    expect(loopBranch.location).toBe(originalFor.location);
    expect(loweredDoWhile.location).toBe(originalFor.location);
    expect(loopBranch.condition.location).toBe(originalCondition.location);
    expect(loweredDoWhile.condition.location).toBe(originalCondition.location);
    expect(loweredSumAdditionStatement.location).toBe(originalSumAdditionStatement.location);
  });

  it('should recursively lower nested while/for loops', () => {
    const code = `
      contract C() {
        function f() {
          int i = 0;
          while (i < 2) {
            for (int j = 0; j < 2; j = j + 1) {
              i = i + j;
            }
            i = i + 1;
          }
          require(i >= 2);
        }
      }
    `;

    const original = parseCode(code);
    const originalCounts = countLoopNodes(original);
    expect(originalCounts.whileCount).toEqual(1);
    expect(originalCounts.forCount).toEqual(1);
    expect(originalCounts.doWhileCount).toEqual(0);

    const lowered = lowerCode(code);
    const loweredCounts = countLoopNodes(lowered);
    expect(loweredCounts.whileCount).toEqual(0);
    expect(loweredCounts.forCount).toEqual(0);
    expect(loweredCounts.doWhileCount).toEqual(2);
  });

  it('should keep existing do-while loops unchanged', () => {
    const code = `
      contract C() {
        function f() {
          int i = 0;
          do {
            i = i + 1;
          } while (i < 3);
          require(i == 3);
        }
      }
    `;

    const original = parseCode(code);
    const originalDoWhile = original.contract.functions[0].body.statements?.[1] as DoWhileNode;
    const originalCounts = countLoopNodes(original);

    const lowered = original.accept(new LoopLoweringTraversal()) as Ast;
    const loweredDoWhile = lowered.contract.functions[0].body.statements?.[1] as DoWhileNode;
    const loweredCounts = countLoopNodes(lowered);

    expect(loweredCounts).toEqual(originalCounts);
    expect(loweredDoWhile.location).toBe(originalDoWhile.location);
    expect(loweredDoWhile.condition).toBe(originalDoWhile.condition);
  });
});
