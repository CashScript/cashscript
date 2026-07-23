import { Type, PrimitiveType, BytesType } from '@cashscript/utils';
import { Modifier, TimeOp } from './Globals.js';
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

export enum FunctionKind {
  CONTRACT = 'contract',
  GLOBAL = 'global',
}

export class SourceFileNode extends Node {
  // The source file's scope: the table of global definitions (shared definitions carry a VM function-table id).
  symbolTable?: SymbolTable;

  constructor(
    public contract?: ContractNode,
    public functions: FunctionDefinitionNode[] = [],
    public constants: ConstantDefinitionNode[] = [],
    public imports: ImportNode[] = [],
    public pragmas: string[] = [],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitSourceFile(this);
  }
}

export class ConstantDefinitionNode extends Node implements Named, Typed {
  // Source provenance for debugging. Set on imported constants, left undefined for constants in the contract's own file.
  sourceCode?: string;
  sourceFile?: string;

  modifiers = [Modifier.CONSTANT];

  constructor(
    public type: Type,
    public name: string,
    public value: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitConstantDefinition(this);
  }
}

export class ImportNode extends Node {
  constructor(
    public path: string,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitImport(this);
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

  // Set when this is the synthetic zero-argument function used to lower a global constant.
  constant?: ConstantDefinitionNode;

  // Source provenance for debugging. Set on imported functions, left undefined for functions in the contract's own file.
  sourceCode?: string;
  sourceFile?: string;

  constructor(
    public kind: FunctionKind,
    public name: string,
    public parameters: ParameterNode[],
    public body: BlockNode,
    public returnTypes?: Type[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitFunctionDefinition(this);
  }
}

export class ParameterNode extends Node implements Named, Typed {
  constructor(
    public type: Type,
    public modifiers: Modifier[],
    public name: string,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitParameter(this);
  }
}

export type DefinitionNode = VariableDefinitionNode | ConstantDefinitionNode | FunctionDefinitionNode | ParameterNode;

export abstract class StatementNode extends Node { }
export abstract class ControlStatementNode extends StatementNode { }
export abstract class NonControlStatementNode extends StatementNode { }

export class VariableDefinitionNode extends NonControlStatementNode implements Named, Typed {
  constructor(
    public type: Type,
    public modifiers: Modifier[],
    public name: string,
    public expression: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitVariableDefinition(this);
  }
}

export interface TupleAssignmentTarget {
  name: string;
  // For a fresh-declaration target (`int x`) this is the declared type. For a reassignment target
  // (`x`, no type) it is undefined at parse time and filled in from the existing variable's symbol
  // during SymbolTableTraversal.
  type?: Type;
  // True for a reassignment of an already-declared variable (no `typeName` in source).
  isReassignment?: boolean;
}

export class TupleAssignmentNode extends NonControlStatementNode {
  constructor(
    // TODO: Use IdentifierNodes instead of a custom type
    public targets: TupleAssignmentTarget[],
    public tuple: ExpressionNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitTupleAssignment(this);
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

export class FunctionCallStatementNode extends NonControlStatementNode {
  constructor(
    public functionCall: FunctionCallNode,
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitFunctionCallStatement(this);
  }
}

export class ReturnNode extends NonControlStatementNode {
  constructor(
    public expressions: ExpressionNode[],
  ) {
    super();
  }

  accept<T>(visitor: AstVisitor<T>): T {
    return visitor.visitReturn(this);
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
  symbol?: Symbol;

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

  // Set when this is the synthetic literal node used to represent a global constant
  constant?: ConstantDefinitionNode;

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
