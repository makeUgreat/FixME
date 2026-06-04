export type {
  EmptyInfrastructureErrorDetails,
  InfrastructureErrorBase,
  InfrastructureErrorCode,
  InfrastructureErrorKind,
  InfrastructureErrorOf,
  InfrastructureErrorSource,
} from './error.base';
export { INFRASTRUCTURE_ERROR_KIND } from './error.base';
export {
  PersistenceAggregateMapper,
  type SafePersistenceParser,
} from './persistence/aggregate-mapper.base';
export type {
  PersistenceError,
  PersistenceErrorBase,
  PersistenceErrorKind,
  PersistenceErrorOf,
  PersistenceErrorSource,
} from './persistence/error.base';
export { PERSISTENCE_ERROR_KIND } from './persistence/error.base';
