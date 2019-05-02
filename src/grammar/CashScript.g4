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
    | throwStatement
    | functionCallStatement
    | ifStatement
    ;

variableDefinition
    : typeName Identifier '=' expression ';'
    ;

assignStatement
    : Identifier '=' expression ';'
    ;

// OP_RETURN invalidates a transaction, so that would more relate to the 'throw' keyword,
// but if we want subroutines, return would mean regular return
throwStatement
    : 'throw' expression? ';'
    ;

functionCallStatement
    : functionCall ';'
    ;

ifStatement
    : 'if' '(' expression ')' ifBlock=block ('else' elseBlock=block)?
    ;

cast
    : typeName '(' expression ')'
    ;

functionCall
    : GlobalFunction expressionList // Only built-in functions are accepted
    ;

expressionList
    : '(' (expression (',' expression)*)? ')'
    ;

expression
    : '(' paren=expression ')' // parentheses
    | cast
    | functionCall
    | obj=expression '.' Identifier // member access
    | obj=expression '.' Identifier '(' expressionList ')' // member function call
    // | left=expression op=('++' | '--')
    // | op=('!' | '~' | '+' | '-' | '++' | '--') right=expression
    | op=('!' | '~' | '+' | '-') right=expression
    // | expression '**' expression --- No power
    // | expression ('*' | '/' | '%') expression --- OP_MUL is still disabled
    | left=expression op=('/' | '%') right=expression
    | left=expression op=('+' | '-') right=expression
    // | expression ('>>' | '<<') expression --- OP_LSHIFT 7 RSHIFT are disabled
    | left=expression op=('<' | '<=' | '>' | '>=') right=expression
    | left=expression op=('==' | '!=') right=expression
    | left=expression op='&' right=expression
    | left=expression op='^' right=expression
    | left=expression op='|' right=expression
    | left=expression op='&&' right=expression
    | left=expression op='||' right=expression
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
    // : 'int' | 'bool' | 'string' | 'address' | 'pubkey' | 'sig' | Bytes
    : 'int' | 'bool' | 'string' | 'pubkey' | 'sig' | Bytes
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
    : [0-9]* ([eE] [0-9]+)?
    ;

StringLiteral
    : '"' ('\\"' | ~["\r\n])*? '"'
    | '\'' ('\\\'' | ~['\r\n])*? '\''
    ;

HexLiteral
    : '0' [xX] [0-9A-Fa-f]+
    ;

GlobalFunction
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
