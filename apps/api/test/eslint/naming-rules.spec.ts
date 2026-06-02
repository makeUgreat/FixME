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

    it('type 파일은 여러 관련 타입을 선언해도 통과한다', () => {
      const messages = lintNamingRule({
        filename: 'mapper.type.ts',
        code: `
          export interface ApplicationMapper {}
          export interface PersistenceMapper {}
          export interface PresentationMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('error mapper 파일은 source error를 드러내는 mapper 이름을 허용한다', () => {
      const messages = lintNamingRule({
        filename: 'create-correction-error.mapper.ts',
        code: `
          export class CreateCorrectionDomainErrorToApplicationErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('error mapper base 파일은 base class 이름과 일치해야 한다', () => {
      const messages = lintNamingRule({
        filename: 'application-error-mapper.base.ts',
        code: `
          export abstract class DomainErrorToApplicationErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('base 파일은 Base suffix 타입 이름을 허용한다', () => {
      const messages = lintNamingRule({
        filename: 'application-error.base.ts',
        code: `
          export interface ApplicationErrorBase {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('일반 mapper 파일은 파일명과 타입 이름이 일치해야 한다', () => {
      const messages = lintNamingRule({
        filename: 'create-correction-http-response.mapper.ts',
        code: `
          export class CreateCorrectionDomainResponseMapper {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'naming/type-name-matches-file-name',
        message:
          'Expected this file to declare CreateCorrectionHttpResponseMapper.',
      });
    });
  });
});
