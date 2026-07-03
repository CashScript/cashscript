import { binToHex } from '@bitauth/libauth';
import { encodeInt, scriptToBytecode } from '@cashscript/utils';
import {
  SourceFileNode,
  FunctionDefinitionNode,
  BlockNode,
  LiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  IdentifierNode,
  VariableDefinitionNode,
  ParameterNode,
  TupleAssignmentNode,
  Node,
} from './ast/AST.js';
import AstTraversal from './ast/AstTraversal.js';

// Byte-size optimisation with an op-cost trade-off, so gated behind `optimizeFor: 'size'`:
// a literal that occurs two or more times within one function body is bound to a local at the
// top of the body when that is cheaper by exact byte accounting, and the occurrences become
// identifier references. The second and later uses then cost a stack pick instead of re-pushing
// the literal (~-30 bytes per duplicate of a 32-byte field prime), at the price of a couple of
// extra ops per call for the binding and cleanup.
//
// That trade is right for size-scored contracts and wrong for op-bound ones (where unlocking
// scripts are zero-padded to buy op budget, byte savings are free anyway and the extra ops
// translate directly into more padding) — hence the default 'opcost' objective skips it.
//
// Runs after constant folding (so uses of top-level constants are already literals here) and
// before semantic analysis (so the introduced locals get symbols like any other variable).

export function hoistRepeatedConstants(ast: SourceFileNode): SourceFileNode {
  ast.functions.forEach((func) => hoistInBody(func.body));
  ast.contract?.functions.forEach((func: FunctionDefinitionNode) => hoistInBody(func.body));
  return ast;
}

// Exact byte accounting: replacing each duplicate push with an identifier access costs about
// 2 bytes (depth + OP_PICK; the declaration itself re-uses the first push) plus ~1 byte of
// end-of-scope cleanup, so hoisting pays when the duplicates' push bytes beat that overhead.
const worthHoisting = (pushBytes: number, count: number): boolean => (count - 1) * pushBytes > 2 * (count - 1) + 1;

function hoistInBody(body: BlockNode): void {
  if (!body.statements || body.statements.length === 0) return;

  const counter = new LiteralCounter();
  counter.visit(body);

  const hoisted = [...counter.literals.values()]
    .filter(({ pushBytes, count }) => worthHoisting(pushBytes, count));
  if (hoisted.length === 0) return;

  // Fresh local names that collide with nothing already named in the body.
  const names = new Map<string, string>();
  let n = 0;
  for (const { key } of hoisted) {
    while (counter.usedNames.has(`hc${n}`)) n += 1;
    names.set(key, `hc${n}`);
    n += 1;
  }

  new LiteralReplacer(names).visit(body);

  // Declarations go at the very top of the body; source locations borrow from the first
  // statement so source-map generation always has a valid location to point at.
  const location = body.statements[0].location;
  const declarations = hoisted.map(({ key, template }) => {
    const literal = cloneLiteral(template);
    literal.location = location;
    const definition = new VariableDefinitionNode(template.type!, [], names.get(key)!, literal);
    definition.location = location;
    return definition;
  });
  body.statements.unshift(...declarations);
}

type Hoistable = IntLiteralNode | HexLiteralNode;

const literalKey = (node: Hoistable): string => (
  node instanceof IntLiteralNode ? `i${node.value}` : `x${binToHex(node.value)}`
);

const literalPushBytes = (node: Hoistable): number => (
  scriptToBytecode([node instanceof IntLiteralNode ? encodeInt(node.value) : node.value]).length
);

function cloneLiteral(node: Hoistable): LiteralNode {
  return node instanceof IntLiteralNode ? new IntLiteralNode(node.value) : new HexLiteralNode(node.value);
}

// Counts hoistable literals by value and records every name already used in the body
// (identifiers, parameters, definitions, tuple targets), so the introduced locals cannot
// shadow or be shadowed by anything.
class LiteralCounter extends AstTraversal {
  literals = new Map<string, { key: string, template: Hoistable, pushBytes: number, count: number }>();
  usedNames = new Set<string>();

  private countLiteral(node: Hoistable): void {
    const key = literalKey(node);
    const entry = this.literals.get(key);
    if (entry) entry.count += 1;
    else this.literals.set(key, { key, template: node, pushBytes: literalPushBytes(node), count: 1 });
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.countLiteral(node);
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.countLiteral(node);
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    this.usedNames.add(node.name);
    return node;
  }

  visitParameter(node: ParameterNode): Node {
    this.usedNames.add(node.name);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    this.usedNames.add(node.name);
    return super.visitVariableDefinition(node);
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    node.targets.forEach((target) => this.usedNames.add(target.name));
    return super.visitTupleAssignment(node);
  }
}

// Swaps each hoisted literal occurrence for a reference to its local. The identifier takes
// the literal's source location (same convention as constant inlining, in reverse).
class LiteralReplacer extends AstTraversal {
  constructor(private names: Map<string, string>) {
    super();
  }

  private replace(node: Hoistable): Node {
    const name = this.names.get(literalKey(node));
    if (name === undefined) return node;
    const identifier = new IdentifierNode(name);
    identifier.location = node.location;
    return identifier;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    return this.replace(node);
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    return this.replace(node);
  }
}
