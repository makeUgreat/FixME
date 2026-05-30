import path from 'node:path';
import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import factoryResultReturnRule from '../../eslint/rules/domain/factory-result-return.mjs';
import noDirectNewRule from '../../eslint/rules/domain/no-direct-new.mjs';
import requireUnitSpecRule from '../../eslint/rules/domain/require-unit-spec.mjs';
import splitMultipleValidationErrorsRule from '../../eslint/rules/domain/split-multiple-validation-errors.mjs';

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

  describe('require-unit-spec', () => {
    it('도메인 모델과 같은 위치에 unit spec이 있으면 통과한다', () => {
      const messages = lintDomainRule({
        filename: path.join(
          tsconfigRootDir,
          'test/eslint/fixtures/sample.entity.ts',
        ),
        ruleName: 'require-unit-spec',
        rule: requireUnitSpecRule,
        code: `
          export class Sample {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('도메인 모델과 같은 위치에 unit spec이 없으면 위반으로 보고한다', () => {
      const messages = lintDomainRule({
        filename: path.join(
          tsconfigRootDir,
          'test/eslint/fixtures/missing-spec.vo.ts',
        ),
        ruleName: 'require-unit-spec',
        rule: requireUnitSpecRule,
        code: `
          export class MissingSpec {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'domain/require-unit-spec',
        message:
          'Domain models must have a colocated unit spec file: missing-spec.vo.spec.ts.',
      });
    });
  });

  describe('split-multiple-validation-errors', () => {
    it('validateProps에서 직접 반환하는 검증 에러가 하나면 통과한다', () => {
      const messages = lintDomainRule({
        filename: 'sample.entity.ts',
        ruleName: 'split-multiple-validation-errors',
        rule: splitMultipleValidationErrorsRule,
        code: `
          import { err, ok } from '@libs/ddd';

          class Sample {
            private static validateProps(props: { name: string }) {
              if (props.name.length === 0) {
                return err(new Error('empty'));
              }

              return ok(props);
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('validateProps에서 검증 에러를 두 개 이상 직접 반환하면 위반으로 보고한다', () => {
      const messages = lintDomainRule({
        filename: 'sample.entity.ts',
        ruleName: 'split-multiple-validation-errors',
        rule: splitMultipleValidationErrorsRule,
        code: `
          import { err, ok } from '@libs/ddd';

          class Sample {
            private static validateProps(props: { name: string; title: string }) {
              if (props.name.length === 0) {
                return err(new Error('empty name'));
              }

              if (props.title.length === 0) {
                return err(new Error('empty title'));
              }

              return ok(props);
            }
          }
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'domain/split-multiple-validation-errors',
        message:
          'Split validateProps validation rules into named methods when returning more than one validation error directly.',
      });
    });

    it('검증 규칙을 다른 메서드로 분리하면 메서드 이름과 무관하게 통과한다', () => {
      const messages = lintDomainRule({
        filename: 'sample.entity.ts',
        ruleName: 'split-multiple-validation-errors',
        rule: splitMultipleValidationErrorsRule,
        code: `
          import { err, ok } from '@libs/ddd';

          class Sample {
            private static validateProps(props: { name: string; title: string }) {
              return Sample.checkName(props.name)
                .andThen(() => Sample.guardTitle(props.title))
                .map(() => props);
            }

            private static checkName(name: string) {
              return name.length === 0 ? err(new Error('empty name')) : ok(undefined);
            }

            private static guardTitle(title: string) {
              return title.length === 0 ? err(new Error('empty title')) : ok(undefined);
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });
});
