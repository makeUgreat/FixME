import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  Correction,
  CorrectionFeedback,
  Mistake,
} from '../../src/modules/corrections/domain';
import { CorrectionPersistenceMapper } from '../../src/modules/corrections/infrastructure/persistence/postgres-drizzle/correction-persistence.mapper';
import { PostgresDrizzleCorrectionRepository } from '../../src/modules/corrections/infrastructure/persistence/postgres-drizzle/correction.repository';

const itIfDatabaseUrl = process.env.DATABASE_URL ? it : it.skip;

const createCorrection = (params?: {
  id?: string;
  correctedText?: string;
}): Correction => {
  const id = params?.id ?? 'correction-1';
  const feedback = CorrectionFeedback.of({
    inferredIntent: 'The user asks whether this is meant for concurrency.',
    explanation: 'The corrected sentence uses a more natural phrase.',
  })._unsafeUnwrap();
  const mistake = Mistake.of({
    types: ['naturalness'],
    explanation: 'The original phrase is understandable but vague.',
  })._unsafeUnwrap();

  return Correction.create({
    id,
    originalText: 'Is this for concurrency?',
    correctedText: params?.correctedText ?? 'Is this for handling concurrency?',
    feedback,
    mistakes: [mistake],
    metadata: {
      id: `${id}-metadata`,
      model: 'gpt-5-mini',
      providerMetadata: { providerRequestId: `${id}-request` },
    },
  })._unsafeUnwrap();
};

describe('PostgresDrizzleCorrectionRepository (integration)', () => {
  let pool: Pool;
  let database: NodePgDatabase;
  let repository: PostgresDrizzleCorrectionRepository;

  beforeEach(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    database = drizzle({ client: pool });
    repository = new PostgresDrizzleCorrectionRepository(
      database,
      new CorrectionPersistenceMapper(),
    );

    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS corrections (
        id text PRIMARY KEY,
        original_text text NOT NULL,
        corrected_text text NOT NULL,
        feedback jsonb NOT NULL,
        mistakes jsonb NOT NULL,
        metadata_id text NOT NULL,
        model text NOT NULL,
        provider_metadata jsonb NOT NULL,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL,
        metadata_created_at timestamptz NOT NULL,
        metadata_updated_at timestamptz NOT NULL
      )
    `);
  });

  afterEach(async () => {
    await database.execute(sql`DELETE FROM corrections`);
    await pool.end();
  });

  itIfDatabaseUrl(
    '저장한 correction을 id로 조회하면 복원된 aggregate를 반환한다',
    async () => {
      const correction = createCorrection();

      const saveResult = await repository.save(correction);
      expect(saveResult.isOk()).toBe(true);

      const found = await repository.findById(correction.id);

      expect(found.isOk()).toBe(true);

      if (found.isOk()) {
        expect(found.value?.id).toBe(correction.id);
        expect(
          found.value?.getProps().metadata.getProps().providerMetadata,
        ).toEqual({
          providerRequestId: 'correction-1-request',
        });
      }
    },
  );

  itIfDatabaseUrl('없는 id로 조회하면 null을 반환한다', async () => {
    const result = await repository.findById('unknown-correction');

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toBeNull();
    }
  });

  itIfDatabaseUrl(
    '같은 id로 다시 저장하면 마지막 aggregate를 반환한다',
    async () => {
      const first = createCorrection({ id: 'correction-1' });
      const second = createCorrection({
        id: 'correction-1',
        correctedText: 'Is this meant for handling concurrency?',
      });

      const firstSaveResult = await repository.save(first);
      const secondSaveResult = await repository.save(second);

      expect(firstSaveResult.isOk()).toBe(true);
      expect(secondSaveResult.isOk()).toBe(true);

      const found = await repository.findById('correction-1');

      expect(found.isOk()).toBe(true);

      if (found.isOk()) {
        expect(found.value?.getProps().correctedText).toBe(
          'Is this meant for handling concurrency?',
        );
      }
    },
  );
});
