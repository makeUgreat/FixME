import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import integrationDescribeNameRule from '../../eslint/rules/test/integration-describe-name.mjs';
import integrationFileLocationRule from '../../eslint/rules/test/integration-file-location.mjs';
import koreanTestCaseNameRule from '../../eslint/rules/test/korean-test-case-name.mjs';
import noDirectIntegrationBootstrapRule from '../../eslint/rules/test/no-direct-integration-bootstrap.mjs';

interface LintTestRuleOptions {
  code: string;
  filename: string;
  ruleName: string;
  rule: Rule.RuleModule;
}

function lintTestRule({
  code,
  filename,
  ruleName,
  rule,
}: LintTestRuleOptions): Linter.LintMessage[] {
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
          test: {
            rules: {
              [ruleName]: rule,
            },
          },
        },
        rules: {
          [`test/${ruleName}`]: 'error',
        },
      },
    ],
    { filename },
  );
}

describe('test ESLint rules', () => {
  describe('korean-test-case-name', () => {
    it('테스트명이 한글 문장에 영어 기술 용어를 섞으면 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics.integration-spec.ts',
        ruleName: 'korean-test-case-name',
        rule: koreanTestCaseNameRule,
        code: `
          it('GET /metrics 요청이면 Prometheus metrics를 반환한다', () => {});
          test('UserService가 id로 사용자를 찾으면 User를 반환한다', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('테스트명이 순수 영어 문장이면 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics.integration-spec.ts',
        ruleName: 'korean-test-case-name',
        rule: koreanTestCaseNameRule,
        code: `
          it('returns metrics for a valid request', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/korean-test-case-name',
      });
    });

    it('테스트명이 동적 문자열이면 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics.integration-spec.ts',
        ruleName: 'korean-test-case-name',
        rule: koreanTestCaseNameRule,
        code: `
          const condition = '정상 요청';
          it(condition, () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/korean-test-case-name',
      });
    });
  });

  describe('integration-file-location', () => {
    it('integration spec이 test 도메인 디렉터리 아래에 있으면 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration-spec.ts',
        ruleName: 'integration-file-location',
        rule: integrationFileLocationRule,
        code: `
          describe('MetricsController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('integration spec이 test 바로 아래에 있으면 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics.integration-spec.ts',
        ruleName: 'integration-file-location',
        rule: integrationFileLocationRule,
        code: `
          describe('MetricsController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-file-location',
      });
    });

    it('integration spec이 test 디렉터리 밖에 있으면 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'src/metrics/metrics.integration-spec.ts',
        ruleName: 'integration-file-location',
        rule: integrationFileLocationRule,
        code: `
          describe('MetricsController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-file-location',
      });
    });
  });

  describe('integration-describe-name', () => {
    it('integration spec의 outer describe에 integration 표기가 있으면 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration-spec.ts',
        ruleName: 'integration-describe-name',
        rule: integrationDescribeNameRule,
        code: `
          describe('MetricsController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('integration spec의 outer describe에 integration 표기가 없으면 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration-spec.ts',
        ruleName: 'integration-describe-name',
        rule: integrationDescribeNameRule,
        code: `
          describe('MetricsController', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-describe-name',
      });
    });
  });

  describe('no-direct-integration-bootstrap', () => {
    it('integration spec에서 createTestNestApp helper를 쓰면 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration-spec.ts',
        ruleName: 'no-direct-integration-bootstrap',
        rule: noDirectIntegrationBootstrapRule,
        code: `
          import { createTestNestApp } from './support/create-test-nest-app';
          void createTestNestApp;
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('integration spec에서 Nest testing module을 직접 import하면 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration-spec.ts',
        ruleName: 'no-direct-integration-bootstrap',
        rule: noDirectIntegrationBootstrapRule,
        code: `
          import { Test } from '@nestjs/testing';
          void Test;
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/no-direct-integration-bootstrap',
      });
    });
  });
});
