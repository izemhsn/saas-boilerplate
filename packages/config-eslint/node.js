import globals from 'globals';
import { defineConfig } from 'eslint/config';
import base from './base.js';

// For Node apps (the API): allows Node globals like process.
export default defineConfig([
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.node },
  },
]);
