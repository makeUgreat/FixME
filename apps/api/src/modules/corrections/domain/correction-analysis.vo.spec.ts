import { describe, expect, it } from 'vitest';
import {
  CorrectionAnalysis,
  type CreateCorrectionAnalysisProps,
} from './correction-analysis.vo';

const createAnalysisProps = (): CreateCorrectionAnalysisProps => ({
  inferredIntent: 'The user wants to ask whether this solves concurrency.',
  overallExplanation:
    'The corrected sentence uses a clearer verb phrase and a natural noun.',
});

describe('CorrectionAnalysis', () => {
  describe('of', () => {
    it('검증에 성공하면 성공 Result와 분석 값 객체를 반환한다', () => {
      const result = CorrectionAnalysis.of(createAnalysisProps());

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.value).toEqual({
          inferredIntent:
            'The user wants to ask whether this solves concurrency.',
          overallExplanation:
            'The corrected sentence uses a clearer verb phrase and a natural noun.',
        });
      }
    });

    it('의도 추측이 비어 있으면 실패 Result를 반환한다', () => {
      const result = CorrectionAnalysis.of({
        ...createAnalysisProps(),
        inferredIntent: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_analysis.inferred_intent_empty',
        );
      }
    });

    it('전체 설명이 비어 있으면 실패 Result를 반환한다', () => {
      const result = CorrectionAnalysis.of({
        ...createAnalysisProps(),
        overallExplanation: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_analysis.overall_explanation_empty',
        );
      }
    });
  });
});
