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
    : variableDefinition
    | tupleAssignment
    | assignStatement
    | timeOpStatement
    | requireStatement
    | ifStatement
    | consoleStatement
    ;

variableDefinition
    : typeName modifier* Identifier '=' expression ';'
    ;

tupleAssignment
    : typeName Identifier ',' typeName Identifier '=' expression ';'
    ;

assignStatement
    : Identifier '=' expression ';'
    ;

timeOpStatement
    : 'require' '(' TxVar '>=' expression (',' requireMessage)? ')' ';'
    ;

requireStatement
    : 'require' '(' expression (',' requireMessage)? ')' ';'
    ;

ifStatement
    : 'if' '(' expression ')' ifBlock=block ('else' elseBlock=block)?
    ;

consoleStatement
    : 'console.log' consoleParameterList ';'
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
    : Identifier expressionList // Only built-in functions are accepted
    ;

expressionList
    : '(' (expression (',' expression)* ','?)? ')'
    ;

expression
    : '(' expression ')' # Parenthesised
    | typeName '(' castable=expression (',' size=expression)? ','? ')' # Cast
    | functionCall # FunctionCallExpression
    | 'new' Identifier expressionList #Instantiation
    | expression '[' index=NumberLiteral ']' # TupleIndexOp
    | scope='tx.outputs' '[' expression ']' op=('.value' | '.lockingBytecode' | '.tokenCategory' | '.nftCommitment' | '.tokenAmount') # UnaryIntrospectionOp
    | scope='tx.inputs' '[' expression ']' op=('.value' | '.lockingBytecode' | '.outpointTransactionHash' | '.outpointIndex' | '.unlockingBytecode' | '.sequenceNumber' | '.tokenCategory' | '.nftCommitment' | '.tokenAmount') # UnaryIntrospectionOp
    | expression op=('.reverse()' | '.length') # UnaryOp
    | left=expression op='.split' '(' right=expression ')' # BinaryOp
    | element=expression '.slice' '(' start=expression ',' end=expression ')' # Slice
    | op=('!' | '-') expression # UnaryOp
    | left=expression op=('*' | '/' | '%') right=expression # BinaryOp
    | left=expression op=('+' | '-') right=expression # BinaryOp
    // | expression ('>>' | '<<') expression --- OP_LSHIFT & RSHIFT are disabled in BCH Script
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
    : '-'? NumberPart ExponentPart?
    ;

NumberPart
    : [0-9]+ ('_' [0-9]+)*
    ;

ExponentPart
    : [eE] NumberPart
    ;

Bytes
    : 'bytes' Bound? | 'byte'
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
