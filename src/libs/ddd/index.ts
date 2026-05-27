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
} from './value-object.base';
export type { Mapper } from './mapper.interface';
export type { Repository } from './repository.port';
export type { UseCase } from './usecase.base';
export { generateId } from './generate-id.util';
