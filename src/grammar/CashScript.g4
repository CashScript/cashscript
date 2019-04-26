grammar CashScript;

sourceFile
    : contractDefinition EOF
    ;

contractDefinition
    : 'contract' Identifier parameterList '{' variableDefinition* functionDefinition* '}'
    ;

functionDefinition
    : 'function' Identifier parameterList '{' statement* '}'
    ;

block
    : '{' statement* '}'
    | statement
    ;

statement
    : variableDefinition
    | assignStatement
    | ifStatement
    | throwStatement
    | functionCallStatement
    ;

variableDefinition
    : typeName Identifier '=' expression ';'
    ;

assignStatement
    : Identifier '=' expression ';'
    ;

ifStatement
    : 'if' '(' expression ')' block ('else' block)?
    ;

// OP_RETURN invalidates a transaction, so that would more relate to the 'throw' keyword,
// but if we want subroutines, return would mean regular return
throwStatement
    : 'throw' expression? ';'
    ;

functionCallStatement
    : functionCall ';'
    ;

functionCall
    : ReservedFunction expressionList // Only built-in functions are accepted
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
    : '(' expression ')' // parentheses
    | typeName '(' expression ')' // cast
    | functionCall
    | expression '.' Identifier // member access
    | expression '.' functionCall // member function call
    | expression ('++' | '--')
    | ('!' | '~' | '+' | '-' | '++' | '--') expression
    // | expression '**' expression --- No power
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
    | Identifier
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
    : 'int' | 'bool' | 'string' | 'address' | 'pubkey' | 'sig' | Bytes
    ;

Bytes
    : 'bytes' | 'bytes20' | 'bytes32'
    ;

BooleanLiteral
    : 'true' | 'false'
    ;

NumberUnit
    : 'satoshis' | 'sats' | 'finney' | 'bits' | 'bitcoin'
    | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks'
    ;

NumberLiteral
    : [1-9] [0-9]* ([eE] [0-9]+)?
    ;

StringLiteral
    : '"' ('\\"' | ~["\r\n])*? '"'
    | '\'' ('\\\'' | ~['\r\n])*? '\''
    ;

HexLiteral
    : '0' [xX] [0-9A-Fa-f]+
    ;

ReservedFunction
    : 'require'
    | 'abs'
    | 'min'
    | 'max'
    | 'within'
    | 'ripemd160'
    | 'sha1'
    | 'sha256'
    | 'sigCheck'
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
