import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type EntityDomainError,
} from '@layer-kernels/domain';

export type CorrectionDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'original_text_empty'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'corrected_text_empty'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'feedback_invalid'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'mistakes_invalid'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'metadata_invalid'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'metadata_correction_id_mismatch'
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction',
      'mistakes_empty_for_corrected_text'
    >
  | EntityDomainError;
