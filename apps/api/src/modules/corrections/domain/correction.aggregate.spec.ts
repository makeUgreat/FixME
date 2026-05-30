import { describe, expect, it } from 'vitest';
import { Correction, type CreateCorrectionProps } from './correction.aggregate';
import {
  CorrectionAnalysis,
  type CreateCorrectionAnalysisProps,
} from './correction-analysis.vo';
import { Mistake } from './mistake.vo';

const createAnalysisProps = (): CreateCorrectionAnalysisProps => ({
  inferredIntent: 'The user wants to ask whether this solves concurrency.',
  overallExplanation:
    'The corrected sentence uses a clearer verb phrase and a natural noun.',
});

const createMistake = (): Mistake =>
  Mistake.of({
    originalFragment: 'for concurrency',
    correctedFragment: 'for handling concurrency',
    types: ['naturalness'],
    explanation: 'The corrected phrase sounds more natural and specific.',
  })._unsafeUnwrap();

const createCorrection = (
  overrides: Partial<CreateCorrectionProps> = {},
): ReturnType<typeof Correction.create> =>
  Correction.create({
    id: 'correction-1',
    originalText: 'Is this for concurrency?',
    correctedText: 'Is this for handling concurrency?',
    analysis: CorrectionAnalysis.of(createAnalysisProps())._unsafeUnwrap(),
    mistakes: [createMistake()],
    ...overrides,
  });

describe('Correction', () => {
  describe('create', () => {
    it('검증에 성공하면 성공 Result와 교정 모델을 반환한다', () => {
      const result = createCorrection();

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const props = result.value.getProps();

        expect(result.value.id).toBe('correction-1');
        expect(props.originalText).toBe('Is this for concurrency?');
        expect(props.correctedText).toBe('Is this for handling concurrency?');
        expect(props.analysis.value.inferredIntent).toBe(
          'The user wants to ask whether this solves concurrency.',
        );
        expect(props.mistakes).toHaveLength(1);
      }
    });

    it('원문과 교정문 앞뒤 공백을 제거해 저장한다', () => {
      const result = createCorrection({
        originalText: '  Is this for concurrency?  ',
        correctedText: '  Is this for handling concurrency?  ',
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.getProps().originalText).toBe(
          'Is this for concurrency?',
        );
        expect(result.value.getProps().correctedText).toBe(
          'Is this for handling concurrency?',
        );
      }
    });

    it('원문이 비어 있으면 실패 Result를 반환한다', () => {
      const result = createCorrection({
        originalText: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('correction.original_text_empty');
      }
    });

    it('교정문이 비어 있으면 실패 Result를 반환한다', () => {
      const result = createCorrection({
        correctedText: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('correction.corrected_text_empty');
      }
    });

    it('교정이 발생했는데 오류 목록이 비어 있으면 실패 Result를 반환한다', () => {
      const result = createCorrection({
        mistakes: [],
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction.mistakes_empty_for_corrected_text',
        );
      }
    });

    it('원문과 교정문이 같으면 오류 목록이 비어 있어도 성공 Result를 반환한다', () => {
      const result = createCorrection({
        originalText: 'Is this for handling concurrency?',
        correctedText: 'Is this for handling concurrency?',
        mistakes: [],
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.getProps().mistakes).toEqual([]);
      }
    });
  });

  describe('restore', () => {
    it('분석 값이 교정 분석 모델이 아니면 실패 Result를 반환한다', () => {
      const result = Correction.restore({
        id: 'correction-1',
        props: {
          originalText: 'Is this for concurrency?',
          correctedText: 'Is this for handling concurrency?',
          analysis: {} as CorrectionAnalysis,
          mistakes: [createMistake()],
        },
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('correction.analysis_invalid');
      }
    });

    it('오류 목록에 오류 값 객체가 아닌 값이 있으면 실패 Result를 반환한다', () => {
      const result = Correction.restore({
        id: 'correction-1',
        props: {
          originalText: 'Is this for concurrency?',
          correctedText: 'Is this for handling concurrency?',
          analysis: CorrectionAnalysis.of(
            createAnalysisProps(),
          )._unsafeUnwrap(),
          mistakes: [{} as Mistake],
        },
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('correction.mistakes_invalid');
      }
    });
  });
});
