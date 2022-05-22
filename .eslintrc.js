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
    'import/no-cycle': 0, // Needed for AST -> AstVisitor -> AST
    'class-methods-use-this': 0, // I don't like this rule
    'no-underscore-dangle': 0, // antlr4ts automatically uses this
    'no-param-reassign': 0, // Makes visitors returning the node object easier
    '@typescript-eslint/lines-between-class-members': [ // Makes defining interfaces / abstract classes easier
      'error',
      'always',
      { exceptAfterSingleLine: true }
    ],
    'no-useless-constructor': 0, // Empty Typescript constructors are not useless
    'no-empty-function': 0, // Empty Typescript constructors are not useless
    '@typescript-eslint/no-use-before-define': 0, // Makes it possible to read code top-down
    'no-console': 0, // I want to print stuff
    'no-unused-expressions': 'off', // Turn off to use typescript equivalent
    '@typescript-eslint/no-unused-expressions': [ // Short circuiting is pretty cool
      'error',
      { allowShortCircuit: true }
    ],
    'import/prefer-default-export': 0, // Useful when creating util files that may get expanded
    'import/no-extraneous-dependencies': 0, // This gives weird errors
    'no-bitwise': 0, // Need to use bitwise operators
    'no-restricted-syntax': 0, // Sometimes for...of loops are useful cause they can `break`
    'no-await-in-loop': 0, // Await in loops is sometimes needed
    '@typescript-eslint/explicit-function-return-type': [ // Strict interface definitions
      'error',
      { allowExpressions: true }
    ],
    'max-classes-per-file': 0, // Multiple classes in one file are allowed (e.g. Errors)
    '@typescript-eslint/no-redeclare': 0, // I sometimes name variables an types the same
    'linebreak-style': 0, // Ignore linebreak lints https://stackoverflow.com/a/43008668/1129108
    'import/extensions': ['error', 'always'], // ESM requires file extensins
  },
}
