import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { type ApplicationErrorBase } from '../../../application/error.base';
import { PresentationHttpErrorMapper } from '../error-mapper.base';
import { PresentationHttpException } from '../http.exception';

class TestPresentationHttpErrorMapper extends PresentationHttpErrorMapper<ApplicationErrorBase> {}

describe('PresentationHttpErrorMapper', () => {
  const mapper = new TestPresentationHttpErrorMapper();

  describe('toException', () => {
    it('application 오류를 presentation HTTP exception으로 변환한다', () => {
      const error = {
        kind: 'not_found',
        code: 'sample.not_found',
        message: 'Internal sample lookup failed',
        details: {},
      } satisfies ApplicationErrorBase;

      const exception = mapper.toException(error);

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(exception.code).toBe('not_found');
      expect(exception.message).toBe('Resource not found');
      expect(exception.error).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'not_found',
        message: 'Resource not found',
      });
    });

    it('application 오류 종류를 presentation HTTP exception으로 변환한다', () => {
      const cases = [
        [
          'validation_failed',
          HttpStatus.BAD_REQUEST,
          'Request validation failed',
        ],
        [
          'authentication_required',
          HttpStatus.UNAUTHORIZED,
          'Authentication required',
        ],
        ['permission_denied', HttpStatus.FORBIDDEN, 'Permission denied'],
        [
          'operation_not_allowed',
          HttpStatus.FORBIDDEN,
          'Operation not allowed',
        ],
        ['not_found', HttpStatus.NOT_FOUND, 'Resource not found'],
        [
          'state_conflict',
          HttpStatus.CONFLICT,
          'Request conflicts with current state',
        ],
        [
          'dependency_unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
          'Service temporarily unavailable',
        ],
        [
          'unexpected',
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Internal server error',
        ],
      ] satisfies Array<[ApplicationErrorBase['kind'], HttpStatus, string]>;

      cases.forEach(([kind, statusCode, message]) => {
        const exception = mapper.toException({
          kind,
          code: `sample.${kind}`,
          message: 'Internal sample failure',
          details: {},
        });

        expect(exception).toBeInstanceOf(PresentationHttpException);
        expect(exception.getStatus()).toBe(statusCode);
        expect(exception.error).toEqual({
          statusCode,
          code: kind,
          message,
        });
      });
    });

    it('rate limit 오류는 429 HTTP exception으로 변환한다', () => {
      const exception = mapper.toException({
        kind: 'rate_limited',
        code: 'sample.rate_limited',
        message: 'Sample rate limit exceeded',
        details: {},
      });

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(exception.error).toEqual({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        code: 'rate_limited',
        message: 'Rate limit exceeded',
      });
    });

    it('application 오류 message를 HTTP exception body에 노출하지 않는다', () => {
      const exception = mapper.toException({
        kind: 'dependency_unavailable',
        code: 'sample.provider_unavailable',
        message: 'Provider api key api-key-1 failed with database timeout',
        details: {
          providerRequestId: 'provider-request-1',
        },
      });

      expect(exception.error).toEqual({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'dependency_unavailable',
        message: 'Service temporarily unavailable',
      });
    });

    it('validation_failed 오류도 기본적으로 details를 노출하지 않는다', () => {
      const exception = mapper.toException({
        kind: 'validation_failed',
        code: 'sample.command_invalid',
        message: 'Internal sample validation failed',
        details: {
          fields: [
            {
              path: 'sample',
              messages: ['Sample cannot be empty'],
            },
          ],
        },
      });

      expect(exception).toBeInstanceOf(PresentationHttpException);
      expect(exception.error).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
      });
    });

    it('validation_failed details shape가 안전해 보여도 base mapper는 노출하지 않는다', () => {
      const exception = mapper.toException({
        kind: 'validation_failed',
        code: 'sample.command_invalid',
        message: 'Internal sample validation failed',
        details: {
          sql: 'select * from users',
        },
      });

      expect(exception.error).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
      });
    });
  });
});
