import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import typeNameMatchesFileNameRule from '../../eslint/rules/naming/type-name-matches-file-name.mjs';

interface LintNamingRuleOptions {
  code: string;
  filename: string;
}

function lintNamingRule({
  code,
  filename,
}: LintNamingRuleOptions): Linter.LintMessage[] {
  const linter = new Linter();

  return linter.verify(
    code,
    [
      {
        files: ['**/*.ts'],
        languageOptions: {
          parser: tseslint.parser,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
        },
        plugins: {
          naming: {
            rules: {
              'type-name-matches-file-name': typeNameMatchesFileNameRule,
            },
          },
        },
        rules: {
          'naming/type-name-matches-file-name': 'error',
        },
      },
    ],
    { filename },
  );
}

describe('naming ESLint rules', () => {
  describe('type-name-matches-file-name', () => {
    it('파일명에 맞는 타입을 선언하면 통과한다', () => {
      const messages = lintNamingRule({
        filename: 'user-profile.entity.ts',
        code: `
          export interface UserProfileProps {
            name: string;
          }

          export class UserProfile {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('파일명에 맞는 타입을 선언하지 않으면 위반으로 보고한다', () => {
      const messages = lintNamingRule({
        filename: 'user-profile.entity.ts',
        code: `
          export class Account {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'naming/type-name-matches-file-name',
        message: 'Expected this file to declare UserProfile.',
      });
    });
  });
});
