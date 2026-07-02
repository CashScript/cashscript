import { binToHex, hexToBin } from '@bitauth/libauth';
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
  optimiseBytecode,
  OptimiseBytecodeResult,
  generateSourceMap,
  generateSourceTags,
  FullLocationData,
  DebugFrame,
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
  FunctionKind,
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
import { Symbol } from '../ast/SymbolTable.js';
import { GlobalFunction, Class } from '../ast/Globals.js';
import { BinaryOperator } from '../ast/Operator.js';
import {
  compileBinaryOp,
  compileCast,
  compileNullaryOp,
  compileTimeOp,
  compileUnaryOp,
} from './utils.js';
import { isNumericType } from '../utils.js';

// The optimised body of a function chosen for inlining, including its frame-local debug info
// (location data, logs, requires, source tags) so call sites can splice that too.
interface InlinedFunction extends OptimiseBytecodeResult {
  sourceFile?: string; // originating file for imported functions; absent means the contract's own file
}

export default class GenerateTargetTraversal extends AstTraversal {
  private locationData: FullLocationData = []; // detailed location data needed for sourcemap creation
  sourceMap: string;
  output: Script = [];
  stack: string[] = [];
  consoleLogs: LogEntry[] = [];
  requires: RequireStatement[] = [];
  sourceTags: SourceTagEntry[] = [];
  frames: DebugFrame[] = [];
  finalStackUsage: Record<string, StackItem> = {};

  private scopeDepth = 0;
  private currentFunction: FunctionDefinitionNode;
  private constructorParameterCount: number;
  // Optimised bodies of global functions chosen for inlining: call sites splice these instead of
  // emitting OP_INVOKE, and they get no OP_DEFINE. Shared with body sub-traversals so an inlined
  // callee is spliced into its callers too.
  inlinedFunctionBodies: Map<string, InlinedFunction> = new Map();
  // Global functions emitted as an OP_INVOKE (so they need an OP_DEFINE and cannot be inlined). Only
  // populated for recursive/cyclic calls, where the callee is still being compiled when its call is
  // emitted. Shared with body sub-traversals.
  invokedFunctions: Set<string> = new Set();

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
    this.defineGlobalFunctions(node);

    // The contract is guaranteed to exist here (compileString throws MissingContractError otherwise).
    node.contract = this.visit(node.contract!) as ContractNode;

    // Minimally encode output by going Script -> ASM -> Script
    this.output = asmToScript(scriptToAsm(this.output));

    this.sourceMap = generateSourceMap(this.locationData);

    return node;
  }

  private defineGlobalFunctions(node: SourceFileNode): void {
    const functionsByName = new Map(node.functions.map((func) => [func.name, func]));
    const inliningEnabled = !this.compilerOptions.disableInlining;
    const definedBodies = new Map<string, OptimiseBytecodeResult>();

    // Compile and decide in callee-first order so an inlined callee's body is available to splice into
    // its callers (a spliced callee then counts towards its caller's body size). A function already
    // emitted as an OP_INVOKE (recursion) must stay shared via OP_DEFINE.
    calleesFirst(node.functions, functionsByName).forEach((func) => {
      const symbol = node.symbolTable!.getFromThis(func.name)!;
      const optimisedBody = this.compileGlobalFunctionBody(func);
      if (inliningEnabled && isWorthInlining(symbol, optimisedBody.script) && !this.invokedFunctions.has(func.name)) {
        this.inlinedFunctionBodies.set(func.name, { ...optimisedBody, sourceFile: func.sourceFile });
      } else {
        definedBodies.set(func.name, optimisedBody);
      }
    });

    // Emit OP_DEFINEs in declaration order so output is stable regardless of the compile order above.
    // Only defined functions get a debug frame: an inlined body never executes via OP_INVOKE, so its
    // debug info is spliced into the caller at each call site instead (see spliceInlinedFunction).
    node.functions.forEach((func) => {
      const optimisedBody = definedBodies.get(func.name);
      if (optimisedBody === undefined) return; // inlined: no OP_DEFINE
      const { functionId } = node.symbolTable!.getFromThis(func.name)!;
      this.pushDebugFrame(func, optimisedBody, functionId!);
      const locationData = { location: func.location, positionHint: PositionHint.START };
      this.emit(scriptToBytecode(optimisedBody.script), locationData); // <function_body_bytes>
      this.emit(encodeInt(BigInt(functionId!)), locationData); // <function_identifier>
      this.emit(Op.OP_DEFINE, { ...locationData, positionHint: PositionHint.END });
    });
  }

  private pushDebugFrame(node: FunctionDefinitionNode, optimised: OptimiseBytecodeResult, functionId: number): void {
    const sourceTags = generateSourceTags(optimised.sourceTags);

    this.frames.push({
      id: functionId,
      name: node.name,
      inputs: node.parameters.map((parameter) => ({ name: parameter.name, type: parameter.type.toString() })),
      bytecode: binToHex(scriptToBytecode(optimised.script)),
      sourceMap: generateSourceMap(optimised.locationData),
      ...(sourceTags ? { sourceTags } : {}),
      ...(node.sourceCode !== undefined ? { source: node.sourceCode } : {}),
      ...(node.sourceFile !== undefined ? { sourceFile: node.sourceFile } : {}),
      logs: optimised.logs,
      requires: optimised.requires,
    });
  }

  private compileGlobalFunctionBody(node: FunctionDefinitionNode): OptimiseBytecodeResult {
    const bodyTraversal = new GenerateTargetTraversal(this.compilerOptions);
    bodyTraversal.currentFunction = node;
    bodyTraversal.constructorParameterCount = 0;
    // Share the inline tables so a body splices its already-inlined callees (and records OP_INVOKEs).
    bodyTraversal.inlinedFunctionBodies = this.inlinedFunctionBodies;
    bodyTraversal.invokedFunctions = this.invokedFunctions;

    // Seed the stack with parameters in reverse order so the last parameter is on top
    // (similar to how builtin functions work)
    for (let i = node.parameters.length - 1; i >= 0; i -= 1) {
      bodyTraversal.visit(node.parameters[i]);
    }

    bodyTraversal.visit(node.body);
    bodyTraversal.cleanGlobalFunctionStack(node);

    const optimised = optimiseBytecode(
      bodyTraversal.output,
      bodyTraversal.locationData,
      bodyTraversal.consoleLogs,
      bodyTraversal.requires,
      bodyTraversal.sourceTags,
      0,
    );

    return optimised;
  }

  cleanGlobalFunctionStack(node: FunctionDefinitionNode): void {
    const returnCount = node.returnTypes?.length ?? 0;
    if (returnCount === 0) {
      this.removeScopedVariables(0, node.body); // void: drop the entire frame
    } else {
      this.cleanStack(node.body, returnCount); // value(s): drop everything below the N results on top
    }
  }

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];

    // Keep track of constructor parameter count for instructor pointer calculation
    this.constructorParameterCount = node.parameters.length;

    if (node.functions.length === 1) {
      node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    } else {
      this.pushToStack('$$', true);
      node.functions = node.functions.map((f, i) => {
        const locationData = { location: f.location, positionHint: PositionHint.START };

        const stackCopy = [...this.stack];
        const selectorIndex = this.getStackIndex('$$');

        this.emit(encodeInt(BigInt(selectorIndex)), locationData);
        if (i === node.functions.length - 1) {
          this.emit(Op.OP_ROLL, locationData);
          this.removeFromStack(selectorIndex);
        } else {
          this.emit(Op.OP_PICK, locationData);
        }

        // All functions are if-else statements, except the final one which is enforced with NUMEQUALVERIFY
        this.emit(encodeInt(BigInt(i)), locationData);
        this.emit(Op.OP_NUMEQUAL, locationData);

        if (i < node.functions.length - 1) {
          this.emit(Op.OP_IF, locationData);
        } else {
          this.emit(Op.OP_VERIFY, locationData);
        }

        f = this.visit(f) as FunctionDefinitionNode;

        if (i < node.functions.length - 1) {
          this.emit(Op.OP_ELSE, { ...locationData, positionHint: PositionHint.END });
        }

        this.stack = [...stackCopy];
        return f;
      });

      for (let i = 0; i < node.functions.length - 1; i += 1) {
        this.emit(Op.OP_ENDIF, { location: node.location, positionHint: PositionHint.END });
      }
    }

    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    if (node.kind !== FunctionKind.CONTRACT) {
      throw new Error('Internal error: global functions are compiled via defineGlobalFunctions');
    }

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

  cleanStack(functionBodyNode: Node, keepCount: number = 1): void {
    // Keep the top `keepCount` values (a contract function's verification value, or a global
    // function's return values), dropping everything below them while preserving their order.
    const tagStartIndex = this.output.length;
    const locationData = { location: functionBodyNode.location, positionHint: PositionHint.END };
    const dropCount = this.stack.length - keepCount;
    for (let i = 0; i < dropCount; i += 1) {
      if (keepCount === 1) {
        // OP_NIP drops the item directly below the top value (1 byte, cheaper than ROLL + DROP).
        this.emit(Op.OP_NIP, locationData);
        this.nipFromStack();
      } else {
        // The next item to drop sits just below the top `keepCount` values: roll it up and drop it.
        this.emit(encodeInt(BigInt(keepCount)), locationData);
        this.emit(Op.OP_ROLL, locationData);
        this.emit(Op.OP_DROP, locationData);
        this.removeFromStack(keepCount);
      }
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
    // The RHS leaves N values on the stack, last on top (as `.split` and multi-return calls do).
    node.tuple = this.visit(node.tuple);
    const n = node.targets.length;

    // Outside a loop/branch, binding is a pure rename: the result entries take the target names, and
    // a reassigned variable's old slot becomes a dead duplicate cleaned up at end of scope.
    const scopedReassign = this.scopeDepth > 0 && node.targets.some((target) => target.isReassignment);
    if (!scopedReassign) {
      this.popFromStack(n);
      node.targets.forEach((target) => this.pushToStack(target.name));
      return node;
    }

    // In a loop/branch the stack layout must be preserved, so reassignments are folded in place. This
    // requires declarations to form a contiguous block below all reassignments (the natural layout of
    // a multi-return: fresh values, then updated accumulators); any other interleaving is rejected.
    const firstReassign = node.targets.findIndex((target) => target.isReassignment);
    const lastDeclaration = node.targets.reduce((acc, target, i) => (target.isReassignment ? acc : i), -1);
    if (lastDeclaration > firstReassign) {
      throw new Error('Declaration targets must come before all reassignment targets in a scoped tuple destructuring');
    }

    // Fold the trailing reassignment block into the existing slots top-down (each target's value is on
    // top when processed), then rename the leading declaration values in place (no opcodes).
    for (let i = n - 1; i >= firstReassign; i -= 1) {
      this.emitReplace(this.getStackIndex(node.targets[i].name), node);
      this.popFromStack();
    }
    for (let s = 0; s < firstReassign; s += 1) {
      this.stack[s] = node.targets[firstReassign - 1 - s].name;
    }
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
        const symbol = parameter.symbol!;

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
    if (node.identifier.name === GlobalFunction.CHECKMULTISIG) {
      return this.visitMultiSig(node);
    }

    const symbol = node.identifier.symbol!;
    node.parameters = this.visitList(node.parameters);

    // An inlined function is spliced in place of `<id> OP_INVOKE`. Its optimised body was compiled
    // with the arguments staged on top of the stack (the exact state here), so it runs identically:
    // consuming the arguments and leaving its N return values on top.
    const inlined = this.inlinedFunctionBodies.get(node.identifier.name);
    if (inlined !== undefined) {
      this.spliceInlinedFunction(node, inlined);
    } else {
      this.emit(symbol.bytecode!, { location: node.location, positionHint: PositionHint.END });
      if (symbol.functionId !== undefined) this.invokedFunctions.add(node.identifier.name);
    }
    this.popFromStack(node.parameters.length);

    // The call leaves one value per declared return type (none for a void function); a multi-return
    // function's values are subsequently bound by visitTupleAssignment.
    for (let i = 0; i < symbol.returnTypes.length; i += 1) this.pushToStack('(value)');

    return node;
  }

  // Splices an inlined body together with its frame-local debug info (ip-shifted), so logs and
  // requires inside it keep working without a debug frame. A same-file body keeps its own source
  // locations; a body from another file is attributed to the call site instead, since a source map
  // can only reference its own frame's source file.
  private spliceInlinedFunction(node: FunctionCallNode, inlined: InlinedFunction): void {
    const callSiteLocation = { location: node.location, positionHint: PositionHint.END };
    const callSiteLine = node.location.start.line;
    const sameFile = inlined.sourceFile === this.currentFunction?.sourceFile;
    const ipOffset = this.output.length + this.constructorParameterCount;
    const tagOffset = this.output.length;

    inlined.script.forEach((op, i) => this.emit(op, sameFile ? inlined.locationData[i] : callSiteLocation));

    this.requires.push(...inlined.requires.map((entry) => ({
      ...entry,
      ip: entry.ip + ipOffset,
      ...(sameFile ? {} : { line: callSiteLine }),
    })));

    this.consoleLogs.push(...inlined.logs.map((entry) => ({
      ...entry,
      ip: entry.ip + ipOffset,
      ...(sameFile ? {} : { line: callSiteLine }),
      data: entry.data.map((item) => (typeof item === 'string' ? item : { ...item, ip: item.ip + ipOffset })),
    })));

    this.sourceTags.push(...inlined.sourceTags.map((entry) => ({
      ...entry,
      startIndex: entry.startIndex + tagOffset,
      endIndex: entry.endIndex + tagOffset,
    })));
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
      const symbol = node.symbol!;
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

// Byte-exact comparison: defining costs the body once (as a push) plus <id> OP_DEFINE, and
// <id> OP_INVOKE per call site; inlining costs the body at every call site. A tie favours
// inlining (frees the function id and skips the OP_INVOKE round-trip at runtime).
function isWorthInlining(symbol: Symbol, bodyScript: Script): boolean {
  const useCount = symbol.references.length;
  const bodyBytes = scriptToBytecode(bodyScript).length;
  const bodyPushBytes = scriptToBytecode([scriptToBytecode(bodyScript)]).length;
  const idBytes = scriptToBytecode([encodeInt(BigInt(symbol.functionId!))]).length;
  const definedCost = bodyPushBytes + idBytes + 1 + useCount * (idBytes + 1);
  return useCount * bodyBytes <= definedCost;
}

// Orders functions so every callee precedes its callers (post-order over the call graph), so an
// inlined callee's compiled body is available to splice into its callers. A cycle (recursion) is
// broken by the visited guard; those functions fall back to OP_DEFINE/OP_INVOKE.
function calleesFirst(
  functions: FunctionDefinitionNode[],
  functionsByName: Map<string, FunctionDefinitionNode>,
): FunctionDefinitionNode[] {
  const ordered: FunctionDefinitionNode[] = [];
  const visited = new Set<string>();

  const visit = (func: FunctionDefinitionNode): void => {
    if (visited.has(func.name)) return;
    visited.add(func.name);
    calledFunctionNames(func, functionsByName).forEach((name) => visit(functionsByName.get(name)!));
    ordered.push(func);
  };

  functions.forEach(visit);
  return ordered;
}

// The names of the global functions called anywhere within a function's body.
function calledFunctionNames(
  func: FunctionDefinitionNode,
  functionsByName: Map<string, FunctionDefinitionNode>,
): Set<string> {
  const names = new Set<string>();
  const collector = new class extends AstTraversal {
    visitFunctionCall(node: FunctionCallNode): Node {
      if (functionsByName.has(node.identifier.name)) names.add(node.identifier.name);
      node.parameters = this.visitList(node.parameters);
      return node;
    }
  }();
  collector.visit(func.body);
  return names;
}
