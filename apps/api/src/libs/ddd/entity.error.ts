import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type DomainInvariantViolationDetails,
} from './error.base';

export type EntityDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'props_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'props_not_object',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'props_too_many',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'updated_at_before_created_at',
      DomainInvariantViolationDetails
    >;
