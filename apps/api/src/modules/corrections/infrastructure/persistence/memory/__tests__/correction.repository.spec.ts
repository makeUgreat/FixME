import { describe, expect, it } from 'vitest';
import { Correction, CorrectionFeedback, Mistake } from '../../../../domain';
import { MemoryCorrectionRepository } from '../correction.repository';

const createCorrection = (params?: {
  id?: string;
  correctedText?: string;
}): Correction => {
  const id = params?.id ?? 'correction-1';

  return Correction.create({
    id,
    originalText: 'Is this for concurrency?',
    correctedText: params?.correctedText ?? 'Is this for handling concurrency?',
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
      id: `${id}-metadata`,
      model: 'gpt-5-mini',
      providerMetadata: { providerRequestId: `${id}-request` },
    },
  })._unsafeUnwrap();
};

describe('MemoryCorrectionRepository', () => {
  describe('save', () => {
    it('교정 aggregate를 저장하고 성공 Result로 반환한다', async () => {
      const repository = new MemoryCorrectionRepository();
      const correction = createCorrection();

      const result = await repository.save(correction);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(correction);
      }
    });
  });

  describe('findById', () => {
    it('저장한 교정 aggregate를 성공 Result로 반환한다', async () => {
      const repository = new MemoryCorrectionRepository();
      const correction = createCorrection();

      const saveResult = await repository.save(correction);
      expect(saveResult.isOk()).toBe(true);

      const result = await repository.findById(correction.id);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(correction);
      }
    });

    it('없는 id는 null 성공 Result로 반환한다', async () => {
      const repository = new MemoryCorrectionRepository();

      const result = await repository.findById('unknown-correction');

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });
});
