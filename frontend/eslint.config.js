import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['src/**/*.{ts,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
];
