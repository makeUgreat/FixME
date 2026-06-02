import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import implementsLayerMapperRule from '../../eslint/rules/mapper/implements-layer-mapper.mjs';
import noDomainModelSerializationRule from '../../eslint/rules/mapper/no-domain-model-serialization.mjs';
import noErrorContractInMapperRule from '../../eslint/rules/mapper/no-error-contract-in-mapper.mjs';
import noNestInApplicationErrorRule from '../../eslint/rules/mapper/no-nest-in-application-error.mjs';
import noNestInApplicationMapperRule from '../../eslint/rules/mapper/no-nest-in-application-mapper.mjs';

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
    it('presentation error mapper가 PresentationHttpErrorMapper를 상속하면 통과한다', () => {
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

    it('presentation error mapper가 PresentationHttpErrorMapper를 상속하지 않으면 위반으로 보고한다', () => {
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

    it('infrastructure mapper가 PersistenceMapper를 구현하지 않으면 위반으로 보고한다', () => {
      const messages = lintMapperRule({
        filename:
          'src/modules/corrections/infrastructure/correction.persistence.mapper.ts',
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
          'Mapper class CorrectionPersistenceMapper must implement PersistenceMapper.',
      });
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
});
