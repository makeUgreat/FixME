export const DOMAIN_ERROR_KIND = {
  // A rule that must always hold would be broken.
  INVARIANT_VIOLATION: 'invariant_violation',
  // The requested operation conflicts with current domain state.
  STATE_CONFLICT: 'state_conflict',
  // The actor or context is not allowed to perform an otherwise valid operation.
  OPERATION_NOT_ALLOWED: 'operation_not_allowed',
} as const;

export type DomainErrorKind =
  (typeof DOMAIN_ERROR_KIND)[keyof typeof DOMAIN_ERROR_KIND];

export type DomainErrorCode<
  Owner extends string,
  Reason extends string,
> = `${Owner}.${Reason}`;

export interface DomainErrorBase<
  Kind extends DomainErrorKind = DomainErrorKind,
  Code extends string = string,
  Details = unknown,
> {
  readonly kind: Kind;
  readonly code: Code;
  readonly message: string;
  readonly details: Details;
}

export type DomainErrorOf<
  Kind extends DomainErrorKind,
  Owner extends string = string,
  Reason extends string = string,
  Details = unknown,
> = DomainErrorBase<Kind, DomainErrorCode<Owner, Reason>, Details>;

export interface DomainInvariantViolationDetails {
  fields: string[];
}

export type DomainError =
  | DomainErrorOf<typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION>
  | DomainErrorOf<typeof DOMAIN_ERROR_KIND.STATE_CONFLICT>
  | DomainErrorOf<typeof DOMAIN_ERROR_KIND.OPERATION_NOT_ALLOWED>;
