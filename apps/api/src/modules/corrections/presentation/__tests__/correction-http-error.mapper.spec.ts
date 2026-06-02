import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PresentationHttpException } from '@libs/layer';
import { CorrectionHttpErrorMapper } from '../correction-http-error.mapper';

describe('CorrectionHttpErrorMapper', () => {
  const mapper = new CorrectionHttpErrorMapper();

  describe('toException', () => {
    it('application 오류를 correction HTTP exception으로 변환한다', () => {
      const error = {
        kind: 'dependency_unavailable',
        code: 'create_correction.persistence_unavailable',
        message: 'Correction could not be saved',
        details: {},
      } as const;

      const exception = mapper.toException(error);

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(exception.error).toEqual({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'dependency_unavailable',
        message: 'Service temporarily unavailable',
      });
    });
  });

  describe('validation_failed', () => {
    it('검증 실패를 Bad Request exception으로 변환한다', () => {
      const exception = mapper.toException({
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

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.error).toEqual({
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
        kind: 'validation_failed',
        code: 'create_correction.command_invalid',
        message: 'Correction request is invalid',
        details: {
          fields: [
            {
              path: 'metadata.providerMetadata',
              messages: ['Internal provider metadata validation failed'],
            },
            {
              path: 'metadata.providerMetadata.apiKey',
              messages: ['Invalid API key sk-secret'],
            },
          ],
        },
      });

      expect(exception.error).toEqual({
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
