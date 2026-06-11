import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  inject,
  it,
} from 'vitest';
import { sql } from 'drizzle-orm';
import { CorrectionPersistenceMapper } from '../../../../src/contexts/corrections/infrastructure/persistence/postgres-drizzle/correction-persistence.mapper';
import { CorrectionPostgresDrizzleRepository } from '../../../../src/contexts/corrections/infrastructure/persistence/postgres-drizzle/correction.repository';
import { createCorrectionFixture } from '../../fixtures/correction.fixture';
import {
  createPostgresDrizzleTestDatabase,
  type PostgresDrizzleTestDatabase,
  truncateCorrectionPersistenceTables,
} from '../../../support/postgres-drizzle-test-database';

describe('CorrectionPostgresDrizzleRepository (integration)', () => {
  let adminDatabase: PostgresDrizzleTestDatabase;
  let appDatabase: PostgresDrizzleTestDatabase;
  let workerDatabase: PostgresDrizzleTestDatabase;
  let repository: CorrectionPostgresDrizzleRepository;

  beforeAll(async () => {
    adminDatabase = createPostgresDrizzleTestDatabase(
      inject('postgresAdminConnectionUri'),
    );
    appDatabase = createPostgresDrizzleTestDatabase(
      inject('correctionsAppConnectionUri'),
    );
    workerDatabase = createPostgresDrizzleTestDatabase(
      inject('correctionsWorkerConnectionUri'),
    );
    repository = new CorrectionPostgresDrizzleRepository(
      appDatabase.database,
      new CorrectionPersistenceMapper(),
    );
  });

  afterEach(async () => {
    await truncateCorrectionPersistenceTables(adminDatabase.database);
  });

  afterAll(async () => {
    await workerDatabase.close();
    await appDatabase.close();
    await adminDatabase.close();
  });

  it('login roles inherit the intended permission roles', async () => {
    const result = await adminDatabase.database.execute<{
      appHasRw: boolean;
      rwHasRo: boolean;
      workerHasRo: boolean;
      migratorHasDdl: boolean;
    }>(sql`
      SELECT
        pg_has_role('fixme_corrections_app', 'fixme_corrections_rw', 'member') AS "appHasRw",
        pg_has_role('fixme_corrections_rw', 'fixme_corrections_ro', 'member') AS "rwHasRo",
        pg_has_role('fixme_corrections_worker', 'fixme_corrections_ro', 'member') AS "workerHasRo",
        pg_has_role('fixme_corrections_migrator', 'fixme_corrections_ddl', 'member') AS "migratorHasDdl"
    `);

    expect(result.rows[0]).toEqual({
      appHasRw: true,
      rwHasRo: true,
      workerHasRo: true,
      migratorHasDdl: true,
    });
  });

  it('저장한 correction을 id로 조회하면 복원된 aggregate를 반환한다', async () => {
    const correction = createCorrectionFixture();

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
  });

  it('없는 id로 조회하면 null을 반환한다', async () => {
    const result = await repository.findById('unknown-correction');

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toBeNull();
    }
  });

  it('같은 id로 다시 저장하면 마지막 aggregate를 반환한다', async () => {
    const first = createCorrectionFixture({ id: 'correction-1' });
    const second = createCorrectionFixture({
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
  });

  it('runtime role cannot create tables in the public schema', async () => {
    await expect(
      appDatabase.database.execute(
        sql`CREATE TABLE public.corrections_runtime_forbidden (id text)`,
      ),
    ).rejects.toThrow();
  });

  it('runtime role cannot create tables in the corrections schema', async () => {
    await expect(
      appDatabase.database.execute(
        sql`CREATE TABLE corrections.corrections_runtime_forbidden (id text)`,
      ),
    ).rejects.toThrow();
  });

  it('runtime role cannot read tables from another schema', async () => {
    await adminDatabase.database.execute(
      sql`CREATE SCHEMA IF NOT EXISTS outside_context`,
    );
    await adminDatabase.database.execute(
      sql`CREATE TABLE outside_context.probe (id text PRIMARY KEY)`,
    );

    try {
      await expect(
        appDatabase.database.execute(sql`SELECT * FROM outside_context.probe`),
      ).rejects.toThrow();
    } finally {
      await adminDatabase.database.execute(
        sql`DROP SCHEMA outside_context CASCADE`,
      );
    }
  });

  it('worker role can read but cannot write corrections tables', async () => {
    const correction = createCorrectionFixture({ id: 'worker-readable' });

    const saveResult = await repository.save(correction);
    expect(saveResult.isOk()).toBe(true);

    const readResult = await workerDatabase.database.execute<{ id: string }>(
      sql`SELECT id FROM corrections.corrections WHERE id = 'worker-readable'`,
    );

    expect(readResult.rows).toEqual([{ id: 'worker-readable' }]);

    await expect(
      workerDatabase.database.execute(
        sql`INSERT INTO corrections.corrections (id) VALUES ('worker-insert-forbidden')`,
      ),
    ).rejects.toThrow();

    await expect(
      workerDatabase.database.execute(
        sql`UPDATE corrections.corrections SET corrected_text = 'forbidden' WHERE id = 'worker-readable'`,
      ),
    ).rejects.toThrow();

    await expect(
      workerDatabase.database.execute(
        sql`DELETE FROM corrections.corrections WHERE id = 'worker-readable'`,
      ),
    ).rejects.toThrow();
  });
});
