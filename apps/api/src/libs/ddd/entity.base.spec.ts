import { describe, expect, it } from 'vitest';
import { Entity, type CreateEntityParams } from './entity.base';
import { type DomainError } from './error.type';
import { ok, type Result } from '../result';

interface SampleProps {
  name: string;
}

class SampleEntity extends Entity<string, SampleProps> {
  static create(params: {
    id: string;
    props?: SampleProps;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<SampleEntity, DomainError> {
    return SampleEntity.restore({
      id: params.id,
      props: params.props ?? { name: 'spring' },
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
  }

  static restore(
    params: CreateEntityParams<string, SampleProps>,
  ): Result<SampleEntity, DomainError> {
    return super.construct({
      params,
      validate: (entityParams) => ok(entityParams),
      instantiate: (entityParams) => new SampleEntity(entityParams),
    });
  }
}

class NumericIdEntity extends Entity<number, SampleProps> {
  static create(params: {
    id: number;
    props?: SampleProps;
  }): Result<NumericIdEntity, DomainError> {
    return super.construct({
      params: {
        id: params.id,
        props: params.props ?? { name: 'spring' },
      },
      validate: (entityParams) => ok(entityParams),
      instantiate: (entityParams) => new NumericIdEntity(entityParams),
    });
  }
}

describe('Entity', () => {
  describe('construct', () => {
    it('검증에 성공하면 성공 Result와 엔티티를 반환한다', () => {
      const result = SampleEntity.create({
        id: 'sample-1',
        props: { name: 'spring' },
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.id).toBe('sample-1');
        expect(result.value.getProps().name).toBe('spring');
      }
    });

    it('엔티티별로 숫자 식별자 타입을 사용할 수 있다', () => {
      const result = NumericIdEntity.create({
        id: 1,
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.id).toBe(1);
        expect(result.value.getProps().id).toBe(1);
      }
    });

    it('props가 비어 있으면 실패 Result를 반환한다', () => {
      const result = SampleEntity.restore({
        id: 'sample-1',
        props: {} as SampleProps,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('entity.props_empty');
      }
    });

    it('props가 객체가 아니면 실패 Result를 반환한다', () => {
      const result = SampleEntity.restore({
        id: 'sample-1',
        props: 'invalid' as unknown as SampleProps,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('entity.props_not_object');
      }
    });

    it('props가 최대 속성 수를 넘으면 실패 Result를 반환한다', () => {
      const props = Object.fromEntries(
        Array.from({ length: 51 }, (value, index) => [`prop${index}`, value]),
      ) as unknown as SampleProps;
      const result = SampleEntity.restore({
        id: 'sample-1',
        props,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('entity.props_too_many');
      }
    });

    it('수정일이 생성일보다 이르면 실패 Result를 반환한다', () => {
      const result = SampleEntity.create({
        id: 'sample-1',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('entity.updated_at_before_created_at');
      }
    });
  });

  describe('createdAt', () => {
    it('입력 Date와 반환 Date를 방어적으로 복사한다', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const result = SampleEntity.create({
        id: 'sample-1',
        createdAt,
      });

      createdAt.setUTCFullYear(2030);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const returnedCreatedAt = result.value.createdAt;

        returnedCreatedAt.setUTCFullYear(2031);

        expect(result.value.createdAt).toEqual(
          new Date('2026-01-01T00:00:00.000Z'),
        );
      }
    });
  });

  describe('updatedAt', () => {
    it('입력 Date와 반환 Date를 방어적으로 복사한다', () => {
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');
      const result = SampleEntity.create({
        id: 'sample-1',
        updatedAt,
      });

      updatedAt.setUTCFullYear(2030);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const returnedUpdatedAt = result.value.updatedAt;

        returnedUpdatedAt.setUTCFullYear(2031);

        expect(result.value.updatedAt).toEqual(
          new Date('2026-01-02T00:00:00.000Z'),
        );
      }
    });
  });

  describe('getProps', () => {
    it('id, 생성일, 수정일, 엔티티 속성을 함께 반환한다', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');
      const result = SampleEntity.create({
        id: 'sample-1',
        props: { name: 'spring' },
        createdAt,
        updatedAt,
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.getProps()).toEqual({
          id: 'sample-1',
          name: 'spring',
          createdAt,
          updatedAt,
        });
      }
    });

    it('반환한 props 객체를 변경할 수 없다', () => {
      const result = SampleEntity.create({
        id: 'sample-1',
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(() => {
          Object.assign(result.value.getProps(), { name: 'summer' });
        }).toThrow(TypeError);
      }
    });
  });
});
