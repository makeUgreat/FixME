import { describe, expect, it, vi } from 'vitest';
import { type Correction, type CorrectionRepository } from '../../../domain';
import {
  type CorrectionMistakeInput,
  CreateCorrectionCommand,
  type CreateCorrectionCommandProps,
} from '../create-correction.command';
import { CreateCorrectionDomainErrorToApplicationErrorMapper } from '../create-correction-error.mapper';
import { CreateCorrectionCommandHandler } from '../create-correction.command-handler';

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

const createHandler = (
  saveCorrection = vi.fn((correction: Correction) =>
    Promise.resolve(correction),
  ),
) => {
  const findCorrectionById = vi.fn(() => Promise.resolve(null));
  const correctionRepository: CorrectionRepository = {
    save: saveCorrection,
    findById: findCorrectionById,
  };

  return {
    correctionRepository,
    saveCorrection,
    handler: new CreateCorrectionCommandHandler(
      correctionRepository,
      new CreateCorrectionDomainErrorToApplicationErrorMapper(),
    ),
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
        expect(result.error.kind).toBe('validation_failed');
        if (result.error.kind === 'validation_failed') {
          expect(result.error.code).toBe('create_correction.command_invalid');
          expect(result.error.details).toEqual({
            fields: [
              {
                path: 'feedback.inferredIntent',
                messages: [
                  'Correction feedback inferred intent cannot be empty',
                ],
              },
            ],
          });
        }
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
        expect(result.error.kind).toBe('validation_failed');
        if (result.error.kind === 'validation_failed') {
          expect(result.error.code).toBe('create_correction.command_invalid');
          expect(result.error.details).toEqual({
            fields: [
              {
                path: 'feedback.explanation',
                messages: ['Correction feedback explanation cannot be empty'],
              },
            ],
          });
        }
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
        expect(result.error.kind).toBe('validation_failed');
        if (result.error.kind === 'validation_failed') {
          expect(result.error.code).toBe('create_correction.command_invalid');
          expect(result.error.details).toEqual({
            fields: [
              {
                path: 'mistakes.types',
                messages: ['Mistake types are invalid'],
              },
            ],
          });
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
        expect(result.error.kind).toBe('validation_failed');
        if (result.error.kind === 'validation_failed') {
          expect(result.error.code).toBe('create_correction.command_invalid');
          expect(result.error.details).toEqual({
            fields: [
              {
                path: 'correctedText',
                messages: [
                  'Correction mistakes cannot be empty when text is corrected',
                ],
              },
              {
                path: 'mistakes',
                messages: [
                  'Correction mistakes cannot be empty when text is corrected',
                ],
              },
            ],
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
        expect(result.error.kind).toBe('validation_failed');
        if (result.error.kind === 'validation_failed') {
          expect(result.error.code).toBe('create_correction.command_invalid');
          expect(result.error.details).toEqual({
            fields: [
              {
                path: 'metadata.model',
                messages: ['Correction metadata model cannot be empty'],
              },
            ],
          });
        }
      }

      expect(saveCorrection).not.toHaveBeenCalled();
    });

    it('저장소 저장에 실패하면 의존성 실패 Result를 반환한다', async () => {
      const saveCorrection = vi.fn(() =>
        Promise.reject(new Error('connection failed')),
      );
      const { handler } = createHandler(saveCorrection);

      const result = await handler.execute(createCommand());

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('dependency_unavailable');
        expect(result.error.code).toBe(
          'create_correction.persistence_unavailable',
        );
        expect(result.error.details).toEqual({});
      }

      expect(saveCorrection).toHaveBeenCalledTimes(1);
    });
  });
});
