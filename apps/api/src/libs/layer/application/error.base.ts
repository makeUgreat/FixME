export const APPLICATION_ERROR_KIND = {
  // The command, query, or translated domain result failed validation.
  VALIDATION_FAILED: 'validation_failed',
  // A required repository, provider, service, or external dependency is unavailable.
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  // A required application resource was not found.
  NOT_FOUND: 'not_found',
  // The request conflicts with current application state or workflow state.
  STATE_CONFLICT: 'state_conflict',
  // The authenticated actor is not allowed to perform the use case.
  PERMISSION_DENIED: 'permission_denied',
  // The use case requires an authenticated actor, but none is available.
  AUTHENTICATION_REQUIRED: 'authentication_required',
  // The operation is not allowed by application workflow or policy.
  OPERATION_NOT_ALLOWED: 'operation_not_allowed',
  // The use case cannot proceed because a rate limit was reached.
  RATE_LIMITED: 'rate_limited',
  // The failure cannot be meaningfully classified at the application boundary.
  UNEXPECTED: 'unexpected',
} as const;

export type ApplicationErrorKind =
  (typeof APPLICATION_ERROR_KIND)[keyof typeof APPLICATION_ERROR_KIND];

export type ApplicationErrorCode<
  Owner extends string,
  Reason extends string,
> = `${Owner}.${Reason}`;

export interface ApplicationErrorBase<
  Kind extends ApplicationErrorKind = ApplicationErrorKind,
  Code extends string = string,
  Details = unknown,
> {
  readonly kind: Kind;
  readonly code: Code;
  readonly message: string;
  readonly details: Details;
}

export type ApplicationErrorOf<
  Kind extends ApplicationErrorKind,
  Owner extends string,
  Reason extends string,
  Details = unknown,
> = ApplicationErrorBase<Kind, ApplicationErrorCode<Owner, Reason>, Details>;
