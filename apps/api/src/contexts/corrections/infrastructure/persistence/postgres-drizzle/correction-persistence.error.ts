import {
  INFRASTRUCTURE_ERROR_KIND,
  type InfrastructureErrorOf,
} from '@layer-kernels/infrastructure';
import { type CorrectionDomainError } from '../../../domain';
import { type CorrectionFeedbackDomainError } from '../../../domain/correction-feedback.error';
import { type CorrectionMetadataDomainError } from '../../../domain/correction-metadata.error';
import { type MistakeDomainError } from '../../../domain/mistake.error';

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
