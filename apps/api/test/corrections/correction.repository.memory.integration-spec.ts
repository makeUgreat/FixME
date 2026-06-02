import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { CORRECTION_REPOSITORY } from '../../src/modules/corrections/corrections.tokens';
import {
  Correction,
  CorrectionFeedback,
  type CorrectionRepository,
  Mistake,
} from '../../src/modules/corrections/domain';
import { MemoryCorrectionRepository } from '../../src/modules/corrections/infrastructure/correction.repository.memory';
import { createTestNestApp } from '../support/create-test-nest-app';

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

describe('MemoryCorrectionRepository (integration)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestNestApp(AppModule);
  });

  afterEach(async () => {
    await app.close();
  });

  it('CORRECTION_REPOSITORY token이 memory repository로 resolve된다', () => {
    const repository = app.get<CorrectionRepository>(CORRECTION_REPOSITORY);

    expect(repository).toBeInstanceOf(MemoryCorrectionRepository);
  });

  it('저장한 correction을 id로 조회하면 같은 aggregate를 반환한다', async () => {
    const repository = new MemoryCorrectionRepository();
    const correction = createCorrection();

    await repository.save(correction);

    await expect(repository.findById(correction.id)).resolves.toBe(correction);
  });

  it('없는 id로 조회하면 null을 반환한다', async () => {
    const repository = new MemoryCorrectionRepository();

    await expect(repository.findById('unknown-correction')).resolves.toBeNull();
  });

  it('같은 id로 다시 저장하면 마지막 aggregate를 반환한다', async () => {
    const repository = new MemoryCorrectionRepository();
    const first = createCorrection({ id: 'correction-1' });
    const second = createCorrection({
      id: 'correction-1',
      correctedText: 'Is this meant for handling concurrency?',
    });

    await repository.save(first);
    await repository.save(second);

    await expect(repository.findById('correction-1')).resolves.toBe(second);
  });
});
