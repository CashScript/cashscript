---
title: Language Grammar
description: ANTLR4 language grammar for CashScript
---

```antlr4
grammar CashScript;

sourceFile
    : pragmaDirective* contractDefinition EOF
    ;

pragmaDirective
    : 'pragma' pragmaName pragmaValue ';'
    ;

pragmaName
    : 'cashscript'
    ;

pragmaValue
    : versionConstraint versionConstraint?
    ;

versionConstraint
    : versionOperator? VersionLiteral
    ;

versionOperator
    : '^' | '~' | '>=' | '>' | '<' | '<=' | '='
    ;

contractDefinition
    : 'contract' Identifier parameterList '{' functionDefinition* '}'
    ;

functionDefinition
    : 'function' Identifier parameterList '{' statement* '}'
    ;

parameterList
    : '(' (parameter (',' parameter)* ','?)? ')'
    ;

parameter
    : typeName Identifier
    ;

block
    : '{' statement* '}'
    | statement
    ;

statement
    : controlStatement
    | nonControlStatement ';'
    ;

nonControlStatement
    : variableDefinition
    | tupleAssignment
    | assignStatement
    | timeOpStatement
    | requireStatement
    | consoleStatement
    ;

controlStatement
    : ifStatement
    | loopStatement
    ;

variableDefinition
    : typeName modifier* Identifier '=' expression
    ;

tupleAssignment
    : typeName Identifier ',' typeName Identifier '=' expression
    ;

assignStatement
    : Identifier op=('=' | '+=' | '-=') expression
    | Identifier op=('++' | '--')
    ;

timeOpStatement
    : 'require' '(' TxVar '>=' expression (',' requireMessage)? ')'
    ;

requireStatement
    : 'require' '(' expression (',' requireMessage)? ')'
    ;

consoleStatement
    : 'console.log' consoleParameterList
    ;

ifStatement
    : 'if' '(' expression ')' ifBlock=block ('else' elseBlock=block)?
    ;

loopStatement
    : doWhileStatement
    | whileStatement
    | forStatement
    ;

doWhileStatement
    : 'do' block 'while' '(' expression ')' ';'
    ;

whileStatement
    : 'while' '(' expression ')' block
    ;

forStatement
    : 'for' '(' forInit ';' expression ';' assignStatement ')' block
    ;

forInit
    : variableDefinition
    | assignStatement
    ;

requireMessage
    : StringLiteral
    ;

consoleParameter
    : Identifier
    | literal
    ;

consoleParameterList
    : '(' (consoleParameter (',' consoleParameter)* ','?)? ')'
    ;

functionCall
    : Identifier expressionList // Built-in and user-defined functions are accepted
    ;

expressionList
    : '(' (expression (',' expression)* ','?)? ')'
    ;

expression
    : '(' expression ')' # Parenthesised
    | typeCast '(' castable=expression ','? ')' # Cast
    | functionCall # FunctionCallExpression
    | 'new' Identifier expressionList #Instantiation
    | expression '[' index=NumberLiteral ']' # TupleIndexOp
    | scope='tx.outputs' '[' expression ']' op=('.value' | '.lockingBytecode' | '.tokenCategory' | '.nftCommitment' | '.tokenAmount') # UnaryIntrospectionOp
    | scope='tx.inputs' '[' expression ']' op=('.value' | '.lockingBytecode' | '.outpointTransactionHash' | '.outpointIndex' | '.unlockingBytecode' | '.sequenceNumber' | '.tokenCategory' | '.nftCommitment' | '.tokenAmount') # UnaryIntrospectionOp
    | expression op=('.reverse()' | '.length') # UnaryOp
    | left=expression op='.split' '(' right=expression ')' # BinaryOp
    | element=expression '.slice' '(' start=expression ',' end=expression ')' # Slice
    | op=('!' | '-' | '~') expression # UnaryOp
    | left=expression op=('*' | '/' | '%') right=expression # BinaryOp
    | left=expression op=('+' | '-') right=expression # BinaryOp
    | left=expression op=('>>' | '<<') right=expression # BinaryOp
    | left=expression op=('<' | '<=' | '>' | '>=') right=expression # BinaryOp
    | left=expression op=('==' | '!=') right=expression # BinaryOp
    | left=expression op='&' right=expression # BinaryOp
    | left=expression op='^' right=expression # BinaryOp
    | left=expression op='|' right=expression # BinaryOp
    | left=expression op='&&' right=expression # BinaryOp
    | left=expression op='||' right=expression # BinaryOp
    | '[' (expression (',' expression)* ','?)? ']' # Array
    | NullaryOp # NullaryOp
    | Identifier # Identifier
    | literal # LiteralExpression
    ;

modifier
    : 'constant'
    ;

literal
    : BooleanLiteral
    | numberLiteral
    | StringLiteral
    | DateLiteral
    | HexLiteral
    ;

numberLiteral
    : NumberLiteral NumberUnit?
    ;

typeName
    : PrimitiveType
    | BoundedBytes
    | UnboundedBytes
    ;

typeCast
    : PrimitiveType
    | UnboundedBytes
    | UnsafeCast
    ;

VersionLiteral
    : [0-9]+ '.' [0-9]+ '.' [0-9]+
    ;

BooleanLiteral
    : 'true' | 'false'
    ;

NumberUnit
    : 'satoshis' | 'sats' | 'finney' | 'bits' | 'bitcoin'
    | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks'
    ;

NumberLiteral
    : '-'? NumberPart ExponentPart?
    ;

NumberPart
    : [0-9]+ ('_' [0-9]+)*
    ;

ExponentPart
    : [eE] NumberPart
    ;

PrimitiveType
    : 'int'
    | 'bool'
    | 'string'
    | 'pubkey'
    | 'sig'
    | 'datasig'
    ;

UnboundedBytes
    : 'bytes'
    ;

BoundedBytes
    : 'bytes' Bound | 'byte'
    ;

Bound
    : [1-9] [0-9]*
    ;

StringLiteral
    : '"' ('\\"' | ~["\r\n])*? '"'
    | '\'' ('\\\'' | ~['\r\n])*? '\''
    ;

DateLiteral
    : 'date(' StringLiteral ')'
    ;

HexLiteral
    : '0' [xX] [0-9A-Fa-f]*
    ;

TxVar
    : 'this.age'
    | 'tx.time'
    ;

UnsafeCast
    : 'unsafe_int'
    | 'unsafe_bool'
    | 'unsafe_bytes' Bound?
    | 'unsafe_byte'
    ;

NullaryOp
    : 'this.activeInputIndex'
    | 'this.activeBytecode'
    | 'tx.inputs.length'
    | 'tx.outputs.length'
    | 'tx.version'
    | 'tx.locktime'
    ;

Identifier
    : [a-zA-Z] [a-zA-Z0-9_]*
    ;

WHITESPACE
    : [ \t\r\n\u000C]+ -> skip
    ;

COMMENT
    : '/*' .*? '*/' -> channel(HIDDEN)
    ;

LINE_COMMENT
    : '//' ~[\r\n]* -> channel(HIDDEN)
    ;
```

:::note
User-defined function calls compile to BCH function opcodes. Functions whose names end with `_` are treated as internal helpers and are excluded from the public ABI.
:::

For the full compilation model, see [BCH Functions (beta)](/docs/compiler/bch-functions).

:::caution
Internally-invoked functions currently cannot use `checkSig()`, `checkMultiSig()`, or `checkDataSig()`.
:::
