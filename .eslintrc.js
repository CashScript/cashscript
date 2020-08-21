module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
  env: {
    'jest': true,
  },
  rules: {
    'arrow-parens': ['error', 'as-needed', { "requireForBlockBody": true }],
    'import/no-cycle': 0, // Needed for AST -> AstVisitor -> AST
    'class-methods-use-this': 0, // I don't like this rule
    'no-underscore-dangle': 0, // antlr4ts automatically uses this
    'no-else-return': 0, // I think it looks clearer with else-ifs, rather than many ifs
    'no-param-reassign': 0, // Makes visitors returning the node object easier
    'lines-between-class-members': [ // Makes defining interfaces / abstract classes easier
      'error',
      'always',
      { exceptAfterSingleLine: true }
    ],
    'no-useless-constructor': 0, // Empty Typescript constructors are not useless
    'no-empty-function': 0, // Empty Typescript constructors are not useless
    'no-use-before-define': 0, // Makes it possible to read code top-down
    'no-console': 0, // I want to print stuff
    'func-names': 0, // Unnamed function parameters
    'no-unused-expressions': 'off', // Turn off to use typescript equivalent
    '@typescript-eslint/no-unused-expressions': [ // Short circuiting is pretty cool
      'error',
      { allowShortCircuit: true }
    ],
    '@typescript-eslint/brace-style': ['error', '1tbs'],
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'no-bitwise': 0,
    'no-restricted-syntax': 0,
    'no-dupe-class-members': 0,
    'no-constant-condition': 0,
    'no-await-in-loop': 0,
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/no-use-before-define': 0, // I want to read top-bottom
    'quotes': 'off', // Turn off to use typescript equivalent
    '@typescript-eslint/quotes': ['error', 'single'], // Single quotes
    'max-classes-per-file': 0, // Multiple classes in one file (e.g. Type)
  },
}
