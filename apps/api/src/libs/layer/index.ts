export type {
  ApplicationErrorCode,
  ApplicationErrorBase,
  ApplicationErrorKind,
  ApplicationErrorOf,
} from './application/error.base';
export { APPLICATION_ERROR_KIND } from './application/error.base';
export type {
  EmptyInfrastructureErrorDetails,
  InfrastructureErrorBase,
  InfrastructureErrorCode,
  InfrastructureErrorKind,
  InfrastructureErrorOf,
  InfrastructureErrorSource,
} from './infrastructure/error.base';
export { INFRASTRUCTURE_ERROR_KIND } from './infrastructure/error.base';
export type {
  PersistenceError,
  PersistenceErrorBase,
  PersistenceErrorKind,
  PersistenceErrorOf,
  PersistenceErrorSource,
} from './infrastructure/persistence/error.base';
export { PERSISTENCE_ERROR_KIND } from './infrastructure/persistence/error.base';
export type {
  PresentationHttpError,
  ValidationFailedDetails,
  ValidationFailedFieldDetail,
} from './presentation/http/error.base';
export type { ApplicationMapper, PresentationMapper } from './mapper.type';
export {
  PersistenceAggregateMapper,
  type SafePersistenceParser,
} from './infrastructure/persistence/aggregate-mapper.base';
export type { DomainErrorToApplicationErrorHandlers } from './application/error-mapper.base';
export { DomainErrorToApplicationErrorMapper } from './application/error-mapper.base';
export { HttpExceptionFilter } from './presentation/http/exception.filter';
export { HttpValidationErrorMapper } from './presentation/http/validation-error.mapper';
export { PresentationHttpException } from './presentation/http/http.exception';
export { PresentationHttpErrorMapper } from './presentation/http/error-mapper.base';
