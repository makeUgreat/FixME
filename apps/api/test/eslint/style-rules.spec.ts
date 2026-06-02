import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import preferInlineSatisfiesRule from '../../eslint/rules/style/prefer-inline-satisfies.mjs';

const preferInlineSatisfiesRuleModule =
  preferInlineSatisfiesRule as Rule.RuleModule;

function lintStyleRule(code: string): Linter.LintMessage[] {
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
          style: {
            rules: {
              'prefer-inline-satisfies': preferInlineSatisfiesRuleModule,
            },
          },
        },
        rules: {
          'style/prefer-inline-satisfies': 'warn',
        },
      },
    ],
    { filename: 'src/modules/corrections/application/create-correction.ts' },
  );
}

describe('style ESLint rules', () => {
  describe('prefer-inline-satisfies', () => {
    it('typed object literal 변수를 바로 return call에 넘기면 warning으로 보고한다', () => {
      const messages = lintStyleRule(`
        function save() {
          const error: CreateCorrectionDependencyUnavailableError = {
            kind: 'dependency_unavailable',
            code: 'create_correction.persistence_unavailable',
            message: 'Correction could not be saved',
            details: {},
          };

          return err(error);
        }
      `);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        severity: 1,
        ruleId: 'style/prefer-inline-satisfies',
        message:
          'Inline this single-use typed object into the return call and keep structural checking with `satisfies CreateCorrectionDependencyUnavailableError`. Suggested shape: `return err({ ... } satisfies CreateCorrectionDependencyUnavailableError);`.',
      });
    });

    it('satisfies를 이미 사용한 inline return은 통과한다', () => {
      const messages = lintStyleRule(`
        function save() {
          return err({
            kind: 'dependency_unavailable',
            code: 'create_correction.persistence_unavailable',
            message: 'Correction could not be saved',
            details: {},
          } satisfies CreateCorrectionDependencyUnavailableError);
        }
      `);

      expect(messages).toHaveLength(0);
    });

    it('object literal이 아니면 통과한다', () => {
      const messages = lintStyleRule(`
        function save() {
          const error: CreateCorrectionDependencyUnavailableError =
            createDependencyUnavailableError();

          return err(error);
        }
      `);

      expect(messages).toHaveLength(0);
    });

    it('다음 statement에서 바로 return하지 않으면 통과한다', () => {
      const messages = lintStyleRule(`
        function save() {
          const error: CreateCorrectionDependencyUnavailableError = {
            kind: 'dependency_unavailable',
            code: 'create_correction.persistence_unavailable',
            message: 'Correction could not be saved',
            details: {},
          };

          logger.warn(error);
          return err(error);
        }
      `);

      expect(messages).toHaveLength(0);
    });

    it('let으로 선언한 변수는 통과한다', () => {
      const messages = lintStyleRule(`
        function save() {
          let error: CreateCorrectionDependencyUnavailableError = {
            kind: 'dependency_unavailable',
            code: 'create_correction.persistence_unavailable',
            message: 'Correction could not be saved',
            details: {},
          };

          return err(error);
        }
      `);

      expect(messages).toHaveLength(0);
    });
  });
});
