// @ts-check
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = fileURLToPath(new URL('..', import.meta.url));

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
);
