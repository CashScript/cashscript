import { Type, PrimitiveType, BytesType } from '@cashscript/utils';
import { TimeOp } from './Globals.js';
import AstVisitor from './AstVisitor.js';
import { BinaryOperator, NullaryOperator, UnaryOperator } from './Operator.js';
import { Location } from './Location.js';
import { SymbolTable, Symbol } from './SymbolTable.js';
import { binToHex } from '@bitauth/libauth';

export type Ast = SourceFileNode;

export abstract class Node {
  location: Location;
  abstract accept<T>(visitor: AstVisitor<T>): T;
}

export interface Named {
  name: string;
}

export interface Typed {
  type: Type;
}

export class SourceFileNode extends Node {
  constructor(
    public contract: ContractNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitSourceFile(this);
  }
}

export class ContractNode extends Node implements Named {
  symbolTable?: SymbolTable;

  constructor(
    public name: string,
    public parameters: ParameterNode[],
    public functions: FunctionDefinitionNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitContract(this);
  }
}

export class FunctionDefinitionNode extends Node implements Named {
  symbolTable?: SymbolTable;
  opRolls: Map<string, IdentifierNode> = new Map();

  constructor(
    public name: string,
    public parameters: ParameterNode[],
    public body: BlockNode,
    // Declared return types of a value-returning reusable function (the optional `returns (...)`
    // clause): one element for a single-return function, N for a multi-return (tuple) function;
    // undefined for a no-return function. Only `internal` functions may declare return types.
    public returnTypes?: Type[],
    // `internal` keyword: marks a reusable function lowered to OP_DEFINE/OP_INVOKE (it may return
    // value(s) via `returns (...)` or nothing — only `require`s). This is the sole distinction from a
    // contract spending (top-level) function, which unlocks the UTXO and never declares a return
    // type. `return` statements are only valid inside `internal` functions.
    public isInternal: boolean = false,
  ) {
    super();
  }

  // A user-defined (reusable) function is exactly an `internal` function. These are lowered to
  // OP_DEFINE/OP_INVOKE and shared across call sites, rather than emitted as standalone spending
  // functions. Spending functions are the non-internal top-level functions that unlock the contract.
  get isUserFunction(): boolean {
    return this.isInternal;
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitFunctionDefinition(this);
  }
}

export class ParameterNode extends Node implements Named, Typed {
  constructor(
    public type: Type,
    public name: string,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitParameter(this);
  }
}

export abstract class StatementNode extends Node { }
export abstract class ControlStatementNode extends StatementNode { }
export abstract class NonControlStatementNode extends StatementNode { }

export class VariableDefinitionNode extends NonControlStatementNode implements Named, Typed {
  constructor(
    public type: Type,
    public modifier: string[],
    public name: string,
    public expression: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitVariableDefinition(this);
  }
}

export interface TupleTarget {
  name: string;
  type: Type;
}

export class TupleAssignmentNode extends NonControlStatementNode {
  constructor(
    // TODO: Use IdentifierNodes instead of a custom type
    // A tuple assignment destructures a tuple-valued expression into N >= 2 named targets in order.
    // The 2-target form is used for built-in multi-value expressions (e.g. `.split`); N-target forms
    // (N >= 2) destructure the result of a multi-return user-defined function call.
    public targets: TupleTarget[],
    public tuple: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitTupleAssignment(this);
  }
}

export class FunctionCallStatementNode extends NonControlStatementNode {
  // A bare call to a user-defined `internal` (no-return) function, executed for its `require` side
  // effects. The wrapped call leaves no value on the stack.
  constructor(
    public functionCall: FunctionCallNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitFunctionCallStatement(this);
  }
}

export class AssignNode extends NonControlStatementNode {
  constructor(
    public identifier: IdentifierNode,
    public expression: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitAssign(this);
  }
}

export class TimeOpNode extends NonControlStatementNode {
  // True for the compiler-injected `tx.locktime` guard (no user source); see InjectLocktimeGuardTraversal.
  isGuard = false;

  constructor(
    public timeOp: TimeOp,
    public expression: ExpressionNode,
    public message?: string,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitTimeOp(this);
  }
}

export class RequireNode extends NonControlStatementNode {
  constructor(
    public expression: ExpressionNode,
    public message?: string,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitRequire(this);
  }
}

export class ReturnNode extends NonControlStatementNode {
  constructor(
    // A return statement yields one or more values in declared order (one for a single-return
    // function, N for a multi-return/tuple function).
    public expressions: ExpressionNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitReturn(this);
  }
}

export class ConsoleStatementNode extends NonControlStatementNode {
  constructor(
    public parameters: ConsoleParameterNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitConsoleStatement(this);
  }
}

export class BranchNode extends ControlStatementNode {
  constructor(
    public condition: ExpressionNode,
    public ifBlock: BlockNode,
    public elseBlock?: BlockNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitBranch(this);
  }
}

export class DoWhileNode extends ControlStatementNode {
  constructor(
    public condition: ExpressionNode,
    public block: BlockNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitDoWhile(this);
  }
}

export class WhileNode extends ControlStatementNode {
  constructor(
    public condition: ExpressionNode,
    public block: BlockNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitWhile(this);
  }
}

export class ForNode extends ControlStatementNode {
  symbolTable?: SymbolTable;

  constructor(
    public init: VariableDefinitionNode | AssignNode,
    public condition: ExpressionNode,
    public update: AssignNode,
    public block: BlockNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitFor(this);
  }
}

export class BlockNode extends Node {
  symbolTable?: SymbolTable;

  constructor(
    public statements?: StatementNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitBlock(this);
  }
}

export abstract class ExpressionNode extends Node {
  type?: Type;
}

export class CastNode extends ExpressionNode implements Typed {
  constructor(
    public type: Type,
    public expression: ExpressionNode,
    public isUnsafe: boolean,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitCast(this);
  }
}

export class FunctionCallNode extends ExpressionNode {
  constructor(
    public identifier: IdentifierNode,
    public parameters: ExpressionNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitFunctionCall(this);
  }
}

export class InstantiationNode extends ExpressionNode {
  constructor(
    public identifier: IdentifierNode,
    public parameters: ExpressionNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitInstantiation(this);
  }
}

export class TupleIndexOpNode extends ExpressionNode {
  constructor(
    public tuple: ExpressionNode,
    public index: number,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitTupleIndexOp(this);
  }
}

export class SliceNode extends ExpressionNode {
  constructor(
    public element: ExpressionNode,
    public start: ExpressionNode,
    public end: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitSlice(this);
  }
}

export class BinaryOpNode extends ExpressionNode {
  constructor(
    public left: ExpressionNode,
    public operator: BinaryOperator,
    public right: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitBinaryOp(this);
  }
}

export class UnaryOpNode extends ExpressionNode {
  constructor(
    public operator: UnaryOperator,
    public expression: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitUnaryOp(this);
  }
}

export class NullaryOpNode extends ExpressionNode {
  constructor(
    public operator: NullaryOperator,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitNullaryOp(this);
  }
}

export class ArrayNode extends ExpressionNode {
  constructor(
    public elements: ExpressionNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitArray(this);
  }
}

export class IdentifierNode extends ExpressionNode implements Named {
  definition?: Symbol;

  constructor(
    public name: string,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitIdentifier(this);
  }
}

export abstract class LiteralNode<T = any> extends ExpressionNode {
  public value: T;

  toString(): string {
    return `${this.value}`;
  }
}

export class BoolLiteralNode extends LiteralNode<boolean> {
  constructor(
    public value: boolean,
  ) {
    super();
    this.type = PrimitiveType.BOOL;
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitBoolLiteral(this);
  }
}

export class IntLiteralNode extends LiteralNode<bigint> {
  constructor(
    public value: bigint,
  ) {
    super();
    this.type = PrimitiveType.INT;
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitIntLiteral(this);
  }
}

export class StringLiteralNode extends LiteralNode<string> {
  constructor(
    public value: string,
    public quote: string,
  ) {
    super();
    this.type = PrimitiveType.STRING;
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitStringLiteral(this);
  }
}

export class HexLiteralNode extends LiteralNode<Uint8Array> {
  constructor(
    public value: Uint8Array,
  ) {
    super();
    this.type = new BytesType(value.byteLength);
  }

  toString(): string {
    return `0x${binToHex(this.value)}`;
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitHexLiteral(this);
  }
}

export type ConsoleParameterNode = LiteralNode | IdentifierNode;
