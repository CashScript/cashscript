grammar CashScript;

/* This will be the entry point of our parser. */
eval: additionExp;

/* Addition and subtraction have the lowest precedence. */
additionExp: multiplyExp ('+' multiplyExp | '-' multiplyExp)*;

/* Multiplication and division have a higher precedence. */
multiplyExp: atomExp ('*' atomExp | '/' atomExp)*;

/* An expression atom is the smallest part of an expression: a number. Or
   when we encounter parenthesis, we're making a recursive call back to the
   rule 'additionExp'. As you can see, an 'atomExp' has the highest precedence. */
atomExp: NUMBER | '(' additionExp ')';

/* A number: can be an integer value, or a decimal value */
NUMBER: ('0'..'9')+ ('.' ('0'..'9')+)?;

/* We're going to ignore all white space characters */
WHITESPACE: (' ' | '\t' | '\r'| '\n') -> channel(HIDDEN);
