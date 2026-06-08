import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PresentationHttpException } from '../../http.exception';
import { CreateCorrectionHttpErrorMapper } from '../error.mapper';

describe('CreateCorrectionHttpErrorMapper', () => {
  const mapper = new CreateCorrectionHttpErrorMapper();

  describe('toException', () => {
    it('repository 저장 오류를 correction HTTP exception으로 변환한다', () => {
      const repositoryError = {
        kind: 'dependency_unavailable',
        code: 'correction_repository.save_unavailable',
        message: 'Correction could not be saved',
        details: {},
      } as const;

      const exception = mapper.toException(repositoryError);

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(exception.body).toEqual({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'dependency_unavailable',
        message: 'Service temporarily unavailable',
      });
    });
  });

  describe('validation_failed', () => {
    it('domain 검증 실패를 Bad Request exception으로 변환한다', () => {
      const exception = mapper.toException({
        kind: 'invariant_violation',
        code: 'correction_feedback.inferred_intent_empty',
        message: 'Correction feedback inferred intent cannot be empty',
        details: {
          fields: ['inferredIntent'],
        },
      });

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.body).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'feedback.inferredIntent',
              messages: ['Feedback inferred intent is required'],
            },
          ],
        },
      });
    });

    it('검증 실패 details는 허용된 public field만 노출한다', () => {
      const exception = mapper.toException({
        kind: 'invariant_violation',
        code: 'correction_metadata.provider_metadata_invalid',
        message: 'Correction metadata provider metadata must be a plain object',
        details: {
          fields: ['providerMetadata', 'providerMetadata.apiKey'],
        },
      });

      expect(exception.body).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'metadata.providerMetadata',
              messages: ['Provider metadata is invalid'],
            },
          ],
        },
      });
    });
  });
});
