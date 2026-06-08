export { AggregateRoot } from './aggregate-root.base';
export {
  Entity,
  type BaseEntityProps,
  type ConstructEntityOptions,
  type CreateEntityParams,
  type EntityId,
} from './entity.base';
export {
  ValueObject,
  type ConstructValueObjectOptions,
  type DomainPrimitive,
  type Primitives,
  type ValueObjectProps,
} from './value-object.base';
export type {
  DomainError,
  DomainErrorBase,
  DomainErrorCode,
  DomainErrorDetailsFor,
  DomainErrorKind,
  DomainErrorOf,
  DomainValidationDetails,
} from './error.base';
export { DOMAIN_ERROR_KIND } from './error.base';
export type { EntityDomainError } from './entity.error';
