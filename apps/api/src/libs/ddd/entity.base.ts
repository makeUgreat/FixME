import { Guard } from '../guard';
import { all, andThen, ensure, map, type Result } from './result';
import { type DomainError } from './domain-error';

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
  protected readonly entityId: EntityId;
  protected readonly props: EntityProps;
  private readonly createdAtValue: Date;
  private readonly updatedAtValue: Date;

  protected constructor(params: CreateEntityParams<EntityProps>) {
    const now = new Date();
    const createdAt = params.createdAt ?? now;
    const updatedAt = params.updatedAt ?? createdAt;

    this.entityId = params.id;
    this.props = params.props;
    this.createdAtValue = new Date(createdAt.getTime());
    this.updatedAtValue = new Date(updatedAt.getTime());
  }

  protected static construct<
    EntityProps,
    TError extends DomainError,
    TInstance extends Entity<EntityProps>,
  >(
    params: CreateEntityParams<EntityProps>,
    validate: (
      params: CreateEntityParams<EntityProps>,
    ) => Result<CreateEntityParams<EntityProps>, TError>,
    instantiate: (params: CreateEntityParams<EntityProps>) => TInstance,
  ): Result<TInstance, DomainError | TError> {
    return map(
      andThen(Entity.validateBaseParams(params), validate),
      instantiate,
    );
  }

  get id(): EntityId {
    return this.entityId;
  }

  get createdAt(): Date {
    return new Date(this.createdAtValue.getTime());
  }

  get updatedAt(): Date {
    return new Date(this.updatedAtValue.getTime());
  }

  getProps(): EntityProps & BaseEntityProps {
    return Object.freeze({
      id: this.entityId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.props,
    });
  }

  private static validateBaseParams<EntityProps>(
    params: CreateEntityParams<EntityProps>,
  ): Result<CreateEntityParams<EntityProps>, DomainError> {
    const maxProps = 50;
    const createdAt = params.createdAt;
    const updatedAt = params.updatedAt;

    return map(
      all([
        () =>
          ensure(!Guard.isEmpty(params.props), {
            kind: 'invariant_violation',
            code: 'entity.props_empty',
            message: 'Entity props cannot be empty',
          }),
        () =>
          ensure(typeof params.props === 'object', {
            kind: 'invariant_violation',
            code: 'entity.props_not_object',
            message: 'Entity props must be an object',
          }),
        () =>
          ensure(
            Object.keys(params.props as Record<string, unknown>).length <=
              maxProps,
            {
              kind: 'invariant_violation',
              code: 'entity.props_too_many',
              message: `Entity props cannot exceed ${maxProps} properties`,
            },
          ),
        () =>
          ensure(
            !createdAt ||
              !updatedAt ||
              updatedAt.getTime() >= createdAt.getTime(),
            {
              kind: 'invariant_violation',
              code: 'entity.updated_at_before_created_at',
              message: 'updatedAt cannot be earlier than createdAt',
            },
          ),
      ]),
      () => params,
    );
  }
}
