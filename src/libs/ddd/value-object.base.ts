export type Primitives = string | number | boolean;

export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

export abstract class ValueObject<T> {
  protected readonly props: Readonly<ValueObjectProps<T>>;

  protected constructor(props: ValueObjectProps<T>) {
    this.validate(props);
    this.props = this.isDomainPrimitive(props)
      ? Object.freeze(props)
      : this.deepFreeze(structuredClone(props));
  }

  protected abstract validate(props: ValueObjectProps<T>): void;

  static isValueObject(obj: unknown): obj is ValueObject<unknown> {
    return obj instanceof ValueObject;
  }

  get value(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }

    return this.props as T;
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    return JSON.stringify(this.value) === JSON.stringify(vo.value);
  }

  private isDomainPrimitive(
    obj: unknown,
  ): obj is DomainPrimitive<T & (Primitives | Date)> {
    return Object.prototype.hasOwnProperty.call(obj, 'value');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private deepFreeze<TValue>(obj: TValue): TValue {
    Object.freeze(obj);

    if (this.isRecord(obj)) {
      Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value = obj[prop];

        if (this.isRecord(value) && !Object.isFrozen(value)) {
          this.deepFreeze(value);
        }
      });
    }

    return obj;
  }
}
