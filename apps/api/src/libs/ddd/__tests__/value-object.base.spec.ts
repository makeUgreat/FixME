import { describe, expect, it } from 'vitest';
import { type DomainError } from '../error.base';
import { err, ok, type Result } from '../../result';
import { ValueObject, type DomainPrimitive } from '../value-object.base';

const sampleEmptyError: DomainError = {
  kind: 'invariant_violation',
  code: 'sample.empty',
  message: 'Sample cannot be empty',
  details: { fields: ['value'] },
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

interface SampleDetailsProps {
  label: string;
  nested: {
    count: number;
  };
}

class SampleDetails extends ValueObject<SampleDetailsProps> {
  static of(props: SampleDetailsProps): Result<SampleDetails, DomainError> {
    return super.construct({
      props,
      validate: (valueObjectProps) => ok(valueObjectProps),
      instantiate: (valueObjectProps) => new SampleDetails(valueObjectProps),
    });
  }

  private constructor(props: SampleDetailsProps) {
    super(props);
  }
}

describe('ValueObject', () => {
  describe('construct', () => {
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

  describe('isValueObject', () => {
    it('값 객체 인스턴스이면 true를 반환한다', () => {
      const result = SampleName.of('spring');

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(ValueObject.isValueObject(result.value)).toBe(true);
      }
    });

    it('값 객체 인스턴스가 아니면 false를 반환한다', () => {
      expect(ValueObject.isValueObject({ value: 'spring' })).toBe(false);
    });
  });

  describe('value', () => {
    it('primitive 값 객체는 primitive 값을 반환한다', () => {
      const result = SampleName.of('spring');

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.value).toBe('spring');
      }
    });

    it('object 값 객체는 원본 객체 변경의 영향을 받지 않는다', () => {
      const props = {
        label: 'spring',
        nested: {
          count: 1,
        },
      };
      const result = SampleDetails.of(props);

      props.label = 'summer';
      props.nested.count = 2;

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.value).toEqual({
          label: 'spring',
          nested: {
            count: 1,
          },
        });
      }
    });

    it('object 값 객체는 중첩 속성까지 변경할 수 없다', () => {
      const result = SampleDetails.of({
        label: 'spring',
        nested: {
          count: 1,
        },
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(() => {
          result.value.value.nested.count = 2;
        }).toThrow(TypeError);
      }
    });
  });

  describe('equals', () => {
    it('같은 값을 가진 값 객체이면 true를 반환한다', () => {
      const first = SampleName.of('spring');
      const second = SampleName.of('spring');

      expect(first.isOk()).toBe(true);
      expect(second.isOk()).toBe(true);

      if (first.isOk() && second.isOk()) {
        expect(first.value.equals(second.value)).toBe(true);
      }
    });

    it('다른 값을 가진 값 객체이면 false를 반환한다', () => {
      const first = SampleName.of('spring');
      const second = SampleName.of('summer');

      expect(first.isOk()).toBe(true);
      expect(second.isOk()).toBe(true);

      if (first.isOk() && second.isOk()) {
        expect(first.value.equals(second.value)).toBe(false);
      }
    });

    it('비교 대상이 없으면 false를 반환한다', () => {
      const result = SampleName.of('spring');

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.equals()).toBe(false);
      }
    });
  });
});
