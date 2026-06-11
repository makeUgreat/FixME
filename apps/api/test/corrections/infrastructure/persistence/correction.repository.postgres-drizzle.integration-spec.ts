import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  inject,
  it,
} from 'vitest';
import { CorrectionPersistenceMapper } from '../../../../src/contexts/corrections/infrastructure/persistence/postgres-drizzle/correction-persistence.mapper';
import { CorrectionPostgresDrizzleRepository } from '../../../../src/contexts/corrections/infrastructure/persistence/postgres-drizzle/correction.repository';
import { createCorrectionFixture } from '../../fixtures/correction.fixture';
import {
  createPostgresDrizzleTestDatabase,
  type PostgresDrizzleTestDatabase,
  truncateCorrectionPersistenceTables,
} from '../../../support/postgres-drizzle-test-database';

describe('CorrectionPostgresDrizzleRepository (integration)', () => {
  let testDatabase: PostgresDrizzleTestDatabase;
  let repository: CorrectionPostgresDrizzleRepository;

  beforeAll(async () => {
    testDatabase = createPostgresDrizzleTestDatabase(
      inject('postgresConnectionUri'),
    );
    repository = new CorrectionPostgresDrizzleRepository(
      testDatabase.database,
      new CorrectionPersistenceMapper(),
    );
  });

  afterEach(async () => {
    await truncateCorrectionPersistenceTables(testDatabase.database);
  });

  afterAll(async () => {
    await testDatabase.close();
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
});
