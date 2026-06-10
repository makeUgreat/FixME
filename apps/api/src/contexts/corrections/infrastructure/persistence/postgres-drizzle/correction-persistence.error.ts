import {
  INFRASTRUCTURE_ERROR_KIND,
  type InfrastructureErrorOf,
} from '@layer-kernels/infrastructure';
import {
  type CorrectionDomainError,
  type CorrectionFeedbackDomainError,
  type CorrectionMetadataDomainError,
  type MistakeDomainError,
} from '@contexts/corrections/domain';

type CorrectionPersistenceErrorSource = {
  readonly boundary: 'persistence';
  readonly adapter: 'postgres_drizzle';
};

export type CorrectionPersistenceError =
  | InfrastructureErrorOf<
      typeof INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
      'correction_persistence',
      'feedback_json_invalid',
      { readonly fields: string[] },
      CorrectionPersistenceErrorSource
    >
  | InfrastructureErrorOf<
      typeof INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
      'correction_persistence',
      'mistakes_json_invalid',
      { readonly fields: string[] },
      CorrectionPersistenceErrorSource
    >
  | InfrastructureErrorOf<
      typeof INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
      'correction_persistence',
      'provider_metadata_json_invalid',
      { readonly fields: string[] },
      CorrectionPersistenceErrorSource
    >;

export type CorrectionPersistenceRestoreError =
  | CorrectionPersistenceError
  | CorrectionFeedbackDomainError
  | MistakeDomainError
  | CorrectionMetadataDomainError
  | CorrectionDomainError;
