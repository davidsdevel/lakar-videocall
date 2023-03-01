module.exports = {
  env: {
    'browser': true,
    'es6': true,
    'node': true
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  extends: [
    'eslint:recommended'
  ],
  rules: {
    semi: ['warn', 'always'],
    quotes: ['warn', 'single'],
    'array-bracket-spacing': 'error',
    'arrow-spacing': 'error',
    complexity: 'off',
    curly: 'off',
    'no-buffer-constructor': 'error',
    'no-var': 'error',
    'no-console': 'warn'
  }
};
