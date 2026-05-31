import { describe, expect, it, vi } from 'vitest';
import { type Correction, type CorrectionRepository } from '../../domain';
import {
  type CorrectionMistakeInput,
  CreateCorrectionCommand,
  type CreateCorrectionCommandProps,
} from './create-correction.command';
import { CreateCorrectionCommandHandler } from './create-correction.command-handler';

const createCommand = (
  overrides: Partial<CreateCorrectionCommandProps> = {},
): CreateCorrectionCommand =>
  new CreateCorrectionCommand({
    originalText: 'Is this for concurrency?',
    correctedText: 'Is this for handling concurrency?',
    feedback: {
      inferredIntent: 'The user asks whether this is meant for concurrency.',
      explanation:
        'The corrected sentence uses a more natural and specific phrase.',
    },
    mistakes: [
      {
        types: ['naturalness'],
        explanation: 'The original phrase is understandable but vague.',
      },
    ],
    metadata: {
      model: 'gpt-5-mini',
      providerMetadata: { providerRequestId: 'response-1' },
    },
    ...overrides,
  });

const createHandler = () => {
  const saveCorrection = vi.fn((correction: Correction) =>
    Promise.resolve(correction),
  );
  const findCorrectionById = vi.fn(() => Promise.resolve(null));
  const correctionRepository: CorrectionRepository = {
    save: saveCorrection,
    findById: findCorrectionById,
  };

  return {
    correctionRepository,
    saveCorrection,
    handler: new CreateCorrectionCommandHandler(correctionRepository),
  };
};

describe('CreateCorrectionCommandHandler', () => {
  describe('execute', () => {
    it('유효한 입력이면 교정 피드백을 저장하고 생성된 교정 ID를 반환한다', async () => {
      const { saveCorrection, handler } = createHandler();

      const result = await handler.execute(createCommand());

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.correctionId).toEqual(expect.any(String));
      }

      expect(saveCorrection).toHaveBeenCalledTimes(1);

      const savedCorrection = saveCorrection.mock.calls[0][0];

      expect(savedCorrection.getProps().originalText).toBe(
        'Is this for concurrency?',
      );
      expect(savedCorrection.getProps().correctedText).toBe(
        'Is this for handling concurrency?',
      );
      expect(savedCorrection.getProps().feedback.value.inferredIntent).toBe(
        'The user asks whether this is meant for concurrency.',
      );
      expect(savedCorrection.getProps().mistakes).toHaveLength(1);
      expect(savedCorrection.getProps().metadata.getProps()).toEqual(
        expect.objectContaining({
          correctionId: result._unsafeUnwrap().correctionId,
          model: 'gpt-5-mini',
          providerMetadata: { providerRequestId: 'response-1' },
        }),
      );
    });

    it('피드백의 해석한 의도가 비어 있으면 저장하지 않고 실패 Result를 반환한다', async () => {
      const { saveCorrection, handler } = createHandler();

      const result = await handler.execute(
        createCommand({
          feedback: {
            inferredIntent: ' ',
            explanation:
              'The corrected sentence uses a more natural and specific phrase.',
          },
        }),
      );

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe(
          'correction_feedback.inferred_intent_empty',
        );
      }

      expect(saveCorrection).not.toHaveBeenCalled();
    });

    it('피드백의 설명이 비어 있으면 저장하지 않고 실패 Result를 반환한다', async () => {
      const { saveCorrection, handler } = createHandler();

      const result = await handler.execute(
        createCommand({
          feedback: {
            inferredIntent:
              'The user asks whether this is meant for concurrency.',
            explanation: ' ',
          },
        }),
      );

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('correction_feedback.explanation_empty');
      }

      expect(saveCorrection).not.toHaveBeenCalled();
    });

    it('오류 유형이 유효하지 않으면 저장하지 않고 실패 Result를 반환한다', async () => {
      const { saveCorrection, handler } = createHandler();

      const result = await handler.execute(
        createCommand({
          mistakes: [
            {
              types: ['unknown' as CorrectionMistakeInput['types'][number]],
              explanation: 'The original phrase is understandable but vague.',
            },
          ],
        }),
      );

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('mistake.types_invalid');
        if (result.error.code === 'mistake.types_invalid') {
          expect(result.error.details).toEqual({ types: ['unknown'] });
        }
      }

      expect(saveCorrection).not.toHaveBeenCalled();
    });

    it('교정이 발생했는데 오류 목록이 비어 있으면 저장하지 않고 실패 Result를 반환한다', async () => {
      const { saveCorrection, handler } = createHandler();

      const result = await handler.execute(
        createCommand({
          mistakes: [],
        }),
      );

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe(
          'correction.mistakes_empty_for_corrected_text',
        );
        if (
          result.error.code === 'correction.mistakes_empty_for_corrected_text'
        ) {
          expect(result.error.details).toEqual({
            originalText: 'Is this for concurrency?',
            correctedText: 'Is this for handling concurrency?',
          });
        }
      }

      expect(saveCorrection).not.toHaveBeenCalled();
    });

    it('메타데이터 모델이 비어 있으면 저장하지 않고 실패 Result를 반환한다', async () => {
      const { saveCorrection, handler } = createHandler();

      const result = await handler.execute(
        createCommand({
          metadata: {
            model: ' ',
            providerMetadata: { providerRequestId: 'response-1' },
          },
        }),
      );

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('correction_metadata.model_empty');
      }

      expect(saveCorrection).not.toHaveBeenCalled();
    });
  });
});
