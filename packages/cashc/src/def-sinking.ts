import {
  SourceFileNode,
  FunctionDefinitionNode,
  BlockNode,
  StatementNode,
  Node,
  VariableDefinitionNode,
  TupleAssignmentNode,
  AssignNode,
  ReturnNode,
  ConsoleStatementNode,
  ControlStatementNode,
  BranchNode,
  DoWhileNode,
  WhileNode,
  ForNode,
  ExpressionNode,
  IdentifierNode,
  FunctionCallNode,
  InstantiationNode,
} from './ast/AST.js';
import { Modifier } from './ast/Globals.js';
import AstTraversal from './ast/AstTraversal.js';

// Moves each variable definition down its block to just before the statement that first uses
// it. A definition compiles to a rename of the value its initializer leaves on top of the
// stack, so sinking shrinks live ranges: intervening reads get shallower depth arguments and a
// single-use definition's access pair collapses in the peephole. The reorder can change which
// require() fails first on an invalid witness and the order of console.log output — never
// whether a transaction is accepted.
//
// Byte-size optimisation, gated behind `optimizeFor: 'size'`: relocating evaluation deepens the
// initializer's own input reads, and under ROLL/PICK depth metering the executed-op-cost
// balance of that trade is workload-dependent. Runs before semantic analysis so the final-use
// bookkeeping (opRolls) sees the reordered statements.

export function sinkDefinitions(ast: SourceFileNode): SourceFileNode {
  ast.functions.forEach(sinkInFunction);
  ast.contract?.functions.forEach((func: FunctionDefinitionNode) => sinkInFunction(func));
  return ast;
}

function sinkInFunction(func: FunctionDefinitionNode): void {
  const reassigned = collectReassignedNames(func.body);
  sinkInBlock(func.body, reassigned);
}

// A definition (scalar, or tuple-destructure declaring only new variables) normalised to the
// names it introduces and the free variables its initializer reads.
interface SinkableDefinition {
  names: Set<string>;
  freeVariables: Set<string>;
}

function asSinkableDefinition(
  statement: StatementNode,
  reassigned: Set<string>,
): SinkableDefinition | undefined {
  if (statement instanceof VariableDefinitionNode) {
    // `unused` definitions have no use site; reassigned variables keep their definition point.
    if (statement.modifiers.includes(Modifier.UNUSED)) return undefined;
    if (reassigned.has(statement.name)) return undefined;
    return { names: new Set([statement.name]), freeVariables: collectReferences(statement.expression).references };
  }

  if (statement instanceof TupleAssignmentNode) {
    if (statement.targets.some((target) => target.isReassignment)) return undefined;
    if (statement.targets.some((target) => reassigned.has(target.name))) return undefined;
    return {
      names: new Set(statement.targets.map((target) => target.name)),
      freeVariables: collectReferences(statement.tuple).references,
    };
  }

  return undefined;
}

function sinkInBlock(block: BlockNode, reassigned: Set<string>): void {
  const statements = block.statements;
  if (!statements) return;

  // Each nested block sinks independently; a definition never crosses a scope boundary.
  statements.forEach((statement) => sinkInNestedBlocks(statement, reassigned));
  if (statements.length < 2) return;

  const facts = statements.map(computeStatementFacts);

  // Nothing may move past the block's last non-console statement, which semantic analysis
  // requires to stay a require (contract functions) or return (returning global functions).
  let lastEffective = statements.length - 1;
  while (lastEffective >= 0 && statements[lastEffective] instanceof ConsoleStatementNode) {
    lastEffective -= 1;
  }

  // Bottom-up, so a chain `int a = ...; int b = f(a);` sinks as a whole in one pass.
  for (let i = statements.length - 2; i >= 0; i -= 1) {
    const definition = asSinkableDefinition(statements[i], reassigned);
    if (definition === undefined) continue;

    let target = i;
    while (target + 1 <= lastEffective) {
      const next = facts[target + 1];
      if (intersects(next.references, definition.names)) break; // first use — land just above it
      if (next.barrier) break;
      if (intersects(next.assigns, definition.freeVariables)) break; // initializer input changes
      if (target + 1 === lastEffective) break;
      target += 1;
    }

    if (target > i) {
      const [statement] = statements.splice(i, 1);
      statements.splice(target, 0, statement);
      const [fact] = facts.splice(i, 1);
      facts.splice(target, 0, fact);
    }
  }
}

// Branch and loop children are typed as BlockNode but braceless bodies (`if (x) require(y);`,
// `else if` chains) are bare statements, so dispatch on the actual node.
function sinkInNestedBlocks(statement: StatementNode, reassigned: Set<string>): void {
  if (statement instanceof BranchNode) {
    sinkInChild(statement.ifBlock, reassigned);
    if (statement.elseBlock) sinkInChild(statement.elseBlock, reassigned);
  } else if (statement instanceof DoWhileNode || statement instanceof WhileNode || statement instanceof ForNode) {
    sinkInChild(statement.block, reassigned);
  }
}

function sinkInChild(child: Node, reassigned: Set<string>): void {
  if (child instanceof BlockNode) sinkInBlock(child, reassigned);
  else sinkInNestedBlocks(child as StatementNode, reassigned);
}

interface StatementFacts {
  references: Set<string>;
  assigns: Set<string>;
  barrier: boolean;
}

function computeStatementFacts(statement: StatementNode): StatementFacts {
  const { references, assigns, defines } = collectReferences(statement);
  const barrier = statement instanceof ControlStatementNode
    || statement instanceof ReturnNode
    || (statement instanceof TupleAssignmentNode && statement.targets.some((target) => target.isReassignment));
  return { references, assigns: new Set([...assigns, ...defines]), barrier };
}

function collectReferences(node: ExpressionNode | StatementNode): ReferenceCollector {
  const collector = new ReferenceCollector();
  collector.visit(node);
  return collector;
}

const intersects = (a: Set<string>, b: Set<string>): boolean => {
  for (const element of a) if (b.has(element)) return true;
  return false;
};

// Records every variable referenced and every variable assigned anywhere in a statement.
// Console parameters count as references (codegen needs logged variables on the stack);
// callee names of calls and instantiations do not — they are not stack variables.
class ReferenceCollector extends AstTraversal {
  references = new Set<string>();
  assigns = new Set<string>();
  defines = new Set<string>();

  visitIdentifier(node: IdentifierNode): Node {
    this.references.add(node.name);
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitAssign(node: AssignNode): Node {
    this.assigns.add(node.identifier.name);
    return super.visitAssign(node);
  }

  // Definition-introduced names are tracked separately from reassignments: the sink barrier must
  // treat them like assigns (a sunk definition may never move past a later definition of one of
  // its inputs — otherwise sinking would launder a use-before-definition program, rejected by the
  // source-ordered compile, into one that compiles), while collectReassignedNames must not (a
  // definition alone does not pin a variable in place).
  visitVariableDefinition(node: VariableDefinitionNode): Node {
    this.defines.add(node.name);
    return super.visitVariableDefinition(node);
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    node.targets.forEach((target) => {
      if (target.isReassignment) {
        this.assigns.add(target.name);
        this.references.add(target.name);
      } else {
        this.defines.add(target.name);
      }
    });
    return super.visitTupleAssignment(node);
  }
}

function collectReassignedNames(body: BlockNode): Set<string> {
  const collector = new ReferenceCollector();
  collector.visit(body);
  return collector.assigns;
}
