import { Linter, type Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import repositoryMethodPrefixRule from '../../eslint/rules/naming/repository-method-prefix.mjs';
import typeNameMatchesFileNameRule from '../../eslint/rules/naming/type-name-matches-file-name.mjs';

const repositoryMethodPrefixRuleModule =
  repositoryMethodPrefixRule as Rule.RuleModule;

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
              'repository-method-prefix': repositoryMethodPrefixRuleModule,
              'type-name-matches-file-name': typeNameMatchesFileNameRule,
            },
          },
        },
        rules: {
          'naming/repository-method-prefix': 'error',
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

    it('shared mapper base 파일은 정책상 허용된 base class 이름을 선언할 수 있다', () => {
      const messages = lintNamingRule({
        filename: 'src/libs/layer/application/error-mapper.base.ts',
        code: `
          export abstract class DomainErrorToApplicationErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('base 파일은 Base suffix 타입 이름을 허용한다', () => {
      const messages = lintNamingRule({
        filename: 'src/libs/layer/application/error.base.ts',
        code: `
          export interface ApplicationErrorBase {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('shared infrastructure error base 파일은 InfrastructureErrorBase를 허용한다', () => {
      const messages = lintNamingRule({
        filename: 'src/libs/layer/infrastructure/error.base.ts',
        code: `
          export interface InfrastructureErrorBase {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('shared persistence error base 파일은 PersistenceErrorBase를 허용한다', () => {
      const messages = lintNamingRule({
        filename: 'src/libs/layer/infrastructure/persistence/error.base.ts',
        code: `
          export interface PersistenceErrorBase {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('presentation protocol directory는 protocol prefix type 이름을 허용한다', () => {
      const messages = lintNamingRule({
        filename: 'src/libs/layer/presentation/http/validation-error.mapper.ts',
        code: `
          export class HttpValidationErrorMapper {}
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('infrastructure persistence shared base는 adapter-kind prefix type 이름을 허용한다', () => {
      const messages = lintNamingRule({
        filename:
          'src/libs/layer/infrastructure/persistence/aggregate-mapper.base.ts',
        code: `
          export abstract class PersistenceAggregateMapper {}
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

    it('storage adapter repository 파일은 directory technology prefix를 허용한다', () => {
      const messages = lintNamingRule({
        filename:
          'src/modules/corrections/infrastructure/persistence/postgres-drizzle/correction.repository.ts',
        code: `
          export class PostgresDrizzleCorrectionRepository {}
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });

  describe('repository-method-prefix', () => {
    it('repository interface가 허용된 prefix만 사용하면 통과한다', () => {
      const messages = lintNamingRule({
        filename: 'src/modules/corrections/domain/correction.repository.ts',
        code: `
          export interface CorrectionRepository {
            save(correction: Correction): Promise<Correction>;
            findById(correctionId: string): Promise<Correction | null>;
            getById(correctionId: string): Promise<Correction>;
            listByUserId(userId: string): Promise<Correction[]>;
            countByUserId(userId: string): Promise<number>;
            existsById(correctionId: string): Promise<boolean>;
            deleteById(correctionId: string): Promise<void>;
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('repository 구현체가 허용된 prefix만 사용하면 통과한다', () => {
      const messages = lintNamingRule({
        filename:
          'src/modules/corrections/infrastructure/persistence/postgres-drizzle/correction.repository.ts',
        code: `
          export class PostgresDrizzleCorrectionRepository {
            save(correction: Correction): Promise<Correction> {
              return Promise.resolve(correction);
            }

            findById(correctionId: string): Promise<Correction | null> {
              return Promise.resolve(null);
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('By qualifier가 없는 repository method는 위반으로 보고한다', () => {
      const messages = lintNamingRule({
        filename: 'src/modules/corrections/domain/correction.repository.ts',
        code: `
          export interface CorrectionRepository {
            find(): Promise<Correction | null>;
            get(): Promise<Correction>;
            list(): Promise<Correction[]>;
            count(): Promise<number>;
            exists(): Promise<boolean>;
            delete(): Promise<void>;
          }
        `,
      });

      expect(messages).toHaveLength(6);
      expect(messages.map((message) => message.ruleId)).toEqual(
        Array(6).fill('naming/repository-method-prefix'),
      );
    });

    it('모호한 repository boundary method는 위반으로 보고한다', () => {
      const messages = lintNamingRule({
        filename: 'src/modules/corrections/domain/correction.repository.ts',
        code: `
          export interface CorrectionRepository {
            create(correction: Correction): Promise<Correction>;
            insert(correction: Correction): Promise<Correction>;
            update(correction: Correction): Promise<Correction>;
            upsert(correction: Correction): Promise<Correction>;
            fetch(correctionId: string): Promise<Correction | null>;
            load(correctionId: string): Promise<Correction | null>;
            query(correctionId: string): Promise<Correction | null>;
            read(correctionId: string): Promise<Correction | null>;
          }
        `,
      });

      expect(messages).toHaveLength(8);
      expect(messages[0]).toMatchObject({
        ruleId: 'naming/repository-method-prefix',
        message:
          'Repository methods must be named save or use a supported By-qualified prefix: findByX, getByX, listByX, countByX, existsByX, deleteByX.',
      });
    });

    it('repository 구현체의 private helper method는 검사하지 않는다', () => {
      const messages = lintNamingRule({
        filename:
          'src/modules/corrections/infrastructure/persistence/memory/correction.repository.ts',
        code: `
          export class MemoryCorrectionRepository {
            save(correction: Correction): Promise<Correction> {
              return Promise.resolve(correction);
            }

            private toKey(correctionId: string): string {
              return correctionId;
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });

    it('repository 파일이 아니면 검사하지 않는다', () => {
      const messages = lintNamingRule({
        filename: 'src/modules/corrections/infrastructure/publisher.ts',
        code: `
          export class CorrectionPublisher {
            publish(event: CorrectionCreated): Promise<void> {
              return Promise.resolve();
            }
          }
        `,
      });

      expect(messages).toHaveLength(0);
    });
  });
});
