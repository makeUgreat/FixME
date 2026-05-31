export { AggregateRoot } from './aggregate-root.base';
export { err, ok, type Result } from './result.util';
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
  EntityDomainError,
} from './domain.error';
