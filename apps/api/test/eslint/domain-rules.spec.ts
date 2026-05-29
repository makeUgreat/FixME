import path from 'node:path';
import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import factoryResultReturnRule from '../../eslint/rules/domain/factory-result-return.mjs';
import noDirectNewRule from '../../eslint/rules/domain/no-direct-new.mjs';

const tsconfigRootDir = process.cwd();

interface LintDomainRuleOptions {
  code: string;
  filename: string;
  ruleName: string;
  rule: Rule.RuleModule;
  typed?: boolean;
}

function lintDomainRule({
  code,
  filename,
  ruleName,
  rule,
  typed = false,
}: LintDomainRuleOptions): Linter.LintMessage[] {
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
            ...(typed
              ? {
                  projectService: true,
                  tsconfigRootDir,
                }
              : {}),
          },
        },
        plugins: {
          domain: {
            rules: {
              [ruleName]: rule,
            },
          },
        },
        rules: {
          [`domain/${ruleName}`]: 'error',
        },
      },
    ],
    { filename },
  );
}

describe('domain ESLint rules', () => {
  describe('factory-result-return', () => {
    it('도메인 모델 factory가 Result 반환 타입을 명시하면 통과한다', () => {
      const messages = lintDomainRule({
        filename: 'sample.entity.ts',
        ruleName: 'factory-result-return',
        rule: factoryResultReturnRule,
        code: `
          import type { Result } from 'neverthrow';

          class Sample {
            static create(): Result<Sample, Error> {
              throw new Error();
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('도메인 모델 factory가 Result 반환 타입을 명시하지 않으면 위반으로 보고한다', () => {
      const messages = lintDomainRule({
        filename: 'sample.entity.ts',
        ruleName: 'factory-result-return',
        rule: factoryResultReturnRule,
        code: `
          class Sample {
            static create(): Sample {
              throw new Error();
            }
          }
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'domain/factory-result-return',
        message: 'Public domain model factories must explicitly return Result.',
      });
    });
  });

  describe('no-direct-new', () => {
    it('도메인 모델 class 본문 안에서 생성자를 호출하면 통과한다', () => {
      const messages = lintDomainRule({
        filename: path.join(
          tsconfigRootDir,
          'test/eslint/fixtures/sample.entity.ts',
        ),
        ruleName: 'no-direct-new',
        rule: noDirectNewRule,
        typed: true,
        code: `
          export class Sample {
            constructor() {}

            static create(): Sample {
              return new Sample();
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('도메인 모델 class 밖에서 생성자를 직접 호출하면 위반으로 보고한다', () => {
      const messages = lintDomainRule({
        filename: path.join(
          tsconfigRootDir,
          'test/eslint/fixtures/consumer.ts',
        ),
        ruleName: 'no-direct-new',
        rule: noDirectNewRule,
        typed: true,
        code: `
          import { Sample } from './sample.entity';

          const sample = new Sample();
          void sample;
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'domain/no-direct-new',
        message:
          'Create domain models through create, restore, or of instead of new.',
      });
    });
  });
});
