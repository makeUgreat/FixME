export { AggregateRoot } from './aggregate-root.base';
export {
  Entity,
  type BaseEntityProps,
  type CreateEntityParams,
  type EntityId,
} from './entity.base';
export {
  ValueObject,
  type DomainPrimitive,
  type Primitives,
  type ValueObjectProps,
} from './value-object.base';
export type { Mapper } from './mapper.interface';
export type { Repository } from './repository.port';
export type { UseCase } from './use-case.base';
export { generateId } from './generate-id.util';
export type {
  DomainError,
  DomainErrorKind,
  DomainInvariantViolationError,
  DomainOperationNotAllowedError,
  DomainStateConflictError,
} from './domain-error';
export {
  all,
  andThen,
  ensure,
  err,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  type Err,
  type Ok,
  type Result,
} from './result';
