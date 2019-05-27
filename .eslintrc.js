module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
  env: {
    'mocha': true,
  },
  rules: {
    'import/no-cycle': false, // Needed for AST -> AstVisitor -> AST
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
    'no-unused-expressions': [ // Short circuiting is pretty cool
      'error',
      { allowShortCircuit: true }
    ],
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'no-bitwise': 0,
    'no-restricted-syntax': 0,
  },
}
