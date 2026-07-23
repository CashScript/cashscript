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
  BinaryOpNode,
  UnaryOpNode,
  SliceNode,
  FunctionCallNode,
  ConsoleStatementNode,
  TimeOpNode,
  ExpressionNode,
  Node,
} from './ast/AST.js';
import { BinaryOperator, UnaryOperator } from './ast/Operator.js';
import { GlobalFunction } from './ast/Globals.js';
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
// Runs before semantic analysis, so the introduced locals get symbols like any other variable.
// Only raw literals are targeted: uses of named top-level constants are still identifiers at
// this point, and repeated large constants are already deduplicated by the shared-definition
// mechanism (LowerGlobalConstantsTraversal + OP_DEFINE/OP_INVOKE sharing).
//
// Several later passes pattern-match literal nodes in specific syntactic positions, so those
// occurrences must keep their literal shape and are excluded from both counting and replacement
// (see ExcludedLiteralCollector). The pass is additionally guarded in compileCode: the hoisted
// compile is only kept when the final artifact is strictly smaller than the unhoisted one.

export function hoistRepeatedConstants(ast: SourceFileNode): SourceFileNode {
  ast.functions.forEach((func) => hoistInBody(func.body, func.parameters));
  ast.contract?.functions.forEach((func: FunctionDefinitionNode) => hoistInBody(func.body, func.parameters));
  return ast;
}

// Exact byte accounting: replacing each duplicate push with an identifier access costs about
// 2 bytes (depth + OP_PICK; the declaration itself re-uses the first push) plus ~1 byte of
// end-of-scope cleanup, so hoisting pays when the duplicates' push bytes beat that overhead.
const worthHoisting = (pushBytes: number, count: number): boolean => (count - 1) * pushBytes > 2 * (count - 1) + 1;

function hoistInBody(body: BlockNode, parameters: ParameterNode[]): void {
  if (!body.statements || body.statements.length === 0) return;

  const excluded = collectExcludedLiterals(body);

  const counter = new LiteralCounter(excluded);
  // Parameters live outside the body, so seed their names explicitly — a parameter named `hc0`
  // must not collide with a generated local.
  parameters.forEach((parameter) => counter.usedNames.add(parameter.name));
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

  new LiteralReplacer(names, excluded).visit(body);

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

function collectExcludedLiterals(body: BlockNode): Set<Node> {
  const collector = new ExcludedLiteralCollector();
  collector.visit(body);
  return collector.excluded;
}

// Split bounds and bit-shift counts: TypeCheckTraversal keys bounded-type inference and the
// static IndexOutOfBoundsError / BitshiftBitcountNegativeError checks on a literal right operand.
const BOUND_SENSITIVE_OPERATORS = [BinaryOperator.SPLIT, BinaryOperator.SHIFT_LEFT, BinaryOperator.SHIFT_RIGHT];

const isSizeOp = (node: ExpressionNode): boolean => (
  node instanceof UnaryOpNode && node.operator === UnaryOperator.SIZE
);

// Marks the literal occurrences that later passes pattern-match syntactically, and which must
// therefore stay literals (they take part in neither counting nor replacement):
//  - split / bit-shift right operands and slice bounds — bounded-type inference and static
//    bounds checks in TypeCheckTraversal require literal nodes there;
//  - toPaddedBytes size arguments — inferPaddedBytesType reads a literal second parameter;
//  - literals compared against `.length` — TypeCheckTraversal narrows unbounded bytes from them;
//  - console statement parameters — logs are stripped from the real bytecode, so hoisting them
//    would materialise debug-only data as live stack values;
//  - tx.time / this.age operands — InjectLocktimeGuardTraversal's isLocktimeCheck heuristic
//    keys on a literal operand, and replacing it triggers a synthetic guard.
class ExcludedLiteralCollector extends AstTraversal {
  excluded = new Set<Node>();

  private exclude(node: Node | undefined): void {
    if (node instanceof IntLiteralNode || node instanceof HexLiteralNode) this.excluded.add(node);
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    if (BOUND_SENSITIVE_OPERATORS.includes(node.operator)) this.exclude(node.right);
    if (isSizeOp(node.left)) this.exclude(node.right);
    if (isSizeOp(node.right)) this.exclude(node.left);
    return super.visitBinaryOp(node);
  }

  visitSlice(node: SliceNode): Node {
    this.exclude(node.start);
    this.exclude(node.end);
    return super.visitSlice(node);
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    if (node.identifier.name === GlobalFunction.TO_PADDED_BYTES) this.exclude(node.parameters[1]);
    return super.visitFunctionCall(node);
  }

  visitConsoleStatement(node: ConsoleStatementNode): Node {
    node.parameters.forEach((parameter) => this.exclude(parameter));
    return node;
  }

  visitTimeOp(node: TimeOpNode): Node {
    this.exclude(node.expression);
    return super.visitTimeOp(node);
  }
}

// Counts hoistable literals by value and records every name already used in the body
// (identifiers, parameters, definitions, tuple targets), so the introduced locals cannot
// shadow or be shadowed by anything.
class LiteralCounter extends AstTraversal {
  literals = new Map<string, { key: string, template: Hoistable, pushBytes: number, count: number }>();
  usedNames = new Set<string>();

  constructor(private excluded: Set<Node>) {
    super();
  }

  private countLiteral(node: Hoistable): void {
    if (this.excluded.has(node)) return;
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
  constructor(private names: Map<string, string>, private excluded: Set<Node>) {
    super();
  }

  private replace(node: Hoistable): Node {
    if (this.excluded.has(node)) return node;
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
