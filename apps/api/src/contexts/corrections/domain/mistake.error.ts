import { DOMAIN_ERROR_KIND, type DomainErrorOf } from '@layer-kernels/domain';

export type MistakeDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'mistake',
      'types_empty'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'mistake',
      'types_invalid'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'mistake',
      'explanation_empty'
    >;
