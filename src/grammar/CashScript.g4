grammar CashScript;

sourceFile
    : contractDefinition EOF
    ;

contractDefinition
    : 'contract' Identifier parameterList '{' variableDefinition* functionDefinition* '}'
    ;

functionDefinition
    : 'function' parameterList '{' statement* '}'
    ;

block
    : '{' statement* '}'
    | statement
    ;

statement
    : variableDefinition
    | variableDeclarationStatement
    | assignStatement
    | ifStatement
    | returnStatement
    | functionCallStatement
    ;

variableDefinition
    : variableDeclaration '=' expression ';'
    ;

variableDeclaration
    : typeName Identifier
    ;

variableDeclarationStatement
    : variableDeclaration ';'
    ;

assignStatement
    : Identifier '=' expression ';'
    ;

ifStatement
    : 'if' '(' expression ')' block ('else' block)?
    ;

// OP_RETURN invalidates a transaction, so that would more relate to the 'throw' keyword,
// but if we want subroutines, return would mean regular return
returnStatement
    : 'return' expression? ';'
    ;

functionCallStatement
    : functionCall ';'
    ;

functionCall
    : Identifier expressionList
    ;

expressionList
    : '(' (expression (',' expression)*)? ')'
    ;

parameterList
    : '(' (parameter (',' parameter)*)? ')'
    ;

parameter
    : typeName Identifier
    ;

expression
    : '(' expression ')'
    | functionCall
    | typeName '(' expression ')'
    | expression '.' Identifier
    | expression ('++' | '--')
    | ('!' | '~' | '+' | '-' | '++' | '--') expression
    | expression '**' expression
    // | expression ('*' | '/' | '%') expression --- OP_MUL is still disabled
    | expression ('/' | '%') expression
    | expression ('+' | '-') expression
    // | expression ('>>' | '<<') expression --- OP_LSHIFT 7 RSHIFT are disabled
    | expression ('<' | '<=' | '>' | '>=') expression
    | expression ('==' | '!=' | '===' | '!==') expression
    | expression '&' expression
    | expression '^' expression
    | expression '|' expression
    | expression '&&' expression
    | expression '||' expression
    | literal
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
    : 'int' | 'string' | 'time' | 'address' | 'pubkey' | 'sig' | Bytes
    ;

Bytes
    : 'bytes' | 'bytes20' | 'bytes32'
    ;

BooleanLiteral
    : 'true' | 'false'
    ;

NumberUnit
    : 'satoshis' | 'sats' | 'finney' | 'bits' | 'bitcoin'
    | 'seconds' | 'blocks'
    ;

NumberLiteral
    : [1-9] [0-9]* ([eE] [0-9]+)?
    ;

StringLiteral
    : '"' ~["\r\n\\]* '"'
    | '\'' ~['\r\n\\]* '\''
    ;

HexLiteral
    : '0' [xX] [0-9A-Fa-f]+
    ;

ReservedFunctions
    : 'require'
    | 'abs'
    | 'min'
    | 'max'
    | 'within'
    | 'ripemd160'
    | 'sha1'
    | 'sha256'
    | 'hash160'
    | 'hash256'
    | 'checkSig'
    | 'checkDataSig'
    | 'checkMultiSig'
    ;

Identifier
    : [a-zA-Z] [a-zA-Z0-9$_]*
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
