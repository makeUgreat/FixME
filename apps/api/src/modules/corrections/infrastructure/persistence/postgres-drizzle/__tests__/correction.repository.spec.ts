import { describe, expect, it, vi } from 'vitest';
import { type DrizzleDatabase } from '@libs/database';
import { PERSISTENCE_ERROR_KIND } from '@libs/layer';
import { Correction, CorrectionFeedback, Mistake } from '../../../../domain';
import { CorrectionPersistenceMapper } from '../correction-persistence.mapper';
import { PostgresDrizzleCorrectionRepository } from '../correction.repository';
import { type CorrectionRow } from '../correction.table';

const now = new Date('2026-06-03T00:00:00.000Z');

const createCorrection = (): Correction =>
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

const createDatabase = (params: {
  insertResult?: Promise<unknown>;
  selectResult?: Promise<CorrectionRow[]>;
}): DrizzleDatabase => {
  const onConflictDoUpdate = vi.fn(
    () => params.insertResult ?? Promise.resolve(undefined),
  );
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));
  const limit = vi.fn(() => params.selectResult ?? Promise.resolve([]));
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));

  return { insert, select } as unknown as DrizzleDatabase;
};

describe('PostgresDrizzleCorrectionRepository', () => {
  describe('save', () => {
    it('저장에 성공하면 교정 aggregate를 성공 Result로 반환한다', async () => {
      const correction = createCorrection();
      const repository = new PostgresDrizzleCorrectionRepository(
        createDatabase({}),
        new CorrectionPersistenceMapper(),
      );

      const result = await repository.save(correction);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(correction);
      }
    });

    it('저장소 쓰기에 실패하면 저장 불가 오류를 반환한다', async () => {
      const repository = new PostgresDrizzleCorrectionRepository(
        createDatabase({
          insertResult: Promise.reject(new Error('connection failed')),
        }),
        new CorrectionPersistenceMapper(),
      );

      const result = await repository.save(createCorrection());

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toEqual({
          kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
          code: 'correction_repository.save_unavailable',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction could not be saved',
          details: {},
        });
      }
    });
  });

  describe('findById', () => {
    it('저장소 조회에 실패하면 조회 불가 오류를 반환한다', async () => {
      const repository = new PostgresDrizzleCorrectionRepository(
        createDatabase({
          selectResult: Promise.reject(new Error('connection failed')),
        }),
        new CorrectionPersistenceMapper(),
      );

      const result = await repository.findById('correction-1');

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toEqual({
          kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
          code: 'correction_repository.find_unavailable',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction could not be found',
          details: {},
        });
      }
    });

    it('조회된 row가 없으면 null 성공 Result를 반환한다', async () => {
      const repository = new PostgresDrizzleCorrectionRepository(
        createDatabase({ selectResult: Promise.resolve([]) }),
        new CorrectionPersistenceMapper(),
      );

      const result = await repository.findById('unknown-correction');

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it('조회된 row를 복원할 수 없으면 복원 실패 오류를 반환한다', async () => {
      const repository = new PostgresDrizzleCorrectionRepository(
        createDatabase({
          selectResult: Promise.resolve([
            createRow({
              feedback: { inferredIntent: 'missing explanation' },
            } as Partial<CorrectionRow>),
          ]),
        }),
        new CorrectionPersistenceMapper(),
      );

      const result = await repository.findById('correction-1');

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toEqual({
          kind: PERSISTENCE_ERROR_KIND.RESTORE_FAILED,
          code: 'correction_repository.restore_failed',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Correction could not be restored',
          details: {},
        });
      }
    });
  });
});
