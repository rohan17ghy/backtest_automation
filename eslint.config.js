//This file is expected to be a JS file
// eslint.config.js
import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import { parseForESLint } from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'], // Include TypeScript files
    languageOptions: {
      parser: {
        parseForESLint,
        // You can add parserOptions here if needed
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          project: './tsconfig.json', // Point to your tsconfig.json
        },
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypeScript,
      'import': eslintPluginImport,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-cycle': 'error'
      // Add more rules as needed
    },
  },
];
