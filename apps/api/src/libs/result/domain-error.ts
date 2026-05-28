export type DomainError =
  | DomainInvariantViolationError
  | DomainStateConflictError
  | DomainOperationNotAllowedError;

export type DomainErrorKind =
  | 'invariant_violation'
  | 'state_conflict'
  | 'operation_not_allowed';

export type DomainInvariantViolationError = {
  kind: 'invariant_violation';
  code: string;
  message: string;
};

export type DomainStateConflictError = {
  kind: 'state_conflict';
  code: string;
  message: string;
};

export type DomainOperationNotAllowedError = {
  kind: 'operation_not_allowed';
  code: string;
  message: string;
};
