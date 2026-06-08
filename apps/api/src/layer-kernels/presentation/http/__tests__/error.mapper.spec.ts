import { describe, expect, it } from 'vitest';
import { PresentationHttpErrorMapper } from '../error.mapper';

describe('PresentationHttpErrorMapper', () => {
  const mapper = new PresentationHttpErrorMapper();

  describe('toPresentation', () => {
    it('application-style 오류를 public HTTP error로 변환한다', () => {
      const cases = [
        [
          'validation_failed',
          400,
          'validation_failed',
          'Request validation failed',
        ],
        [
          'authentication_required',
          401,
          'authentication_required',
          'Authentication required',
        ],
        ['permission_denied', 403, 'permission_denied', 'Permission denied'],
        [
          'operation_not_allowed',
          403,
          'operation_not_allowed',
          'Operation not allowed',
        ],
        ['not_found', 404, 'not_found', 'Resource not found'],
        [
          'state_conflict',
          409,
          'state_conflict',
          'Request conflicts with current state',
        ],
        ['rate_limited', 429, 'rate_limited', 'Rate limit exceeded'],
        [
          'dependency_unavailable',
          503,
          'dependency_unavailable',
          'Service temporarily unavailable',
        ],
        ['unexpected', 500, 'unexpected', 'Internal server error'],
      ] as const;

      cases.forEach(([kind, statusCode, code, message]) => {
        expect(
          mapper.toPresentation({
            kind,
            code: `sample.${kind}`,
            message: 'Internal sample failure',
            details: {},
          }),
        ).toEqual({
          statusCode,
          code,
          message,
        });
      });
    });

    it('domain-style 오류를 public HTTP error로 변환한다', () => {
      expect(
        mapper.toPresentation({
          kind: 'invariant_violation',
          code: 'sample.rule_broken',
          message: 'Internal domain rule failed',
          details: {
            fields: ['sample.secret'],
          },
        }),
      ).toEqual({
        statusCode: 400,
        code: 'validation_failed',
        message: 'Request validation failed',
      });
    });

    it('infrastructure-style 오류를 masked public HTTP error로 변환한다', () => {
      const cases = [
        ['unavailable', 503, 'dependency_unavailable'],
        ['timeout', 503, 'dependency_unavailable'],
        ['bad_response', 503, 'dependency_unavailable'],
        ['conflict', 409, 'state_conflict'],
        ['invalid_data', 500, 'unexpected'],
        ['restore_failed', 500, 'unexpected'],
      ] as const;

      cases.forEach(([kind, statusCode, code]) => {
        expect(
          mapper.toPresentation({
            kind,
            code: `postgres.${kind}`,
            source: {
              boundary: 'persistence',
              adapter: 'postgres_drizzle',
            },
            message: 'Internal adapter failure',
            details: {
              sql: 'select * from corrections',
            },
          }),
        ).toEqual({
          statusCode,
          code,
          message:
            statusCode === 503
              ? 'Service temporarily unavailable'
              : statusCode === 409
                ? 'Request conflicts with current state'
                : 'Internal server error',
        });
      });
    });

    it('알 수 없는 오류 종류는 unexpected로 masking한다', () => {
      expect(
        mapper.toPresentation({
          kind: 'vendor_token_expired',
          code: 'vendor.token_expired',
          message: 'Provider token provider-token-1 expired',
          details: {
            providerToken: 'provider-token-1',
          },
        }),
      ).toEqual({
        statusCode: 500,
        code: 'unexpected',
        message: 'Internal server error',
      });
    });
  });
});
