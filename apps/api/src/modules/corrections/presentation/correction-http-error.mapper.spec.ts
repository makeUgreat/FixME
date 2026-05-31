import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CorrectionHttpErrorMapper } from './correction-http-error.mapper';

describe('CorrectionHttpErrorMapper', () => {
  const mapper = new CorrectionHttpErrorMapper();

  describe('toResponse', () => {
    it('application 오류를 HTTP 오류 응답으로 변환한다', () => {
      const response = mapper.toResponse({
        kind: 'validation_failed',
        code: 'create_correction.validation_failed',
        message: 'Mistake types are invalid',
        details: {
          domainCode: 'mistake.types_invalid',
          domainDetails: { types: ['unknown'] },
        },
      });

      expect(response).toEqual({
        code: 'create_correction.validation_failed',
        message: 'Mistake types are invalid',
        details: {
          domainCode: 'mistake.types_invalid',
          domainDetails: { types: ['unknown'] },
        },
      });
    });
  });

  describe('toStatus', () => {
    it('검증 실패는 Bad Request 상태로 변환한다', () => {
      const status = mapper.toStatus({
        kind: 'validation_failed',
        code: 'create_correction.validation_failed',
        message: 'Correction feedback inferred intent cannot be empty',
        details: {
          domainCode: 'correction_feedback.inferred_intent_empty',
          domainDetails: {},
        },
      });

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('의존성 실패는 Service Unavailable 상태로 변환한다', () => {
      const status = mapper.toStatus({
        kind: 'dependency_unavailable',
        code: 'create_correction.persistence_unavailable',
        message: 'Correction could not be saved',
        details: {},
      });

      expect(status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });
});
