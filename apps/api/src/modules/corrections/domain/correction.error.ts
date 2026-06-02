import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type DomainInvariantViolationDetails,
  type EntityDomainError,
} from '@libs/ddd';

export type CorrectionDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'original_text_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'corrected_text_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'feedback_invalid',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'mistakes_invalid',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'metadata_invalid',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'metadata_correction_id_mismatch',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'mistakes_empty_for_corrected_text',
      DomainInvariantViolationDetails
    >
  | EntityDomainError;
