import { BIP68_SECONDS_MAX, encodeBip68, isBip68RelativeTimelock } from '@cashscript/utils';
import {
  ConstantDefinitionNode,
  ExpressionNode,
  IdentifierNode,
  IntLiteralNode,
  Node,
  TimeOpNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { TimeOp } from '../ast/Globals.js';
import { InvalidTimelockError } from '../Errors.js';
import { cloneConstantValue } from './LowerGlobalConstantsTraversal.js';

const LOCKTIME_MAX = 0xffffffffn;
const LOCKTIME_THRESHOLD = 500_000_000n;

// require(tx.time >= x) and require(this.age >= x) compile to OP_CHECKLOCKTIMEVERIFY and OP_CHECKSEQUENCEVERIFY, which
// only enforce the intended timelock for certain values of x. Values that are known at compile time are validated here,
// and this.age durations written with time units (e.g. `30 days`) are encoded as BIP68 512-second units. this.age values
// that are only known at runtime are validated at runtime instead (see GenerateTargetTraversal).
export default class ResolveTimelocksTraversal extends AstTraversal {
  visitTimeOp(node: TimeOpNode): Node {
    const literal = resolveCompileTimeInt(node.expression);

    if (node.timeOp === TimeOp.CHECK_LOCKTIME) {
      if (literal) validateAbsoluteTimelock(literal);
      return node;
    }

    if (!literal) {
      ensureNoTimeUnits(node.expression);
      return node;
    }

    node.expression = encodeRelativeTimelock(literal);
    return node;
  }
}

// Int literals and references to global int constants (which are folded to a literal) are known at compile time
function resolveCompileTimeInt(expression: ExpressionNode): IntLiteralNode | undefined {
  if (expression instanceof IntLiteralNode) return expression;
  if (!(expression instanceof IdentifierNode)) return undefined;

  const definition = expression.symbol?.definition;
  if (!(definition instanceof ConstantDefinitionNode) || !(definition.value instanceof IntLiteralNode)) return undefined;

  return cloneConstantValue(definition, expression) as IntLiteralNode;
}

function validateAbsoluteTimelock(literal: IntLiteralNode): void {
  if (literal.value < 0n || literal.value > LOCKTIME_MAX) {
    throw new InvalidTimelockError(literal, `tx.time value must be between 0 and ${LOCKTIME_MAX}, but found ${literal.value}`);
  }

  // A duration such as `2 hours` is not a UNIX timestamp, and values below 500,000,000 are treated as a block height
  if (literal.hasTimeUnit && literal.value < LOCKTIME_THRESHOLD) {
    throw new InvalidTimelockError(
      literal, `tx.time value must be a block height or a UNIX timestamp, but found a duration of ${literal.value} seconds`,
    );
  }
}

function encodeRelativeTimelock(literal: IntLiteralNode): IntLiteralNode {
  if (literal.hasTimeUnit) {
    if (literal.value < 0n || literal.value > BigInt(BIP68_SECONDS_MAX)) {
      throw new InvalidTimelockError(
        literal, `this.age duration must be between 0 and ${BIP68_SECONDS_MAX} seconds, but found ${literal.value} seconds`,
      );
    }

    const encodedLiteral = new IntLiteralNode(BigInt(encodeBip68({ seconds: Number(literal.value) })));
    encodedLiteral.location = literal.location;
    return encodedLiteral;
  }

  if (!isBip68RelativeTimelock(Number(literal.value))) {
    throw new InvalidTimelockError(
      literal, `this.age value must be a number of blocks between 0 and 65535 (or a BIP68-encoded relative timelock), but found ${literal.value}`,
    );
  }

  return literal;
}

// Durations can only be encoded at compile time, so a runtime this.age value cannot contain any time units
function ensureNoTimeUnits(expression: ExpressionNode): void {
  const finder = new TimeUnitFinder();
  finder.visit(expression);

  if (finder.timeUnitLiteral) {
    throw new InvalidTimelockError(
      finder.timeUnitLiteral, 'this.age duration must be a single literal or constant (e.g. `30 days`) to be encoded at compile time',
    );
  }
}

class TimeUnitFinder extends AstTraversal {
  timeUnitLiteral?: IntLiteralNode;

  visitIntLiteral(node: IntLiteralNode): Node {
    if (node.hasTimeUnit) this.timeUnitLiteral ??= node;
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const literal = resolveCompileTimeInt(node);
    if (literal?.hasTimeUnit) this.timeUnitLiteral ??= literal;
    return node;
  }
}
