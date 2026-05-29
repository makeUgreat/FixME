import { describe, expect, it } from 'vitest';
import { err, ok, type Result } from 'neverthrow';
import { AggregateRoot } from './aggregate-root.base';
import { type CreateEntityParams } from './entity.base';
import { type DomainError } from './domain-error';
import { ValueObject, type DomainPrimitive } from './value-object.base';

const sampleEmptyError: DomainError = {
  kind: 'invariant_violation',
  code: 'sample.empty',
  message: 'Sample cannot be empty',
};

class SampleName extends ValueObject<string> {
  static of(value: string): Result<SampleName, DomainError> {
    return super.construct({
      props: { value: value.trim() },
      validate: (props) => SampleName.validateProps(props),
      instantiate: (props) => new SampleName(props),
    });
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
  static create(params: {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<SampleAggregate, DomainError> {
    const nameResult = SampleName.of(params.name);

    if (nameResult.isErr()) {
      return err(nameResult.error);
    }

    return super.construct({
      params: {
        id: params.id,
        props: {
          name: nameResult.value,
        },
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      },
      validate: (entityParams) => ok(entityParams),
      instantiate: (entityParams) => new SampleAggregate(entityParams),
    });
  }

  static restore(
    params: CreateEntityParams<SampleProps>,
  ): Result<SampleAggregate, DomainError> {
    return super.construct({
      params,
      validate: (entityParams) => ok(entityParams),
      instantiate: (entityParams) => new SampleAggregate(entityParams),
    });
  }
}

describe('Domain model base', () => {
  describe('ValueObject', () => {
    it('검증에 성공하면 성공 Result와 값 객체를 반환한다', () => {
      const result = SampleName.of('  spring  ');

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.value).toBe('spring');
      }
    });

    it('검증에 실패하면 예외를 던지지 않고 실패 Result를 반환한다', () => {
      const result = SampleName.of(' ');

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toBe(sampleEmptyError);
      }
    });
  });

  describe('Entity', () => {
    it('검증에 성공하면 성공 Result와 엔티티를 반환한다', () => {
      const result = SampleAggregate.create({
        id: 'sample-1',
        name: 'spring',
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.id).toBe('sample-1');
        expect(result.value.getProps().name.value).toBe('spring');
      }
    });

    it('기본 엔티티 검증에 실패하면 실패 Result를 반환한다', () => {
      const createdAt = new Date('2026-01-02T00:00:00.000Z');
      const updatedAt = new Date('2026-01-01T00:00:00.000Z');
      const result = SampleAggregate.create({
        id: 'sample-1',
        name: 'spring',
        createdAt,
        updatedAt,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('entity.updated_at_before_created_at');
      }
    });

    it('복원할 때도 성공 Result와 엔티티를 반환한다', () => {
      const nameResult = SampleName.of('spring');

      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isErr()) {
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

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.createdAt).toEqual(createdAt);
        expect(result.value.updatedAt).toEqual(updatedAt);
      }
    });
  });
});
