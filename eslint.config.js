import js from '@eslint/js';
import airbnbBase from 'eslint-config-airbnb-base';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        es2021: true,
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...airbnbBase.rules,
      'import/extensions': ['error', 'ignorePackages', {
        js: 'always',
        mjs: 'always',
        jsx: 'always',
      }],
      'comma-dangle': ['error', 'always-multiline'],
      'no-else-return': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
