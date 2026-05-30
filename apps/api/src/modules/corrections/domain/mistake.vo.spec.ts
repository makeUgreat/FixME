import { describe, expect, it } from 'vitest';
import { Mistake } from './mistake.vo';
import { type MistakeType } from './mistake-type.constant';

describe('Mistake', () => {
  describe('of', () => {
    it('검증에 성공하면 성공 Result와 오류 값 객체를 반환한다', () => {
      const result = Mistake.of({
        types: ['naturalness', 'clarity'],
        explanation: ' The corrected phrase is more natural. ',
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.value).toEqual({
          types: ['naturalness', 'clarity'],
          explanation: 'The corrected phrase is more natural.',
        });
      }
    });

    it('오류 유형이 비어 있으면 실패 Result를 반환한다', () => {
      const result = Mistake.of({
        types: [],
        explanation: 'The corrected phrase is more natural.',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('mistake.types_empty');
      }
    });

    it('설명이 비어 있으면 실패 Result를 반환한다', () => {
      const result = Mistake.of({
        types: ['naturalness'],
        explanation: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('mistake.explanation_empty');
      }
    });

    it('정의되지 않은 오류 유형이면 실패 Result를 반환한다', () => {
      const result = Mistake.of({
        types: ['unknown' as MistakeType],
        explanation: 'The corrected phrase is more natural.',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('mistake.types_invalid');
      }
    });
  });
});
