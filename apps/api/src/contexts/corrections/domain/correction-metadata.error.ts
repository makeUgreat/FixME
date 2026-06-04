import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type DomainInvariantViolationDetails,
  type EntityDomainError,
} from '@layer-kernels/domain';

export type CorrectionMetadataDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction_metadata',
      'correction_id_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction_metadata',
      'model_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction_metadata',
      'provider_metadata_invalid',
      DomainInvariantViolationDetails
    >
  | EntityDomainError;
