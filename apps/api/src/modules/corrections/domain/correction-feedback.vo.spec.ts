import { describe, expect, it } from 'vitest';
import {
  CorrectionFeedback,
  type CreateCorrectionFeedbackProps,
} from './correction-feedback.vo';

const createFeedbackProps = (): CreateCorrectionFeedbackProps => ({
  inferredIntent: 'The user wants to ask whether this solves concurrency.',
  explanation:
    'The corrected sentence uses a clearer verb phrase and a natural noun.',
});

describe('CorrectionFeedback', () => {
  describe('of', () => {
    it('검증에 성공하면 성공 Result와 피드백 값 객체를 반환한다', () => {
      const result = CorrectionFeedback.of(createFeedbackProps());

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.value).toEqual({
          inferredIntent:
            'The user wants to ask whether this solves concurrency.',
          explanation:
            'The corrected sentence uses a clearer verb phrase and a natural noun.',
        });
      }
    });

    it('의도 추측이 비어 있으면 실패 Result를 반환한다', () => {
      const result = CorrectionFeedback.of({
        ...createFeedbackProps(),
        inferredIntent: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe(
          'correction_feedback.inferred_intent_empty',
        );
      }
    });

    it('전체 설명이 비어 있으면 실패 Result를 반환한다', () => {
      const result = CorrectionFeedback.of({
        ...createFeedbackProps(),
        explanation: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('correction_feedback.explanation_empty');
      }
    });
  });
});
