import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../../../src/bootstrap/nest/app.module';
import {
  CORRECTION_REPOSITORY,
  type CorrectionRepository,
} from '../../../../src/contexts/corrections/application/ports';
import { CorrectionMemoryRepository } from '../../../../src/contexts/corrections/infrastructure/persistence/memory/correction.repository';
import { createCorrectionFixture } from '../../fixtures/correction.fixture';
import { createTestNestApp } from '../../../support/create-test-nest-app';

describe('CorrectionMemoryRepository (integration)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestNestApp(AppModule);
  });

  afterEach(async () => {
    await app.close();
  });

  it('CORRECTION_REPOSITORY token이 memory repository로 resolve된다', () => {
    const repository = app.get<CorrectionRepository>(CORRECTION_REPOSITORY);

    expect(repository).toBeInstanceOf(CorrectionMemoryRepository);
  });

  it('저장한 correction을 id로 조회하면 같은 aggregate를 반환한다', async () => {
    const repository = new CorrectionMemoryRepository();
    const correction = createCorrectionFixture();

    const saveResult = await repository.save(correction);
    const findResult = await repository.findById(correction.id);

    expect(saveResult.isOk()).toBe(true);
    expect(findResult.isOk()).toBe(true);

    if (findResult.isOk()) {
      expect(findResult.value).toBe(correction);
    }
  });

  it('없는 id로 조회하면 null을 반환한다', async () => {
    const repository = new CorrectionMemoryRepository();

    const result = await repository.findById('unknown-correction');

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toBeNull();
    }
  });

  it('같은 id로 다시 저장하면 마지막 aggregate를 반환한다', async () => {
    const repository = new CorrectionMemoryRepository();
    const first = createCorrectionFixture({ id: 'correction-1' });
    const second = createCorrectionFixture({
      id: 'correction-1',
      correctedText: 'Is this meant for handling concurrency?',
    });

    const firstSaveResult = await repository.save(first);
    const secondSaveResult = await repository.save(second);

    expect(firstSaveResult.isOk()).toBe(true);
    expect(secondSaveResult.isOk()).toBe(true);

    const result = await repository.findById('correction-1');

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toBe(second);
    }
  });
});
