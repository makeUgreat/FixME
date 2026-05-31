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
        expect(result.error.kind).toBe('invariant_violation');
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
        expect(result.error.kind).toBe('invariant_violation');
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
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('mistake.types_invalid');
        if (result.error.code === 'mistake.types_invalid') {
          expect(result.error.details).toEqual({ types: ['unknown'] });
        }
      }
    });
  });

  describe('createMany', () => {
    it('모든 입력이 유효하면 성공 Result와 오류 값 객체 배열을 반환한다', () => {
      const result = Mistake.createMany([
        {
          types: ['naturalness'],
          explanation: ' The corrected phrase is more natural. ',
        },
        {
          types: ['clarity'],
          explanation: ' The corrected phrase is clearer. ',
        },
      ]);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.map((mistake) => mistake.value)).toEqual([
          {
            types: ['naturalness'],
            explanation: 'The corrected phrase is more natural.',
          },
          {
            types: ['clarity'],
            explanation: 'The corrected phrase is clearer.',
          },
        ]);
      }
    });

    it('하나라도 유효하지 않으면 실패 Result를 반환한다', () => {
      const result = Mistake.createMany([
        {
          types: ['naturalness'],
          explanation: 'The corrected phrase is more natural.',
        },
        {
          types: [],
          explanation: 'The corrected phrase is clearer.',
        },
      ]);

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('mistake.types_empty');
      }
    });
  });
});
