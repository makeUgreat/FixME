import { describe, expect, it } from 'vitest';
import {
  all,
  andThen,
  ensure,
  err,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  type Result,
} from './result';
import { type DomainError } from './domain-error';

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
        code: 'sample.empty',
        message: 'Sample cannot be empty',
      };
      const result: Result<string, DomainError> = err(error);

      expect(result).toEqual({
        kind: 'err',
        error,
      });

      if (isErr(result)) {
        expect(result.error).toBe(error);
        expect(result.error.kind).toBe('invariant_violation');
        expect(result.error.code).toBe('sample.empty');
        expect(result.error.message).toBe('Sample cannot be empty');
      }
    });

    it('kind가 err이면 실패 타입으로 좁혀진다', () => {
      const result: Result<string, DomainError> = err({
        kind: 'invariant_violation',
        code: 'sample.empty',
        message: 'Sample cannot be empty',
      });

      if (result.kind === 'err') {
        expect(result.error.code).toBe('sample.empty');
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

  describe('map', () => {
    it('성공 Result의 값을 변환한다', () => {
      const result = map(ok('created'), (value) => value.length);

      expect(result).toEqual({
        kind: 'ok',
        value: 7,
      });
    });

    it('실패 Result는 변환하지 않고 유지한다', () => {
      const error: DomainError = {
        kind: 'invariant_violation',
        code: 'sample.empty',
        message: 'Sample cannot be empty',
      };
      const result = map(err(error), (value: string) => value.length);

      expect(result).toEqual({
        kind: 'err',
        error,
      });
    });
  });

  describe('mapErr', () => {
    it('실패 Result의 오류를 변환한다', () => {
      const result = mapErr(
        err({
          kind: 'invariant_violation',
          code: 'sample.empty',
          message: 'Sample cannot be empty',
        }),
        (error) => error.code,
      );

      expect(result).toEqual({
        kind: 'err',
        error: 'sample.empty',
      });
    });

    it('성공 Result는 변환하지 않고 유지한다', () => {
      const result = mapErr(ok('created'), (error: DomainError) => error.code);

      expect(result).toEqual({
        kind: 'ok',
        value: 'created',
      });
    });
  });

  describe('andThen', () => {
    it('성공 Result이면 다음 Result 함수를 실행한다', () => {
      const result = andThen(ok('created'), (value) => ok(value.length));

      expect(result).toEqual({
        kind: 'ok',
        value: 7,
      });
    });

    it('실패 Result이면 다음 Result 함수를 실행하지 않고 기존 실패를 반환한다', () => {
      const error: DomainError = {
        kind: 'state_conflict',
        code: 'order.already_paid',
        message: 'Order is already paid',
      };
      const result = andThen(err(error), () => ok('unreachable'));

      expect(result).toEqual({
        kind: 'err',
        error,
      });
    });
  });

  describe('ensure', () => {
    it('조건이 참이면 성공 Result를 반환한다', () => {
      const result = ensure(true, 'failed');

      expect(result).toEqual({
        kind: 'ok',
        value: undefined,
      });
    });

    it('조건이 거짓이면 실패 Result를 반환한다', () => {
      const result = ensure(false, 'failed');

      expect(result).toEqual({
        kind: 'err',
        error: 'failed',
      });
    });
  });

  describe('all', () => {
    it('모든 규칙이 성공하면 성공 Result를 반환한다', () => {
      const result = all([() => ok(undefined), () => ok(undefined)]);

      expect(result).toEqual({
        kind: 'ok',
        value: undefined,
      });
    });

    it('첫 실패 Result를 반환하고 이후 규칙은 실행하지 않는다', () => {
      let executed = false;
      const result = all([
        () => err('first'),
        () => {
          executed = true;
          return ok(undefined);
        },
      ]);

      expect(result).toEqual({
        kind: 'err',
        error: 'first',
      });
      expect(executed).toBe(false);
    });
  });
});
