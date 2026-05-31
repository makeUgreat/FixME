import { describe, expect, it } from 'vitest';
import { type MistakeType } from '../../domain';
import { CreateCorrectionErrorMapper } from './create-correction-error.mapper';

describe('CreateCorrectionErrorMapper', () => {
  const mapper = new CreateCorrectionErrorMapper();

  describe('toApplicationError', () => {
    it('도메인 오류를 application 검증 실패 오류로 변환한다', () => {
      const error = mapper.toApplicationError({
        kind: 'invariant_violation',
        code: 'correction_feedback.inferred_intent_empty',
        message: 'Correction feedback inferred intent cannot be empty',
        details: {},
      });

      expect(error).toEqual({
        kind: 'validation_failed',
        code: 'create_correction.validation_failed',
        message: 'Correction feedback inferred intent cannot be empty',
        details: {
          domainCode: 'correction_feedback.inferred_intent_empty',
          domainDetails: {},
        },
      });
    });

    it('도메인 오류 details가 있으면 application 오류에 보존한다', () => {
      const error = mapper.toApplicationError({
        kind: 'invariant_violation',
        code: 'mistake.types_invalid',
        message: 'Mistake types are invalid',
        details: { types: ['unknown' as MistakeType] },
      });

      expect(error).toEqual({
        kind: 'validation_failed',
        code: 'create_correction.validation_failed',
        message: 'Mistake types are invalid',
        details: {
          domainCode: 'mistake.types_invalid',
          domainDetails: { types: ['unknown'] },
        },
      });
    });
  });
});
