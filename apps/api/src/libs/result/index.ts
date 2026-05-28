export type {
  DomainError,
  DomainErrorKind,
  DomainInvariantViolationError,
  DomainOperationNotAllowedError,
  DomainStateConflictError,
} from './domain-error';
export { err, isErr, isOk, ok, type Err, type Ok, type Result } from './result';
