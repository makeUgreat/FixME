import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import integrationAdapterTargetFileNameRule from '../../eslint/rules/test/integration-adapter-target-file-name.mjs';
import integrationDescribeNameRule from '../../eslint/rules/test/integration-describe-name.mjs';
import integrationFileLocationRule from '../../eslint/rules/test/integration-file-location.mjs';
import koreanTestCaseNameRule from '../../eslint/rules/test/korean-test-case-name.mjs';
import noDirectIntegrationBootstrapRule from '../../eslint/rules/test/no-direct-integration-bootstrap.mjs';
import noMisleadingIntegrationFileNameRule from '../../eslint/rules/test/no-misleading-integration-file-name.mjs';

interface LintTestRuleOptions {
  code: string;
  filename: string;
  ruleName: string;
  rule: Rule.RuleModule;
  ruleOptions?: unknown[];
}

function lintTestRule({
  code,
  filename,
  ruleName,
  rule,
  ruleOptions = [],
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
          [`test/${ruleName}`]: ['error', ...ruleOptions],
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

  describe('integration-adapter-target-file-name', () => {
    it('HTTP controller adapter target이 파일명에 드러나면 통과한다', () => {
      const messages = lintTestRule({
        filename:
          'test/corrections/corrections-http.controller.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('CorrectionsHttpController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('repository adapter target이 파일명에 드러나면 통과한다', () => {
      const messages = lintTestRule({
        filename:
          'test/corrections/correction.repository.memory.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('MemoryCorrectionRepository (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('app bootstrap target 파일명은 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/app/app.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        ruleOptions: [{ systemTargets: ['app'] }],
        code: `
          describe('AppModule (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('ESLint harness target 파일명은 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/eslint/eslint-config.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        ruleOptions: [{ systemTargets: ['eslint-config'] }],
        code: `
          describe('ESLint config (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('system target이 설정되지 않으면 일반 통합 테스트 파일명으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/app/app.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('AppModule (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-adapter-target-file-name',
      });
    });

    it('adapter target이 없는 통합 테스트 파일명은 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/corrections/corrections.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('Corrections (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-adapter-target-file-name',
      });
    });

    it('technology segment가 없는 repository 통합 테스트 파일명은 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/corrections/correction.repository.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('CorrectionRepository (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-adapter-target-file-name',
      });
    });

    it('일반 persistence 이름의 통합 테스트 파일명은 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/corrections/correction.persistence.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('CorrectionPersistence (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-adapter-target-file-name',
      });
    });

    it('adapter라는 meta 이름의 통합 테스트 파일명은 위반으로 보고한다', () => {
      const messages = lintTestRule({
        filename: 'test/corrections/correction.adapter.integration-spec.ts',
        ruleName: 'integration-adapter-target-file-name',
        rule: integrationAdapterTargetFileNameRule,
        code: `
          describe('CorrectionAdapter (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/integration-adapter-target-file-name',
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

  describe('no-misleading-integration-file-name', () => {
    it('integration 이름 구간이 있으면 integration spec suffix를 요구한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration.spec.ts',
        ruleName: 'no-misleading-integration-file-name',
        rule: noMisleadingIntegrationFileNameRule,
        code: `
          describe('MetricsController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        ruleId: 'test/no-misleading-integration-file-name',
      });
    });

    it('integration spec suffix를 쓰면 통과한다', () => {
      const messages = lintTestRule({
        filename: 'test/metrics/metrics.integration-spec.ts',
        ruleName: 'no-misleading-integration-file-name',
        rule: noMisleadingIntegrationFileNameRule,
        code: `
          describe('MetricsController (integration)', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('integration 이름 구간이 없는 unit spec은 통과한다', () => {
      const messages = lintTestRule({
        filename: 'src/metrics/metrics.service.spec.ts',
        ruleName: 'no-misleading-integration-file-name',
        rule: noMisleadingIntegrationFileNameRule,
        code: `
          describe('MetricsService', () => {});
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });
});
