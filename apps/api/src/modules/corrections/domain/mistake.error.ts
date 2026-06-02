import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type DomainInvariantViolationDetails,
} from '@libs/ddd';

export type MistakeDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'mistake',
      'types_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'mistake',
      'types_invalid',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'mistake',
      'explanation_empty',
      DomainInvariantViolationDetails
    >;
