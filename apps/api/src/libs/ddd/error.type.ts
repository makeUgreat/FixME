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
  details: unknown;
};

export type DomainStateConflictError = {
  kind: 'state_conflict';
  code: string;
  message: string;
  details: unknown;
};

export type DomainOperationNotAllowedError = {
  kind: 'operation_not_allowed';
  code: string;
  message: string;
  details: unknown;
};

export type EntityDomainError =
  | {
      kind: 'invariant_violation';
      code: 'entity.props_empty';
      message: string;
      details: unknown;
    }
  | {
      kind: 'invariant_violation';
      code: 'entity.props_not_object';
      message: string;
      details: unknown;
    }
  | {
      kind: 'invariant_violation';
      code: 'entity.props_too_many';
      message: string;
      details: unknown;
    }
  | {
      kind: 'invariant_violation';
      code: 'entity.updated_at_before_created_at';
      message: string;
      details: unknown;
    };
