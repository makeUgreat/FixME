import { describe, expect, it } from 'vitest';
import { CorrectionRecord } from './index';

describe('CorrectionRecord', () => {
  describe('create', () => {
    it('교정 기록을 생성하면 입력값을 정규화해서 반환한다', () => {
      const record = CorrectionRecord.create({
        originalSentence: ' I go to school yesterday. ',
        correctedSentence: ' I went to school yesterday. ',
        explanation: " Use the past tense because 'yesterday' is in the past. ",
        mistakes: [
          {
            originalPart: ' go ',
            correctedPart: ' went ',
            type: ' grammar ',
            explanation: ' The verb should be in past tense. ',
          },
        ],
      });

      expect(record.id).toHaveLength(36);
      expect(record.toPrimitives()).toMatchObject({
        originalSentence: 'I go to school yesterday.',
        correctedSentence: 'I went to school yesterday.',
        explanation: "Use the past tense because 'yesterday' is in the past.",
        mistakes: [
          {
            originalPart: 'go',
            correctedPart: 'went',
            type: 'grammar',
            explanation: 'The verb should be in past tense.',
          },
        ],
      });
    });

    it('원문이 비어 있으면 예외를 던진다', () => {
      expect(() =>
        CorrectionRecord.create({
          originalSentence: '   ',
          correctedSentence: 'I went to school yesterday.',
          explanation: 'Use past tense.',
        }),
      ).toThrow('originalSentence is required');
    });

    it('실수 설명이 비어 있으면 예외를 던진다', () => {
      expect(() =>
        CorrectionRecord.create({
          originalSentence: 'I go to school yesterday.',
          correctedSentence: 'I went to school yesterday.',
          explanation: 'Use past tense.',
          mistakes: [
            {
              originalPart: 'go',
              correctedPart: 'went',
              type: 'grammar',
              explanation: ' ',
            },
          ],
        }),
      ).toThrow('explanation is required');
    });
  });

  describe('rehydrate', () => {
    it('수정일이 생성일보다 빠르면 예외를 던진다', () => {
      expect(() =>
        CorrectionRecord.rehydrate({
          id: 'correction-1',
          originalSentence: 'I go to school yesterday.',
          correctedSentence: 'I went to school yesterday.',
          explanation: 'Past tense is required.',
          mistakes: [],
          createdAt: new Date('2026-05-27T00:00:00.000Z'),
          updatedAt: new Date('2026-05-26T00:00:00.000Z'),
        }),
      ).toThrow('updatedAt cannot be earlier than createdAt');
    });
  });
});
