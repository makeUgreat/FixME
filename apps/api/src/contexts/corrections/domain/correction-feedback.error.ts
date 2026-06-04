import {
  DOMAIN_ERROR_KIND,
  type DomainErrorOf,
  type DomainInvariantViolationDetails,
} from '@layer-kernels/domain';

export type CorrectionFeedbackDomainError =
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction_feedback',
      'inferred_intent_empty',
      DomainInvariantViolationDetails
    >
  | DomainErrorOf<
      typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION,
      'correction_feedback',
      'explanation_empty',
      DomainInvariantViolationDetails
    >;
