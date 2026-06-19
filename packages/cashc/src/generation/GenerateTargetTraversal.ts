import { hexToBin } from '@bitauth/libauth';
import {
  asmToScript,
  encodeBool,
  encodeInt,
  encodeString,
  Op,
  OpOrData,
  PrimitiveType,
  Script,
  scriptToAsm,
  scriptToBytecode,
  generateSourceMap,
  FullLocationData,
  LogEntry,
  RequireStatement,
  PositionHint,
  SingleLocationData,
  StackItem,
  BytesType,
  CompilerOptions,
  SourceTagEntry,
  SourceTagKind,
} from '@cashscript/utils';
import {
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  AssignNode,
  IdentifierNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  BlockNode,
  TimeOpNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  ReturnNode,
  SourceFileNode,
  Node,
  InstantiationNode,
  TupleAssignmentNode,
  NullaryOpNode,
  ConsoleParameterNode,
  ConsoleStatementNode,
  SliceNode,
  DoWhileNode,
  WhileNode,
  ForNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { GlobalFunction, Class } from '../ast/Globals.js';
import { BinaryOperator } from '../ast/Operator.js';
import {
  compileBinaryOp,
  compileCast,
  compileGlobalFunction,
  compileNullaryOp,
  compileTimeOp,
  compileUnaryOp,
} from './utils.js';
import { isNumericType } from '../utils.js';

export default class GenerateTargetTraversalWithLocation extends AstTraversal {
  private locationData: FullLocationData = []; // detailed location data needed for sourcemap creation
  sourceMap: string;
  output: Script = [];
  stack: string[] = [];
  consoleLogs: LogEntry[] = [];
  requires: RequireStatement[] = [];
  sourceTags: SourceTagEntry[] = [];
  finalStackUsage: Record<string, StackItem> = {};

  private scopeDepth = 0;
  private currentFunction: FunctionDefinitionNode;
  private constructorParameterCount: number;

  // Maps each user-defined (value-returning) function name to its assigned VM function identifier
  // (a sequential number 1, 2, 3, ... encoded as a 0-7 byte VM number) and parameter count. Used by
  // visitFunctionCall to emit OP_INVOKE for the shared function body stored via OP_DEFINE.
  private userFunctionIds: Map<string, { id: number, paramCount: number, returnCount: number }> = new Map();
  // True while compiling a user-defined function body as a standalone routine (so that visitReturn
  // knows to leave only the return value on the stack instead of emitting a require/verify).
  private compilingUserFunctionBody = false;

  constructor(private compilerOptions: CompilerOptions) {
    super();
  }

  private emit(op: OpOrData | OpOrData[], locationData: SingleLocationData): void {
    if (Array.isArray(op)) {
      op.forEach((element) => this.output.push(element as Op));
      op.forEach(() => this.locationData.push(locationData));
    } else {
      this.output.push(op);
      this.locationData.push(locationData);
    }
  }

  private pushToStack(value: string, pushToBottom?: boolean): void {
    if (pushToBottom) {
      this.stack.push(value);
    } else {
      this.stack.unshift(value);
    }
  }

  private popFromStack(count: number = 1): void {
    for (let i = 0; i < count; i += 1) {
      this.stack.shift();
    }
  }

  private removeFromStack(i: number): void {
    this.stack.splice(i, 1);
  }

  private nipFromStack(): void {
    this.stack.splice(1, 1);
  }

  private getStackIndex(value: string, canBeUndefined?: boolean): number {
    const index = this.stack.indexOf(value);

    if (index === -1 && !canBeUndefined) {
      throw new Error(`Expected variable '${value}' does not exist on the stack`);
    }

    return index;
  }

  private getMostRecentInstructionPointer(): number {
    // instruction pointer is the count of emitted opcodes + number of constructor data pushes (minus 1 for 0-indexing)
    return this.output.length + this.constructorParameterCount - 1;
  }

  visitSourceFile(node: SourceFileNode): Node {
    node.contract = this.visit(node.contract) as ContractNode;

    // Minimally encode output by going Script -> ASM -> Script
    this.output = asmToScript(scriptToAsm(this.output));

    this.sourceMap = generateSourceMap(this.locationData);

    return node;
  }

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];

    // Keep track of constructor parameter count for instructor pointer calculation
    this.constructorParameterCount = node.parameters.length;

    // Separate user-defined (value-returning) functions from contract spending functions. The user
    // functions are lowered to CHIP-2025-05 function opcodes (OP_DEFINE / OP_INVOKE), the spending
    // functions are compiled as before and selected via the function selector at the stack bottom.
    const userFunctions = node.functions.filter((f) => f.isUserFunction);
    const spendingFunctions = node.functions.filter((f) => !f.isUserFunction);

    // Define every user function up front (before any OP_INVOKE). The VM function table persists for
    // the whole evaluation of this (locking/unlocking/redeem) bytecode, so a body defined here can be
    // invoked from the spending function and from other already-defined function bodies. Assign each
    // a sequential VM-number identifier (1, 2, 3, ...). Defining all of them before any invoke also
    // lets bodies invoke each other regardless of declaration order.
    this.defineUserFunctions(userFunctions);

    if (spendingFunctions.length === 1) {
      this.visit(spendingFunctions[0]);
    } else {
      this.pushToStack('$$', true);
      spendingFunctions.forEach((f, i) => {
        const locationData = { location: f.location, positionHint: PositionHint.START };

        const stackCopy = [...this.stack];
        const selectorIndex = this.getStackIndex('$$');

        this.emit(encodeInt(BigInt(selectorIndex)), locationData);
        if (i === spendingFunctions.length - 1) {
          this.emit(Op.OP_ROLL, locationData);
          this.removeFromStack(selectorIndex);
        } else {
          this.emit(Op.OP_PICK, locationData);
        }

        // All functions are if-else statements, except the final one which is enforced with NUMEQUALVERIFY
        this.emit(encodeInt(BigInt(i)), locationData);
        this.emit(Op.OP_NUMEQUAL, locationData);

        if (i < spendingFunctions.length - 1) {
          this.emit(Op.OP_IF, locationData);
        } else {
          this.emit(Op.OP_VERIFY, locationData);
        }

        this.visit(f);

        if (i < spendingFunctions.length - 1) {
          this.emit(Op.OP_ELSE, { ...locationData, positionHint: PositionHint.END });
        }

        this.stack = [...stackCopy];
      });

      for (let i = 0; i < spendingFunctions.length - 1; i += 1) {
        this.emit(Op.OP_ENDIF, { location: node.location, positionHint: PositionHint.END });
      }
    }

    return node;
  }

  // Emits the OP_DEFINE prologue for every user-defined function: each body is compiled once as an
  // independent stack-based routine (its parameters are the initial stack items it consumes, leaving
  // its return value on top), then stored in the VM function table with a sequential identifier:
  //   <function_body_bytes> <function_identifier> OP_DEFINE
  // The body bytecode is pushed as a single data vector, so OP_DEFINE's op-cost is base + the
  // stack-pushed body bytes; each later OP_INVOKE costs only the base instruction cost. Sharing the
  // body via the function table — rather than inlining it at every call site — is what keeps the
  // script small for functions called multiple times.
  private defineUserFunctions(userFunctions: FunctionDefinitionNode[]): void {
    if (userFunctions.length === 0) return;

    // Assign identifiers first so a body may OP_INVOKE any other user function (the front-end bans
    // recursion; note that OP_INVOKE technically permits bounded recursion within the 100-deep
    // control-stack limit, which is deferred for now).
    userFunctions.forEach((func, i) => {
      this.userFunctionIds.set(func.name, {
        id: i + 1,
        paramCount: func.parameters.length,
        returnCount: func.returnTypes!.length,
      });
    });

    userFunctions.forEach((func) => {
      const { id } = this.userFunctionIds.get(func.name)!;
      const bodyScript = this.compileUserFunctionBody(func);
      const bodyBytecode = scriptToBytecode(bodyScript);

      const locationData = { location: func.location, positionHint: PositionHint.START };
      // <function_body_bytes>
      this.emit(bodyBytecode, locationData);
      this.pushToStack('(function body)');
      // <function_identifier>
      this.emit(encodeInt(BigInt(id)), locationData);
      this.pushToStack('(function id)');
      // OP_DEFINE consumes the identifier and body, storing the body in the function table.
      this.emit(Op.OP_DEFINE, { ...locationData, positionHint: PositionHint.END });
      this.popFromStack(2);
    });
  }

  // Compiles a single user-defined function body into an independent Op[] routine using a fresh
  // GenerateTargetTraversal. The routine's stack model is seeded with the function's parameters (the
  // calling convention: arguments are passed as the initial stack items, first parameter on top), it
  // runs the body, and leaves exactly the return value on top of the shared stack.
  private compileUserFunctionBody(func: FunctionDefinitionNode): Script {
    const bodyTraversal = new GenerateTargetTraversalWithLocation(this.compilerOptions);
    // Share the function identifier table so a body can OP_INVOKE other already-defined functions.
    bodyTraversal.userFunctionIds = this.userFunctionIds;
    bodyTraversal.currentFunction = func;
    bodyTraversal.compilingUserFunctionBody = true;

    // Seed the stack with the parameters (visitParameter pushes them to the stack bottom in order,
    // matching the OP_INVOKE calling convention where the first parameter ends up on top).
    func.parameters.forEach((param) => bodyTraversal.visit(param));

    if (this.compilerOptions.enforceFunctionParameterTypes) {
      bodyTraversal.enforceFunctionParameterTypes(func);
    }

    bodyTraversal.visit(func.body);

    // After the body runs, the function's N return values are on top of the stack (in declared
    // order, the last-declared value on top). Remove every other stack item (parameters and locals)
    // so the routine's net effect is: consume the arguments, leave the N return values on top.
    bodyTraversal.cleanFunctionBodyStack(func.body, func.returnTypes!.length);

    return bodyTraversal.output;
  }

  // Removes everything below the N return values left on top of the stack (see
  // compileUserFunctionBody), preserving the relative order of those top N values.
  cleanFunctionBodyStack(functionBodyNode: Node, resultCount: number): void {
    const locationData = { location: functionBodyNode.location, positionHint: PositionHint.END };
    const dropCount = this.stack.length - resultCount;
    for (let i = 0; i < dropCount; i += 1) {
      if (resultCount === 1) {
        // Single return value: OP_NIP drops the item directly below the top (1 byte).
        this.emit(Op.OP_NIP, locationData);
        this.nipFromStack();
      } else {
        // Multiple return values: the next item to drop sits at stack index N (just below the N
        // result values). Roll it to the top and drop it; the N results keep their relative order.
        this.emit(encodeInt(BigInt(resultCount)), locationData);
        this.emit(Op.OP_ROLL, locationData);
        this.emit(Op.OP_DROP, locationData);
        this.removeFromStack(resultCount);
      }
    }
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.currentFunction = node;

    node.parameters = this.visitList(node.parameters) as ParameterNode[];

    if (this.compilerOptions.enforceFunctionParameterTypes) {
      this.enforceFunctionParameterTypes(node);
    }

    node.body = this.visit(node.body) as BlockNode;

    this.removeFinalVerifyFromFunction(node.body);
    this.cleanStack(node.body);

    return node;
  }

  removeFinalVerifyFromFunction(functionBodyNode: Node): void {
    // After EnsureFinalRequireTraversal, we know that the final opcodes are either
    // "OP_VERIFY", "OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP", "OP_ENDIF" or "OP_UNTIL"

    const finalOp = this.output.pop() as Op;
    const { location, positionHint } = this.locationData.pop()!;

    // If the final op is OP_VERIFY and the stack size is less than 4 we remove it from the script
    // - We have the stack size check because it is more efficient to use 2DROP rather than NIP
    //   if >= 4 elements are left (5 including final value) (e.g. 2DROP 2DROP 1 < NIP NIP NIP NIP)
    if (finalOp === Op.OP_VERIFY && this.stack.length < 4) {
      // Since the final value is no longer popped from the stack by OP_VERIFY,
      // we add it back to the stack
      this.pushToStack('(value)');

      // Replace the location data of the final check (e.g. (x == 1)) with the location data of the
      // full require statement including the removed OP_VERIFY (e.g. require(x == 1)), because
      // the check opcode (e.g. OP_EQUAL) now represents the entire require statement (including implicit OP_VERIFY)
      this.locationData.pop();
      this.locationData.push({ location, positionHint });
    } else {
      this.emit(finalOp, { location, positionHint: PositionHint.END });

      // At this point there is no verification value left on the stack:
      //  - scoped stack is cleared inside block ended by OP_ENDIF or OP_UNTIL
      //  - OP_CHECK{LOCKTIME|SEQUENCE}VERIFY OP_DROP does not leave a verification value
      //  - OP_VERIFY does not leave a verification value
      // so we add OP_1 to the script (indicating success)
      this.emit(Op.OP_1, { location: functionBodyNode.location, positionHint: PositionHint.END });
      this.pushToStack('(value)');
    }
  }

  cleanStack(functionBodyNode: Node): void {
    // Keep final verification value, OP_NIP the other stack values
    const tagStartIndex = this.output.length;
    const stackSize = this.stack.length;
    for (let i = 0; i < stackSize - 1; i += 1) {
      this.emit(Op.OP_NIP, { location: functionBodyNode.location, positionHint: PositionHint.END });
      this.nipFromStack();
    }
    this.tagScopeCleanup(tagStartIndex);
  }

  enforceFunctionParameterTypes(node: FunctionDefinitionNode): void {
    node.parameters.forEach((parameter) => this.enforceFunctionParameterType(parameter));
  }

  enforceFunctionParameterType(node: ParameterNode): void {
    if (!this.shouldEnforceFunctionParameterType(node)) return;

    const tagStartIndex = this.output.length;
    const stackIndex = this.getStackIndex(node.name);

    // We take the parameter from the stack and roll it to the top
    this.emit(encodeInt(BigInt(stackIndex)), { location: node.location, positionHint: PositionHint.START });
    this.emit(Op.OP_ROLL, { location: node.location, positionHint: PositionHint.START });

    // We remove the original stack value and push the new value to the top of the stack
    this.removeFromStack(stackIndex);
    this.pushToStack(node.name);

    // For booleans, we force-convert it to a boolean using OP_0NOTEQUAL
    if (node.type === PrimitiveType.BOOL) {
      this.emit(Op.OP_0NOTEQUAL, { location: node.location, positionHint: PositionHint.START });
    }

    // For bounded bytes, we *check* that it is the correct size using OP_SIZE and OP_EQUALVERIFY
    if (node.type instanceof BytesType && node.type.bound !== undefined) {
      this.emit(Op.OP_SIZE, { location: node.location, positionHint: PositionHint.START });
      this.emit(encodeInt(BigInt(node.type.bound)), { location: node.location, positionHint: PositionHint.START });
      this.emit(Op.OP_EQUALVERIFY, { location: node.location, positionHint: PositionHint.START });
    }

    // These checks are compiler-injected (no user source); tag them so the debug reconstruction
    // gives them their own annotation line positioned by bytecode order.
    this.sourceTags.push({
      startIndex: tagStartIndex,
      endIndex: this.output.length - 1,
      kind: SourceTagKind.PARAMETER_VALIDATION,
    });
  }

  shouldEnforceFunctionParameterType(node: ParameterNode): boolean {
    if (node.type === PrimitiveType.BOOL) return true;
    if (node.type instanceof BytesType && node.type.bound !== undefined) return true;
    return false;
  }

  visitParameter(node: ParameterNode): Node {
    this.pushToStack(node.name, true);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);
    this.popFromStack();
    this.pushToStack(node.name);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    // The RHS leaves N values on the stack (the last value on top). Replace those N anonymous
    // entries with the destructuring target names in declared order, so the last target is bound to
    // the top-of-stack value — matching both the `.split` (N=2) and multi-return-call conventions.
    node.tuple = this.visit(node.tuple);
    this.popFromStack(node.targets.length);
    node.targets.forEach((target) => this.pushToStack(target.name));
    return node;
  }

  visitAssign(node: AssignNode): Node {
    node.expression = this.visit(node.expression);
    if (this.scopeDepth > 0) {
      this.emitReplace(this.getStackIndex(node.identifier.name), node);
      this.popFromStack();
    } else {
      this.popFromStack();
      this.pushToStack(node.identifier.name);
    }
    return node;
  }

  // This algorithm can be optimised for hardcoded depths
  // See thesis for explanation
  emitReplace(index: number, node: Node): void {
    const locationData = { location: node.location, positionHint: PositionHint.END };

    this.emit(encodeInt(BigInt(index)), locationData);
    this.emit(Op.OP_ROLL, locationData);
    this.emit(Op.OP_DROP, locationData);
    for (let i = 0; i < index - 1; i += 1) {
      this.emit(Op.OP_SWAP, locationData);
      if (i < index - 2) {
        this.emit(Op.OP_TOALTSTACK, locationData);
      }
    }
    for (let i = 0; i < index - 2; i += 1) {
      this.emit(Op.OP_FROMALTSTACK, locationData);
    }
  }

  visitTimeOp(node: TimeOpNode): Node {
    const tagStartIndex = this.output.length;
    node.expression = this.visit(node.expression);
    this.emit(compileTimeOp(node.timeOp), { location: node.location, positionHint: PositionHint.END });

    this.requires.push({
      // We're removing 1 from the IP because the error message needs to match the OP_XXX_VERIFY, not the OP_DROP that
      // is emitted directly after
      ip: this.getMostRecentInstructionPointer() - 1,
      line: node.location.start.line,
      message: node.message,
    });

    // The auto-injected tx.locktime guard is emitted after the parameter prologue but has no
    // user source; tag it so the debug reconstruction positions it by bytecode order.
    if (node.isGuard) {
      this.sourceTags.push({
        startIndex: tagStartIndex,
        endIndex: this.output.length - 1,
        kind: SourceTagKind.LOCKTIME_GUARD,
      });
    }

    this.popFromStack();
    return node;
  }

  visitReturn(node: ReturnNode): Node {
    // Only reachable while compiling a user-defined function body (the front-end rejects `return`
    // elsewhere). Evaluating the expressions in declared order leaves the N return values on top of
    // the stack (last-declared value on top); the surrounding routine (cleanFunctionBodyStack) then
    // drops the consumed parameters and locals while preserving the order of the N results.
    if (!this.compilingUserFunctionBody) {
      throw new Error('Internal error: return statement reached code generation outside a user-defined function body');
    }
    node.expressions = this.visitList(node.expressions);
    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);

    this.emit(Op.OP_VERIFY, { location: node.location, positionHint: PositionHint.END });

    this.requires.push({
      ip: this.getMostRecentInstructionPointer(),
      line: node.location.start.line,
      message: node.message,
    });

    this.popFromStack();
    return node;
  }

  visitConsoleStatement(node: ConsoleStatementNode): Node {
    // We add a plus 1 to the most recent instruction pointer, because we want to log the state
    // of the stack *after* the most recent instruction has been executed
    const ip = this.getMostRecentInstructionPointer() + 1;
    const { line } = node.location.start;

    const data = node.parameters.map((parameter: ConsoleParameterNode) => {
      if (parameter instanceof IdentifierNode) {
        const symbol = parameter.definition!;

        // If the variable is not on the stack, then we add the final stack usage to the console log
        const stackIndex = this.getStackIndex(parameter.name, true);
        if (stackIndex === -1) {
          if (!this.finalStackUsage[parameter.name]) {
            throw new Error(`Expected variable '${parameter.name}' does not exist on the stack or in final stack usage`);
          }
          return this.finalStackUsage[parameter.name];
        }

        // If the variable is on the stack, we add the stack index and type to the console log
        const type = symbol.type.toString();
        return { stackIndex, type, ip };
      }

      return parameter.toString();
    });

    this.consoleLogs.push({ ip, line, data });

    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    this.popFromStack();

    this.scopeDepth += 1;
    this.emit(Op.OP_IF, { location: node.ifBlock.location, positionHint: PositionHint.START });

    let stackDepth = this.stack.length;
    node.ifBlock = this.visit(node.ifBlock);
    this.removeScopedVariables(stackDepth, node.ifBlock);

    if (node.elseBlock) {
      this.emit(Op.OP_ELSE, { location: node.elseBlock.location, positionHint: PositionHint.START });
      stackDepth = this.stack.length;
      node.elseBlock = this.visit(node.elseBlock);
      this.removeScopedVariables(stackDepth, node.elseBlock);
    }

    const endLocationData = {
      location: node.elseBlock ? node.elseBlock.location : node.ifBlock.location,
      positionHint: PositionHint.END,
    };

    this.emit(Op.OP_ENDIF, endLocationData);
    this.scopeDepth -= 1;

    return node;
  }

  visitDoWhile(node: DoWhileNode): Node {
    this.scopeDepth += 1;
    this.emit(Op.OP_BEGIN, { location: node.location, positionHint: PositionHint.START });

    const stackDepth = this.stack.length;
    node.block = this.visit(node.block);
    this.removeScopedVariables(stackDepth, node.block);

    node.condition = this.visit(node.condition);
    this.emit(Op.OP_NOT, { location: node.location, positionHint: PositionHint.END });

    this.emit(Op.OP_UNTIL, { location: node.location, positionHint: PositionHint.END });
    this.popFromStack();

    this.scopeDepth -= 1;

    return node;
  }

  visitWhile(node: WhileNode): Node {
    this.scopeDepth += 1;
    this.emit(Op.OP_BEGIN, { location: node.location, positionHint: PositionHint.START });

    node.condition = this.visit(node.condition);
    this.emit(Op.OP_DUP, { location: node.condition.location, positionHint: PositionHint.END });
    this.pushToStack('(value)');
    this.emit(Op.OP_TOALTSTACK, { location: node.condition.location, positionHint: PositionHint.END });
    this.popFromStack();

    this.popFromStack();
    this.emit(Op.OP_IF, { location: node.block.location, positionHint: PositionHint.START });

    const bodyStackDepth = this.stack.length;
    node.block = this.visit(node.block) as BlockNode;
    this.removeScopedVariables(bodyStackDepth, node.block);

    this.emitLoopCondition(node);

    this.scopeDepth -= 1;

    return node;
  }

  visitFor(node: ForNode): Node {
    const forScopeStackDepth = this.stack.length;
    node.init = this.visit(node.init) as VariableDefinitionNode | AssignNode;

    this.scopeDepth += 1;
    this.emit(Op.OP_BEGIN, { location: node.location, positionHint: PositionHint.START });

    node.condition = this.visit(node.condition);
    this.emit(Op.OP_DUP, { location: node.condition.location, positionHint: PositionHint.END });
    this.pushToStack('(value)');
    this.emit(Op.OP_TOALTSTACK, { location: node.condition.location, positionHint: PositionHint.END });
    this.popFromStack();

    this.popFromStack();
    this.emit(Op.OP_IF, { location: node.block.location, positionHint: PositionHint.START });

    const bodyStackDepth = this.stack.length;
    node.block = this.visit(node.block) as BlockNode;

    const updateStartIndex = this.output.length;
    node.update = this.visit(node.update) as AssignNode;
    const updateEndIndex = this.output.length - 1;
    this.sourceTags.push({ startIndex: updateStartIndex, endIndex: updateEndIndex, kind: SourceTagKind.FOR_UPDATE });

    this.removeScopedVariables(bodyStackDepth, node.block);

    this.emitLoopCondition(node);

    this.scopeDepth -= 1;
    this.removeScopedVariables(forScopeStackDepth, node);

    return node;
  }

  // Emits the loop-back epilogue shared by while- and for-loops: OP_ENDIF closes the body branch,
  // then OP_FROMALTSTACK OP_NOT OP_UNTIL re-checks the saved condition and jumps back. These are
  // compiler-injected and map to the closing brace; tag them so the debug reconstruction renders a
  // ">>> loop condition check" annotation line (and the following loop-variable cleanup) before the brace.
  private emitLoopCondition(node: WhileNode | ForNode): void {
    const tagStartIndex = this.output.length;
    this.emit(Op.OP_ENDIF, { location: node.block.location, positionHint: PositionHint.END });
    this.emit(Op.OP_FROMALTSTACK, { location: node.block.location, positionHint: PositionHint.END });
    this.pushToStack('(value)');
    this.emit(Op.OP_NOT, { location: node.location, positionHint: PositionHint.END });
    this.emit(Op.OP_UNTIL, { location: node.location, positionHint: PositionHint.END });
    this.popFromStack();
    this.sourceTags.push({
      startIndex: tagStartIndex,
      endIndex: this.output.length - 1,
      kind: SourceTagKind.LOOP_CONDITION,
    });
  }

  removeScopedVariables(depthBeforeScope: number, node: Node): void {
    const tagStartIndex = this.output.length;
    const dropCount = this.stack.length - depthBeforeScope;
    for (let i = 0; i < dropCount; i += 1) {
      this.emit(Op.OP_DROP, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack();
    }
    this.tagScopeCleanup(tagStartIndex);
  }

  private tagScopeCleanup(tagStartIndex: number): void {
    if (this.output.length <= tagStartIndex) return;
    this.sourceTags.push({
      startIndex: tagStartIndex,
      endIndex: this.output.length - 1,
      kind: SourceTagKind.SCOPE_CLEANUP,
    });
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);

    this.emit(
      compileCast(node.expression.type as PrimitiveType, node.type, node.isUnsafe),
      { location: node.location, positionHint: PositionHint.END },
    );
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    // User-defined (value-returning) function call: invoke the shared body stored via OP_DEFINE.
    const userFunction = this.userFunctionIds.get(node.identifier.name);
    if (userFunction) {
      return this.visitUserFunctionCall(node, userFunction);
    }

    // Defensive: anything that is neither a built-in global function nor a known user function must
    // not reach code generation. The only valid way a user-defined function call leaves the final
    // contract bytecode is as an OP_INVOKE emitted by visitUserFunctionCall.
    if (!Object.values(GlobalFunction).includes(node.identifier.name as GlobalFunction)) {
      throw new Error(`Internal error: unresolved call to user-defined function '${node.identifier.name}' reached code generation`);
    }

    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      return this.visitMultiSig(node);
    }

    node.parameters = this.visitList(node.parameters);

    this.emit(
      compileGlobalFunction(node.identifier.name as GlobalFunction),
      { location: node.location, positionHint: PositionHint.END },
    );
    this.popFromStack(node.parameters.length);
    this.pushToStack('(value)');

    return node;
  }

  // Emits an OP_INVOKE call to a user-defined function whose body was stored via OP_DEFINE.
  // Calling convention: arguments are pushed onto the shared stack so that the FIRST parameter ends
  // up on top (matching how the body's routine seeds its stack from its parameters). To achieve this
  // we evaluate the argument expressions in REVERSE source order. Then `<function_identifier>
  // OP_INVOKE` runs the body in the same stack/altstack/function-table; it consumes the arguments
  // and leaves the single return value on top.
  private visitUserFunctionCall(
    node: FunctionCallNode,
    userFunction: { id: number, paramCount: number, returnCount: number },
  ): Node {
    const args = [...node.parameters];
    for (let i = args.length - 1; i >= 0; i -= 1) {
      this.visit(args[i]);
    }

    this.emit(encodeInt(BigInt(userFunction.id)), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(function id)');
    this.emit(Op.OP_INVOKE, { location: node.location, positionHint: PositionHint.END });

    // OP_INVOKE pops the identifier; the body consumes the arguments and pushes its N return values
    // (the last-declared value ends up on top). For a single-return function the result is a plain
    // value expression; for a multi-return function the N values are bound by visitTupleAssignment.
    this.popFromStack(1 + userFunction.paramCount);
    for (let i = 0; i < userFunction.returnCount; i += 1) {
      this.pushToStack('(value)');
    }

    return node;
  }

  visitMultiSig(node: FunctionCallNode): Node {
    this.emit(encodeBool(false), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    node.parameters = this.visitList(node.parameters);
    this.emit(Op.OP_CHECKMULTISIG, { location: node.location, positionHint: PositionHint.END });
    const sigs = node.parameters[0] as ArrayNode;
    const pks = node.parameters[1] as ArrayNode;
    this.popFromStack(sigs.elements.length + pks.elements.length + 3);
    this.pushToStack('(value)');

    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    if (node.identifier.name === Class.LOCKING_BYTECODE_P2PKH) {
      // OP_DUP OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('76a914'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      // <pkh>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      // OP_EQUAL OP_CHECKSIG
      this.emit(hexToBin('88ac'), { location: node.location, positionHint: PositionHint.END });
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH20) {
      // OP_HASH160 OP_PUSH<20>
      this.emit(hexToBin('a914'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      // OP_EQUAL
      this.emit(hexToBin('87'), { location: node.location, positionHint: PositionHint.END });
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_P2SH32) {
      // OP_HASH256 OP_PUSH<32>
      this.emit(hexToBin('aa20'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      // <script hash>
      this.visit(node.parameters[0]);
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      // OP_EQUAL
      this.emit(hexToBin('87'), { location: node.location, positionHint: PositionHint.END });
      this.emit(Op.OP_CAT, { location: node.location, positionHint: PositionHint.END });
      this.popFromStack(2);
    } else if (node.identifier.name === Class.LOCKING_BYTECODE_NULLDATA) {
      // Total script = OP_RETURN (<VarInt> <chunk>)+
      // OP_RETURN
      this.emit(hexToBin('6a'), { location: node.location, positionHint: PositionHint.START });
      this.pushToStack('(value)');
      const { elements } = node.parameters[0] as ArrayNode;
      // <VarInt data chunk size (dynamic)>
      elements.forEach((element) => {
        this.visit(element);

        // The element comes first, then all other opcodes have PositionHint.END because they come after the element
        const elementLocationData = { location: element.location, positionHint: PositionHint.END };

        // Push the element's size (and calculate VarInt)
        this.emit(Op.OP_SIZE, elementLocationData);
        if (element instanceof HexLiteralNode) {
          // If the argument is a literal, we know its size
          if (element.value.byteLength > 75) {
            this.emit(hexToBin('4c'), elementLocationData);
            this.emit(Op.OP_SWAP, elementLocationData);
            this.emit(Op.OP_CAT, elementLocationData);
          }
        } else {
          // If the argument is not a literal, the script needs to check size
          this.emit(Op.OP_DUP, elementLocationData);
          this.emit(encodeInt(75n), elementLocationData);
          this.emit(Op.OP_GREATERTHAN, elementLocationData);
          this.emit(Op.OP_IF, elementLocationData);
          this.emit(hexToBin('4c'), elementLocationData);
          this.emit(Op.OP_SWAP, elementLocationData);
          this.emit(Op.OP_CAT, elementLocationData);
          this.emit(Op.OP_ENDIF, elementLocationData);
        }
        // Concat size and arguments
        this.emit(Op.OP_SWAP, elementLocationData);
        this.emit(Op.OP_CAT, elementLocationData);
        this.emit(Op.OP_CAT, elementLocationData);
        this.popFromStack();
      });
      this.popFromStack();
    } else {
      throw new Error(); // Should not happen
    }

    this.pushToStack('(value)');

    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);

    const locationData = { location: node.location, positionHint: PositionHint.END };

    if (node.index === 0) {
      this.emit(Op.OP_DROP, locationData);
      this.popFromStack();
    } else if (node.index === 1) {
      this.emit(Op.OP_NIP, locationData);
      this.nipFromStack();
    }

    return node;
  }

  // element.slice(start, end) is equivalent to element.split(end)[0].split(start)[1]
  visitSlice(node: SliceNode): Node {
    node.element = this.visit(node.element);

    const locationData = { location: node.location, positionHint: PositionHint.END };

    this.visit(node.end);
    this.emit(Op.OP_SPLIT, locationData);
    this.emit(Op.OP_DROP, locationData);
    this.popFromStack(2);
    this.pushToStack('(value)');

    this.visit(node.start);
    this.emit(Op.OP_SPLIT, locationData);
    this.emit(Op.OP_NIP, locationData);
    this.popFromStack(2);
    this.pushToStack('(value)');

    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    const bothOperandsAreNumeric = isNumericType(node.left.type) && isNumericType(node.right.type);
    this.emit(
      compileBinaryOp(node.operator, bothOperandsAreNumeric),
      { location: node.location, positionHint: PositionHint.END },
    );
    this.popFromStack(2);
    this.pushToStack('(value)');
    if (node.operator === BinaryOperator.SPLIT) this.pushToStack('(value)');
    return node;
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);
    this.emit(compileUnaryOp(node.operator), { location: node.location, positionHint: PositionHint.END });
    this.popFromStack();
    this.pushToStack('(value)');
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    this.emit(compileNullaryOp(node.operator), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitArray(node: ArrayNode): Node {
    node.elements = this.visitList(node.elements);
    this.emit(encodeInt(BigInt(node.elements.length)), { location: node.location, positionHint: PositionHint.END });
    this.pushToStack('(value)');
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const stackIndex = this.getStackIndex(node.name);
    this.emit(encodeInt(BigInt(stackIndex)), { location: node.location, positionHint: PositionHint.START });

    // If the final use is inside an if-statement, we still OP_PICK it
    // We do this so that there's no difference in stack depths between execution paths
    if (this.isOpRoll(node)) {
      const symbol = node.definition!;
      this.finalStackUsage[node.name] = {
        type: symbol.type.toString(),
        stackIndex,
        ip: this.getMostRecentInstructionPointer(),
      };

      this.emit(Op.OP_ROLL, { location: node.location, positionHint: PositionHint.START });
      this.removeFromStack(stackIndex);
    } else {
      this.emit(Op.OP_PICK, { location: node.location, positionHint: PositionHint.START });
    }

    this.pushToStack('(value)');
    return node;
  }

  isOpRoll(node: IdentifierNode): boolean {
    return this.currentFunction.opRolls.get(node.name) === node && this.scopeDepth === 0;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    this.emit(encodeBool(node.value), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.emit(encodeInt(node.value), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    this.emit(encodeString(node.value), { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.emit(node.value, { location: node.location, positionHint: PositionHint.START });
    this.pushToStack('(value)');
    return node;
  }
}
