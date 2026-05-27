import { Guard } from '../guard';

export type EntityId = string;

export interface BaseEntityProps {
  id: EntityId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityParams<T> {
  id: EntityId;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class Entity<EntityProps> {
  protected readonly _id: EntityId;
  protected readonly props: EntityProps;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  protected constructor(params: CreateEntityParams<EntityProps>) {
    this.validateProps(params.props);

    const now = new Date();
    const createdAt = params.createdAt ?? now;
    const updatedAt = params.updatedAt ?? createdAt;

    if (updatedAt.getTime() < createdAt.getTime()) {
      throw new Error('updatedAt cannot be earlier than createdAt');
    }

    this._id = params.id;
    this.props = params.props;
    this._createdAt = new Date(createdAt.getTime());
    this._updatedAt = new Date(updatedAt.getTime());
  }

  get id(): EntityId {
    return this._id;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  getProps(): EntityProps & BaseEntityProps {
    return Object.freeze({
      id: this._id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.props,
    });
  }

  private validateProps(props: EntityProps): void {
    const maxProps = 50;

    if (Guard.isEmpty(props)) {
      throw new Error('Entity props cannot be empty');
    }

    if (typeof props !== 'object') {
      throw new Error('Entity props must be an object');
    }

    if (Object.keys(props as Record<string, unknown>).length > maxProps) {
      throw new Error(`Entity props cannot exceed ${maxProps} properties`);
    }
  }
}
