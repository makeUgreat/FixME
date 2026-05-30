import { Guard } from '../guard';
import { type DomainError } from './domain-error';
import { err, ok, type Result } from './result.util';

export type EntityId = string | number;

export interface BaseEntityProps<TId extends EntityId = EntityId> {
  id: TId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityParams<TId extends EntityId, T> {
  id: TId;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConstructEntityOptions<
  TId extends EntityId,
  EntityProps,
  TError extends DomainError,
  TInstance extends Entity<TId, EntityProps>,
> {
  params: CreateEntityParams<TId, EntityProps>;
  validate: (
    params: CreateEntityParams<TId, EntityProps>,
  ) => Result<CreateEntityParams<TId, EntityProps>, TError>;
  instantiate: (params: CreateEntityParams<TId, EntityProps>) => TInstance;
}

export abstract class Entity<TId extends EntityId, EntityProps> {
  protected readonly _id: TId;
  protected readonly props: EntityProps;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  protected constructor(params: CreateEntityParams<TId, EntityProps>) {
    const now = new Date();
    const createdAt = params.createdAt ?? now;
    const updatedAt = params.updatedAt ?? createdAt;

    this._id = params.id;
    this.props = params.props;
    this._createdAt = new Date(createdAt.getTime());
    this._updatedAt = new Date(updatedAt.getTime());
  }

  protected static construct<
    TId extends EntityId,
    EntityProps,
    TError extends DomainError,
    TInstance extends Entity<TId, EntityProps>,
  >(
    options: ConstructEntityOptions<TId, EntityProps, TError, TInstance>,
  ): Result<TInstance, DomainError | TError> {
    return Entity.validateBaseParams(options.params)
      .andThen(options.validate)
      .map(options.instantiate);
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  getProps(): EntityProps & BaseEntityProps<TId> {
    return Object.freeze({
      id: this._id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.props,
    });
  }

  private static validateBaseParams<TId extends EntityId, EntityProps>(
    params: CreateEntityParams<TId, EntityProps>,
  ): Result<CreateEntityParams<TId, EntityProps>, DomainError> {
    const maxProps = 50;
    const createdAt = params.createdAt;
    const updatedAt = params.updatedAt;

    if (Guard.isEmpty(params.props)) {
      return err({
        kind: 'invariant_violation',
        code: 'entity.props_empty',
        message: 'Entity props cannot be empty',
      });
    }

    if (typeof params.props !== 'object') {
      return err({
        kind: 'invariant_violation',
        code: 'entity.props_not_object',
        message: 'Entity props must be an object',
      });
    }

    if (
      Object.keys(params.props as Record<string, unknown>).length > maxProps
    ) {
      return err({
        kind: 'invariant_violation',
        code: 'entity.props_too_many',
        message: `Entity props cannot exceed ${maxProps} properties`,
      });
    }

    if (createdAt && updatedAt && updatedAt.getTime() < createdAt.getTime()) {
      return err({
        kind: 'invariant_violation',
        code: 'entity.updated_at_before_created_at',
        message: 'updatedAt cannot be earlier than createdAt',
      });
    }

    return ok(params);
  }
}
