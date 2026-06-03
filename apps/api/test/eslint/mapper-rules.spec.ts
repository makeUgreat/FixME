import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import implementsLayerMapperRule from '../../eslint/rules/mapper/implements-layer-mapper.mjs';
import noDomainModelSerializationRule from '../../eslint/rules/mapper/no-domain-model-serialization.mjs';
import noErrorContractInMapperRule from '../../eslint/rules/mapper/no-error-contract-in-mapper.mjs';
import noNestInApplicationErrorRule from '../../eslint/rules/mapper/no-nest-in-application-error.mjs';
import noNestInApplicationMapperRule from '../../eslint/rules/mapper/no-nest-in-application-mapper.mjs';
import preferApplicationErrorOfRule from '../../eslint/rules/mapper/prefer-application-error-of.mjs';

const implementsLayerMapperRuleModule =
  implementsLayerMapperRule as Rule.RuleModule;
const noDomainModelSerializationRuleModule =
  noDomainModelSerializationRule as Rule.RuleModule;
const noErrorContractInMapperRuleModule =
  noErrorContractInMapperRule as Rule.RuleModule;
const noNestInApplicationErrorRuleModule =
  noNestInApplicationErrorRule as Rule.RuleModule;
const noNestInApplicationMapperRuleModule =
  noNestInApplicationMapperRule as Rule.RuleModule;
const preferApplicationErrorOfRuleModule = preferApplicationErrorOfRule;

interface LintMapperRuleOptions {
  code: string;
  filename: string;
  ruleName: string;
  rule: Rule.RuleModule;
}

function lintMapperRule({
  code,
  filename,
  ruleName,
  rule,
}: LintMapperRuleOptions): Linter.LintMessage[] {
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
          mapper: {
            rules: {
              [ruleName]: rule,
            },
          },
        },
        rules: {
          [`mapper/${ruleName}`]: 'error',
        },
      },
    ],
    { filename },
  );
}

function firstMessage(messages: Linter.LintMessage[]): Linter.LintMessage {
  const message = messages[0];

  if (!message) {
    throw new Error('Expected a lint message.');
  }

  return message;
}

describe('mapper ESLint rules', () => {
  describe('implements-layer-mapper', () => {
    it('HTTP presentation error mapper가 PresentationHttpErrorMapper를 상속하면 통과한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/presentation/correction-http-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionHttpErrorMapper extends PresentationHttpErrorMapper<Error> {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('HTTP presentation error mapper가 PresentationHttpErrorMapper를 상속하지 않으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/presentation/correction-http-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionHttpErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/implements-layer-mapper',
        message:
          'Mapper class CorrectionHttpErrorMapper must extend PresentationHttpErrorMapper.',
      });
    });

    it('HTTP가 아닌 presentation error mapper는 PresentationMapper 구현을 요구한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/presentation/correction-graphql-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionGraphqlErrorMapper implements PresentationMapper<Error, object> {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('HTTP가 아닌 presentation error mapper가 PresentationMapper를 구현하지 않으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/presentation/correction-graphql-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionGraphqlErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/implements-layer-mapper',
        message:
          'Mapper class CorrectionGraphqlErrorMapper must implement PresentationMapper.',
      });
    });

    it('infrastructure persistence mapper가 PersistenceAggregateMapper를 상속하지 않으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/infrastructure/persistence/postgres-drizzle/correction-persistence.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionPersistenceMapper {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/implements-layer-mapper',
        message:
          'Mapper class CorrectionPersistenceMapper must extend PersistenceAggregateMapper.',
      });
    });

    it('infrastructure mapper가 PersistenceAggregateMapper를 상속하면 통과한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/infrastructure/persistence/postgres-drizzle/correction-persistence.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionPersistenceMapper extends PersistenceAggregateMapper<Correction, CorrectionRow, InsertCorrectionRow, Error> {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('persistence가 아닌 infrastructure mapper는 aggregate persistence contract를 요구하지 않는다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/infrastructure/messaging/sqs/correction-message.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CorrectionMessageMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('application error mapper가 DomainErrorToApplicationErrorMapper를 상속하면 통과한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CreateCorrectionDomainErrorToApplicationErrorMapper extends DomainErrorToApplicationErrorMapper<Error, object> {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('domain error가 아닌 application error mapper가 ApplicationMapper를 구현하면 통과한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CreateCorrectionRepositoryErrorToApplicationErrorMapper implements ApplicationMapper<Error, object> {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('application error mapper가 DomainErrorToApplicationErrorMapper를 구현하면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CreateCorrectionDomainErrorToApplicationErrorMapper implements DomainErrorToApplicationErrorMapper<Error, object> {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/implements-layer-mapper',
        message:
          'Mapper class CreateCorrectionDomainErrorToApplicationErrorMapper must extend DomainErrorToApplicationErrorMapper.',
      });
    });

    it('application error mapper가 DomainErrorToApplicationErrorMapper를 상속하지 않으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'implements-layer-mapper',
        rule: implementsLayerMapperRuleModule,
        code: `
          class CreateCorrectionDomainErrorToApplicationErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/implements-layer-mapper',
        message:
          'Mapper class CreateCorrectionDomainErrorToApplicationErrorMapper must extend DomainErrorToApplicationErrorMapper.',
      });
    });
  });

  describe('no-domain-model-serialization', () => {
    it('domain model에 boundary serialization 메서드가 있으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename: 'src/modules/corrections/domain/correction.aggregate.ts',
        ruleName: 'no-domain-model-serialization',
        rule: noDomainModelSerializationRuleModule,
        code: `
          class Correction {
            toResponse() {
              return {};
            }
          }
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/no-domain-model-serialization',
        message:
          'Keep boundary serialization in mappers instead of domain models.',
      });
    });
  });

  describe('no-nest-in-application-mapper', () => {
    it('application mapper가 Nest 타입을 import하면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'no-nest-in-application-mapper',
        rule: noNestInApplicationMapperRuleModule,
        code: `
          import { HttpStatus } from '@nestjs/common';

          class CreateCorrectionDomainErrorToApplicationErrorMapper {}
          void HttpStatus;
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/no-nest-in-application-mapper',
        message:
          'Application mappers must not import Nest or HTTP types. Translate HTTP concerns in presentation mappers.',
      });
    });
  });

  describe('no-nest-in-application-error', () => {
    it('application error contract가 Nest 타입을 import하면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction.error.ts',
        ruleName: 'no-nest-in-application-error',
        rule: noNestInApplicationErrorRuleModule,
        code: `
          import { HttpStatus } from '@nestjs/common';

          export interface CreateCorrectionError {
            readonly status: HttpStatus;
          }
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/no-nest-in-application-error',
        message:
          'Application error contracts must not import Nest or HTTP types. Map HTTP concerns in presentation mappers.',
      });
    });

    it('application error contract가 아니면 Nest 타입 import를 검사하지 않는다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/presentation/correction-http-error.mapper.ts',
        ruleName: 'no-nest-in-application-error',
        rule: noNestInApplicationErrorRuleModule,
        code: `
          import { HttpStatus } from '@nestjs/common';

          export class CorrectionHttpErrorMapper {
            toStatus() {
              return HttpStatus.BAD_REQUEST;
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });

  describe('no-error-contract-in-mapper', () => {
    it('mapper 파일에서 error interface를 export하면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'no-error-contract-in-mapper',
        rule: noErrorContractInMapperRuleModule,
        code: `
          export interface CreateCorrectionError {
            readonly code: string;
          }
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/no-error-contract-in-mapper',
        message:
          'Mapper files must not export error contracts. Put application error types in .error.ts files.',
      });
    });

    it('mapper 파일에서 error type을 export하면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'no-error-contract-in-mapper',
        rule: noErrorContractInMapperRuleModule,
        code: `
          export type CreateCorrectionError = {
            readonly code: string;
          };
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/no-error-contract-in-mapper',
        message:
          'Mapper files must not export error contracts. Put application error types in .error.ts files.',
      });
    });

    it('mapper 파일의 내부 helper error type은 허용한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction-error.mapper.ts',
        ruleName: 'no-error-contract-in-mapper',
        rule: noErrorContractInMapperRuleModule,
        code: `
          type CreateCorrectionError = {
            readonly code: string;
          };

          export class CreateCorrectionDomainErrorToApplicationErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('.error.ts 파일의 error contract export는 허용한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction.error.ts',
        ruleName: 'no-error-contract-in-mapper',
        rule: noErrorContractInMapperRuleModule,
        code: `
          export interface CreateCorrectionError {
            readonly code: string;
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });

  describe('prefer-application-error-of', () => {
    it('ApplicationErrorOf를 사용하면 통과한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction.error.ts',
        ruleName: 'prefer-application-error-of',
        rule: preferApplicationErrorOfRuleModule,
        code: `
          import { APPLICATION_ERROR_KIND, type ApplicationErrorOf } from '@libs/layer';

          export type CreateCorrectionValidationFailedError =
            ApplicationErrorOf<
              typeof APPLICATION_ERROR_KIND.VALIDATION_FAILED,
              'create_correction',
              'command_invalid'
            >;
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('ApplicationErrorBase에 kind를 직접 넣으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction.error.ts',
        ruleName: 'prefer-application-error-of',
        rule: preferApplicationErrorOfRuleModule,
        code: `
          import { type ApplicationErrorBase } from '@libs/layer';

          export type CreateCorrectionValidationFailedError =
            ApplicationErrorBase<'validation_failed', 'create_correction.command_invalid'>;
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/prefer-application-error-of',
        message:
          'Use ApplicationErrorOf<Kind, Owner, Reason, Details> instead of spelling out the validation_failed application error shape.',
      });
    });

    it('application error shape를 type literal로 직접 쓰면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/application/commands/create-correction.error.ts',
        ruleName: 'prefer-application-error-of',
        rule: preferApplicationErrorOfRuleModule,
        code: `
          export type CreateCorrectionDependencyUnavailableError = {
            readonly kind: 'dependency_unavailable';
            readonly code: 'create_correction.persistence_unavailable';
            readonly message: string;
            readonly details: unknown;
          };
        `,
      });

      expect(messages).toHaveLength(1);
      expect(firstMessage(messages)).toMatchObject({
        ruleId: 'mapper/prefer-application-error-of',
        message:
          'Use ApplicationErrorOf<Kind, Owner, Reason, Details> instead of spelling out the dependency_unavailable application error shape.',
      });
    });

    it('application error contract가 아니면 검사하지 않는다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/presentation/correction-http-error.mapper.ts',
        ruleName: 'prefer-application-error-of',
        rule: preferApplicationErrorOfRuleModule,
        code: `
          type ResponseError = {
            readonly kind: 'validation_failed';
            readonly code: string;
          };
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });
});
