import { describe, expect, it } from 'vitest';
import { INFRASTRUCTURE_ERROR_KIND } from '@layer-kernels/infrastructure';
import {
  Correction,
  CorrectionFeedback,
  type CreateCorrectionProps,
  Mistake,
} from '../../../../../domain';
import { CorrectionPersistenceMapper } from '../correction-persistence.mapper';
import { type CorrectionRow } from '../correction.table';

const now = new Date('2026-06-03T00:00:00.000Z');

const createCorrection = (
  overrides: Partial<CreateCorrectionProps> = {},
): Correction =>
  Correction.create({
    id: 'correction-1',
    originalText: 'Is this for concurrency?',
    correctedText: 'Is this meant for handling concurrency?',
    feedback: CorrectionFeedback.of({
      inferredIntent: 'The user asks whether this is meant for concurrency.',
      explanation: 'The corrected sentence uses a more natural phrase.',
    })._unsafeUnwrap(),
    mistakes: [
      Mistake.of({
        types: ['naturalness'],
        explanation: 'The original phrase is understandable but vague.',
      })._unsafeUnwrap(),
    ],
    metadata: {
      id: 'correction-1-metadata',
      model: 'gpt-5-mini',
      providerMetadata: { providerRequestId: 'request-1' },
    },
    ...overrides,
  })._unsafeUnwrap();

const createRow = (overrides: Partial<CorrectionRow> = {}): CorrectionRow => ({
  id: 'correction-1',
  originalText: 'Is this for concurrency?',
  correctedText: 'Is this meant for handling concurrency?',
  feedback: {
    inferredIntent: 'The user asks whether this is meant for concurrency.',
    explanation: 'The corrected sentence uses a more natural phrase.',
  },
  mistakes: [
    {
      types: ['naturalness'],
      explanation: 'The original phrase is understandable but vague.',
    },
  ],
  metadataId: 'correction-1-metadata',
  model: 'gpt-5-mini',
  providerMetadata: { providerRequestId: 'request-1' },
  createdAt: now,
  updatedAt: now,
  metadataCreatedAt: now,
  metadataUpdatedAt: now,
  ...overrides,
});

describe('CorrectionPersistenceMapper', () => {
  describe('toPersistence', () => {
    it('교정 aggregate를 Drizzle row 입력 형태로 변환한다', () => {
      const mapper = new CorrectionPersistenceMapper();
      const correction = createCorrection();

      const row = mapper.toPersistence(correction);

      expect(row).toEqual(
        expect.objectContaining({
          id: 'correction-1',
          originalText: 'Is this for concurrency?',
          correctedText: 'Is this meant for handling concurrency?',
          feedback: {
            inferredIntent:
              'The user asks whether this is meant for concurrency.',
            explanation: 'The corrected sentence uses a more natural phrase.',
          },
          mistakes: [
            {
              types: ['naturalness'],
              explanation: 'The original phrase is understandable but vague.',
            },
          ],
          metadataId: 'correction-1-metadata',
          model: 'gpt-5-mini',
          providerMetadata: { providerRequestId: 'request-1' },
        }),
      );
    });
  });

  describe('toAggregate', () => {
    it('유효한 row를 교정 aggregate로 복원한다', () => {
      const mapper = new CorrectionPersistenceMapper();

      const result = mapper.toAggregate(createRow());

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const props = result.value.getProps();

        expect(result.value.id).toBe('correction-1');
        expect(props.feedback.value.inferredIntent).toBe(
          'The user asks whether this is meant for concurrency.',
        );
        expect(props.mistakes).toHaveLength(1);
        expect(props.metadata.getProps().providerMetadata).toEqual({
          providerRequestId: 'request-1',
        });
      }
    });

    it('JSON 컬럼 형태가 유효하지 않으면 domain 복원 전에 실패한다', () => {
      const mapper = new CorrectionPersistenceMapper();
      const row = createRow({
        feedback: { inferredIntent: 'missing explanation' },
      } as Partial<CorrectionRow>);

      const result = mapper.toAggregate(row);

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toEqual({
          kind: INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
          code: 'correction_persistence.feedback_json_invalid',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction persistence JSON shape is invalid',
          details: { fields: ['feedback'] },
        });
      }
    });

    it('row 형태는 유효하지만 domain invariant가 깨지면 domain 오류를 반환한다', () => {
      const mapper = new CorrectionPersistenceMapper();
      const row = createRow({
        correctedText: 'Is this meant for handling concurrency?',
        mistakes: [],
      });

      const result = mapper.toAggregate(row);

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction.mistakes_empty_for_corrected_text',
        );
      }
    });
  });
});
