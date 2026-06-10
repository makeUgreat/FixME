// @ts-check
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPathStyle from './rules/import-path-style.mjs';

const tsconfigRootDir = fileURLToPath(new URL('..', import.meta.url));
const apiLocalRules = {
  rules: {
    'import-path-style': importPathStyle,
  },
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  {
    files: ['{src,test}/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: {},
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/__tests__/**/*.ts', 'src/**/*.{spec,test}.ts'],
    plugins: {
      'api-local': apiLocalRules,
    },
    rules: {
      'api-local/import-path-style': 'error',
    },
  },
);
