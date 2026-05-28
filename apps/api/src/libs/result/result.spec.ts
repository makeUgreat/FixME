import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok, type DomainError, type Result } from '.';

describe('Result', () => {
  describe('ok', () => {
    it('성공 상태와 값을 가진 Result를 생성한다', () => {
      const result = ok('created');

      expect(result).toEqual({
        kind: 'ok',
        value: 'created',
      });

      if (isOk(result)) {
        expect(result.value).toBe('created');
      }
    });

    it('kind가 ok이면 성공 타입으로 좁혀진다', () => {
      const result: Result<string, DomainError> = ok('created');

      if (result.kind === 'ok') {
        expect(result.value).toBe('created');
      }
    });
  });

  describe('err', () => {
    it('실패 상태와 오류를 가진 Result를 생성한다', () => {
      const error: DomainError = {
        kind: 'invariant_violation',
        code: 'english_sentence.empty',
        message: 'English sentence cannot be empty',
      };
      const result: Result<string, DomainError> = err(error);

      expect(result).toEqual({
        kind: 'err',
        error,
      });

      if (isErr(result)) {
        expect(result.error).toBe(error);
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('english_sentence.empty');
        expect(result.error.message).toBe(
          'English sentence cannot be empty',
        );
      }
    });

    it('kind가 err이면 실패 타입으로 좁혀진다', () => {
      const result: Result<string, DomainError> = err({
        kind: 'invariant_violation',
        code: 'english_sentence.empty',
        message: 'English sentence cannot be empty',
      });

      if (result.kind === 'err') {
        expect(result.error.code).toBe('english_sentence.empty');
      }
    });

    it('오류 kind로 실패 타입을 좁혀서 처리한다', () => {
      const result: Result<string, DomainError> = err({
        kind: 'state_conflict',
        code: 'order.already_paid',
        message: 'Order is already paid',
      });

      if (isErr(result)) {
        switch (result.error.kind) {
          case 'invariant_violation':
            expect(result.error.code).toContain('.');
            break;
          case 'state_conflict':
            expect(result.error.code).toBe('order.already_paid');
            break;
          case 'operation_not_allowed':
            expect(result.error.code).toContain('.');
            break;
        }
      }
    });
  });
});
