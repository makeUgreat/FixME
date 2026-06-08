import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
} from './error.base';

export type EntityDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'props_empty'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'props_not_object'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'props_too_many'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'entity',
      'updated_at_before_created_at'
    >;
