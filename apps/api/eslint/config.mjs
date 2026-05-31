// @ts-check
import { fileURLToPath } from 'node:url';
import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import checkFile from 'eslint-plugin-check-file';
import neverthrow from 'eslint-plugin-neverthrow';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import domain from './plugins/domain.mjs';
import naming from './plugins/naming.mjs';
import test from './plugins/test.mjs';

const tsconfigRootDir = fileURLToPath(new URL('..', import.meta.url));

const noTypeScriptEnum = {
  selector: 'TSEnumDeclaration',
  message:
    'Use as const constants plus union types instead of TypeScript enum.',
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
  {
    plugins: {
      neverthrow: fixupPluginRules(neverthrow),
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'memberLike',
          modifiers: ['private', 'protected'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
      ],
      'no-restricted-syntax': ['error', noTypeScriptEnum],
      'neverthrow/must-use-result': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          vars: 'all',
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    plugins: {
      test,
    },
    rules: {
      'neverthrow/must-use-result': 'off',
      'test/korean-test-case-name': 'error',
      'test/integration-file-location': 'error',
      'test/integration-describe-name': 'error',
      'test/no-direct-integration-bootstrap': 'error',
      'test/no-misleading-integration-file-name': 'error',
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: [
      'src/main.ts',
      'src/**/index.ts',
      'src/**/*.spec.ts',
      'src/libs/guard.ts',
      'src/libs/ddd/domain.error.ts',
    ],
    plugins: {
      domain,
      naming,
      'check-file': checkFile,
    },
    rules: {
      'naming/type-name-matches-file-name': 'error',
      'domain/factory-result-return': 'error',
      'domain/no-direct-new': 'error',
      'domain/domain-error-shape': 'error',
      'domain/split-multiple-validation-errors': 'error',
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.ts': '+([a-z0-9-]).+([a-z0-9-.])',
        },
      ],
    },
  },
  {
    files: ['src/libs/ddd/domain.error.ts'],
    plugins: {
      domain,
    },
    rules: {
      'domain/no-global-domain-error-codes': 'error',
    },
  },
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/common',
              message:
                'Domain code must not import Nest or HTTP exceptions. Map domain errors at the API boundary.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.aggregate.ts', 'src/**/*.entity.ts'],
    ignores: ['src/**/*.base.ts'],
    rules: {
      'domain/require-unit-spec': 'error',
      'no-restricted-syntax': [
        'error',
        noTypeScriptEnum,
        {
          selector:
            "MethodDefinition[kind='constructor']:not([accessibility='private']):not([accessibility='protected'])",
          message:
            'Concrete domain model constructors must be private by default. Use protected only when subclassing is intentional.',
        },
        {
          selector:
            "MethodDefinition[static=true][kind='method']:not([accessibility='private']):not([accessibility='protected'])[key.name!=/^(create|restore)$/]",
          message:
            'Public static factories on aggregates and entities must be named create or restore.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.vo.ts'],
    ignores: ['src/**/*.base.ts'],
    rules: {
      'domain/require-unit-spec': 'error',
      'no-restricted-syntax': [
        'error',
        noTypeScriptEnum,
        {
          selector:
            "MethodDefinition[kind='constructor']:not([accessibility='private']):not([accessibility='protected'])",
          message:
            'Concrete value object constructors must be private by default. Use protected only when subclassing is intentional.',
        },
        {
          selector:
            "MethodDefinition[static=true][kind='method']:not([accessibility='private']):not([accessibility='protected'])[key.name!=/^(of|createMany)$/]",
          message:
            'Public static factories on value objects must be named of or createMany.',
        },
      ],
    },
  },
);
