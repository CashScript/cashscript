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
    : '(' (parameter (',' parameter)*)? ')'
    ;

parameter
    : typeName Identifier
    ;

block
    : '{' statement* '}'
    | statement
    ;

statement
    : variableDefinition
    | assignStatement
    | timeOpStatement
    | requireStatement
    | ifStatement
    ;

variableDefinition
    : typeName Identifier '=' expression ';'
    ;

assignStatement
    : Identifier '=' expression ';'
    ;

timeOpStatement
    : 'require' '(' TxVar '>=' expression ')' ';'
    ;

requireStatement
    : 'require' '(' expression ')' ';'
    ;

ifStatement
    : 'if' '(' expression ')' ifBlock=block ('else' elseBlock=block)?
    ;

functionCall
    : Identifier expressionList // Only built-in functions are accepted
    ;

expressionList
    : '(' (expression (',' expression)*)? ')'
    ;

expression
    : '(' expression ')' # Parenthesised
    | typeName '(' expression ')' # Cast
    | functionCall # FunctionCallExpression
    | expression '[' index=NumberLiteral ']' # TupleIndexOp
    | expression '.length' # SizeOp
    | obj=expression '.split' '(' index=expression ')' # SplitOp
    // | left=expression op=('++' | '--')
    // | op=('!' | '~' | '+' | '-' | '++' | '--') right=expression
    | op=('!' | '-') expression # UnaryOp
    // | expression '**' expression --- No power
    // | expression ('*' | '/' | '%') expression --- OP_MUL is still disabled
    | left=expression op=('/' | '%') right=expression # BinaryOp
    | left=expression op=('+' | '-') right=expression # BinaryOp
    // | expression ('>>' | '<<') expression --- OP_LSHIFT 7 RSHIFT are disabled
    | left=expression op=('<' | '<=' | '>' | '>=') right=expression # BinaryOp
    | left=expression op=('==' | '!=') right=expression # BinaryOp
    // | left=expression op='&' right=expression --- Disabled bitwise logic for now
    // | left=expression op='^' right=expression
    // | left=expression op='|' right=expression
    | left=expression op='&&' right=expression # BinaryOp
    | left=expression op='||' right=expression # BinaryOp
    | '[' (expression (',' expression)*)? ']' # Array
    | Identifier # Identifier
    | literal # LiteralExpression
    ;

literal
    : BooleanLiteral
    | numberLiteral
    | StringLiteral
    | HexLiteral
    ;

numberLiteral
    : NumberLiteral NumberUnit?
    ;

typeName
    // : 'int' | 'bool' | 'string' | 'address' | 'pubkey' | 'sig' | Bytes
    : 'int' | 'bool' | 'string' | 'pubkey' | 'sig' | 'datasig' | Bytes
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
    : [-]?[0-9]+ ([eE] [0-9]+)?
    ;

Bytes
    : 'bytes' Bound?
    ;

Bound
    : [1-9] [0-9]*
    ;

StringLiteral
    : '"' ('\\"' | ~["\r\n])*? '"'
    | '\'' ('\\\'' | ~['\r\n])*? '\''
    ;

HexLiteral
    : '0' [xX] [0-9A-Fa-f]+
    ;

TxVar
    : 'tx.age'
    | 'tx.time'
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
