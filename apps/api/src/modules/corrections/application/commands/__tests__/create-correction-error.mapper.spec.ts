import { describe, expect, it } from 'vitest';
import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type DomainInvariantViolationDetails,
} from '@libs/ddd';
import {
  APPLICATION_ERROR_KIND,
  PERSISTENCE_ERROR_KIND,
  type DomainErrorToApplicationErrorHandlers,
  type ApplicationErrorOf,
} from '@libs/layer';
import { type CorrectionRepositoryError } from '../../../domain';
import {
  CreateCorrectionDomainErrorToApplicationErrorMapper,
  CreateCorrectionRepositoryErrorToApplicationErrorMapper,
} from '../create-correction-error.mapper';

type ExhaustiveTestDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'sample',
      'invalid',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.STATE_CONFLICT,
      'sample',
      'conflict'
    >;

type ExhaustiveTestApplicationError =
  | ApplicationErrorOf<
      typeof APPLICATION_ERROR_KIND.VALIDATION_FAILED,
      'sample',
      'command_invalid'
    >
  | ApplicationErrorOf<
      typeof APPLICATION_ERROR_KIND.STATE_CONFLICT,
      'sample',
      'state_conflict'
    >;

// @ts-expect-error DomainErrorToApplicationErrorHandlers must cover every domain error kind.
const missingKindHandlers: DomainErrorToApplicationErrorHandlers<
  ExhaustiveTestDomainError,
  ExhaustiveTestApplicationError
> = {
  invariant_violation: (error) => ({
    kind: 'validation_failed',
    code: 'sample.command_invalid',
    message: error.message,
    details: { fields: error.details.fields },
  }),
};

const completeKindHandlers: DomainErrorToApplicationErrorHandlers<
  ExhaustiveTestDomainError,
  ExhaustiveTestApplicationError
> = {
  invariant_violation: (error) => ({
    kind: 'validation_failed',
    code: 'sample.command_invalid',
    message: error.message,
    details: { fields: error.details.fields },
  }),
  state_conflict: (error) => ({
    kind: 'state_conflict',
    code: 'sample.state_conflict',
    message: error.message,
    details: error.details,
  }),
};

void missingKindHandlers;
void completeKindHandlers;

describe('CreateCorrectionDomainErrorToApplicationErrorMapper', () => {
  const mapper = new CreateCorrectionDomainErrorToApplicationErrorMapper();

  describe('toApplicationError', () => {
    it('도메인 오류를 application 검증 실패 오류로 변환한다', () => {
      const error = mapper.toApplicationError({
        kind: 'invariant_violation',
        code: 'correction_feedback.inferred_intent_empty',
        message: 'Correction feedback inferred intent cannot be empty',
        details: { fields: ['inferredIntent'] },
      });

      expect(error).toEqual({
        kind: 'validation_failed',
        code: 'create_correction.command_invalid',
        message: 'Correction request is invalid',
        details: {
          fields: [
            {
              path: 'feedback.inferredIntent',
              messages: ['Correction feedback inferred intent cannot be empty'],
            },
          ],
        },
      });
    });

    it('도메인 오류 fields를 application 오류 fields로 변환한다', () => {
      const error = mapper.toApplicationError({
        kind: 'invariant_violation',
        code: 'mistake.types_invalid',
        message: 'Mistake types are invalid',
        details: { fields: ['types'] },
      });

      expect(error).toEqual({
        kind: 'validation_failed',
        code: 'create_correction.command_invalid',
        message: 'Correction request is invalid',
        details: {
          fields: [
            {
              path: 'mistakes.types',
              messages: ['Mistake types are invalid'],
            },
          ],
        },
      });
    });
  });
});

describe('CreateCorrectionRepositoryErrorToApplicationErrorMapper', () => {
  const mapper = new CreateCorrectionRepositoryErrorToApplicationErrorMapper();

  describe('toApplicationError', () => {
    it('저장소 오류를 application 의존성 실패 오류로 변환한다', () => {
      const repositoryErrors: CorrectionRepositoryError[] = [
        {
          kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
          code: 'correction_repository.save_unavailable',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction could not be saved',
          details: {},
        },
        {
          kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
          code: 'correction_repository.find_unavailable',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction could not be found',
          details: {},
        },
        {
          kind: PERSISTENCE_ERROR_KIND.RESTORE_FAILED,
          code: 'correction_repository.restore_failed',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction could not be restored',
          details: {},
        },
      ];

      for (const repositoryError of repositoryErrors) {
        expect(mapper.toApplication(repositoryError)).toEqual({
          kind: 'dependency_unavailable',
          code: 'create_correction.persistence_unavailable',
          message: 'Correction could not be saved',
          details: {},
        });
      }
    });
  });
});
