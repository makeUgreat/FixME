import { describe, expect, it } from 'vitest';
import { AggregateRoot } from './aggregate-root.base';
import { type CreateEntityParams } from './entity.base';
import { type DomainError } from './domain-error';
import { err, isErr, isOk, ok, type Result } from './result';
import { ValueObject, type DomainPrimitive } from './value-object.base';

const sampleEmptyError: DomainError = {
  kind: 'invariant_violation',
  code: 'sample.empty',
  message: 'Sample cannot be empty',
};

class SampleName extends ValueObject<string> {
  static from(value: string): Result<SampleName, DomainError> {
    return super.create(
      { value: value.trim() },
      (props) => SampleName.validateProps(props),
      (props) => new SampleName(props),
    );
  }

  private constructor(props: DomainPrimitive<string>) {
    super(props);
  }

  private static validateProps(
    props: DomainPrimitive<string>,
  ): Result<DomainPrimitive<string>, DomainError> {
    if (props.value.length === 0) {
      return err(sampleEmptyError);
    }

    return ok(props);
  }
}

interface SampleProps {
  name: SampleName;
}

class SampleAggregate extends AggregateRoot<SampleProps> {
  static from(params: {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<SampleAggregate, DomainError> {
    const nameResult = SampleName.from(params.name);

    if (isErr(nameResult)) {
      return nameResult;
    }

    return super.create(
      {
        id: params.id,
        props: {
          name: nameResult.value,
        },
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      },
      (entityParams) => ok(entityParams),
      (entityParams) => new SampleAggregate(entityParams),
    );
  }

  static restore(
    params: CreateEntityParams<SampleProps>,
  ): Result<SampleAggregate, DomainError> {
    return super.create(
      params,
      (entityParams) => ok(entityParams),
      (entityParams) => new SampleAggregate(entityParams),
    );
  }
}

describe('Domain model base', () => {
  describe('ValueObject', () => {
    it('검증에 성공하면 성공 Result와 값 객체를 반환한다', () => {
      const result = SampleName.from('  spring  ');

      expect(isOk(result)).toBe(true);

      if (isOk(result)) {
        expect(result.value.value).toBe('spring');
      }
    });

    it('검증에 실패하면 예외를 던지지 않고 실패 Result를 반환한다', () => {
      const result = SampleName.from(' ');

      expect(isErr(result)).toBe(true);

      if (isErr(result)) {
        expect(result.error).toBe(sampleEmptyError);
      }
    });
  });

  describe('Entity', () => {
    it('검증에 성공하면 성공 Result와 엔티티를 반환한다', () => {
      const result = SampleAggregate.from({
        id: 'sample-1',
        name: 'spring',
      });

      expect(isOk(result)).toBe(true);

      if (isOk(result)) {
        expect(result.value.id).toBe('sample-1');
        expect(result.value.getProps().name.value).toBe('spring');
      }
    });

    it('기본 엔티티 검증에 실패하면 실패 Result를 반환한다', () => {
      const createdAt = new Date('2026-01-02T00:00:00.000Z');
      const updatedAt = new Date('2026-01-01T00:00:00.000Z');
      const result = SampleAggregate.from({
        id: 'sample-1',
        name: 'spring',
        createdAt,
        updatedAt,
      });

      expect(isErr(result)).toBe(true);

      if (isErr(result)) {
        expect(result.error.code).toBe('entity.updated_at_before_created_at');
      }
    });

    it('복원할 때도 성공 Result와 엔티티를 반환한다', () => {
      const nameResult = SampleName.from('spring');

      expect(isOk(nameResult)).toBe(true);

      if (!isOk(nameResult)) {
        return;
      }

      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');
      const result = SampleAggregate.restore({
        id: 'sample-1',
        props: {
          name: nameResult.value,
        },
        createdAt,
        updatedAt,
      });

      expect(isOk(result)).toBe(true);

      if (isOk(result)) {
        expect(result.value.createdAt).toEqual(createdAt);
        expect(result.value.updatedAt).toEqual(updatedAt);
      }
    });
  });
});
