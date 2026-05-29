// @ts-check
import eslint from '@eslint/js';
import checkFile from 'eslint-plugin-check-file';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import apiNaming from './eslint-rules/api-naming.mjs';

const noTypeScriptEnum = {
  selector: 'TSEnumDeclaration',
  message: 'Use as const constants plus union types instead of TypeScript enum.',
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
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
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
          leadingUnderscore: 'forbid',
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
      'no-restricted-syntax': [
        'error',
        noTypeScriptEnum,
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: [
      'src/main.ts',
      'src/**/index.ts',
      'src/**/*.spec.ts',
      'src/libs/guard.ts',
      'src/libs/ddd/domain-error.ts',
      'src/libs/ddd/result.ts',
    ],
    plugins: {
      'api-naming': apiNaming,
      'check-file': checkFile,
    },
    rules: {
      'api-naming/controller-protocol-name': 'error',
      'api-naming/file-role-type-suffix': 'error',
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.ts': '+([a-z0-9-]).+([a-z0-9-.])',
        },
      ],
    },
  },
  {
    files: ['src/**/*.aggregate.ts', 'src/**/*.entity.ts'],
    ignores: ['src/**/*.base.ts'],
    rules: {
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
            "MethodDefinition[static=true][kind='method']:not([accessibility='private']):not([accessibility='protected'])[key.name!='of']",
          message: 'Public static factories on value objects must be named of.',
        },
      ],
    },
  },
);
