import { PERSISTENCE_ERROR_KIND, type PersistenceErrorOf } from '@libs/layer';
import { type CorrectionDomainError } from '../../../domain';
import { type CorrectionFeedbackDomainError } from '../../../domain/correction-feedback.error';
import { type CorrectionMetadataDomainError } from '../../../domain/correction-metadata.error';
import { type MistakeDomainError } from '../../../domain/mistake.error';

export interface CorrectionPersistenceInvalidDataDetails {
  readonly fields: string[];
}

export type CorrectionPersistenceError =
  | PersistenceErrorOf<
      typeof PERSISTENCE_ERROR_KIND.INVALID_DATA,
      'correction_persistence',
      'feedback_json_invalid',
      CorrectionPersistenceInvalidDataDetails
    >
  | PersistenceErrorOf<
      typeof PERSISTENCE_ERROR_KIND.INVALID_DATA,
      'correction_persistence',
      'mistakes_json_invalid',
      CorrectionPersistenceInvalidDataDetails
    >
  | PersistenceErrorOf<
      typeof PERSISTENCE_ERROR_KIND.INVALID_DATA,
      'correction_persistence',
      'provider_metadata_json_invalid',
      CorrectionPersistenceInvalidDataDetails
    >;

export type CorrectionPersistenceRestoreError =
  | CorrectionPersistenceError
  | CorrectionFeedbackDomainError
  | MistakeDomainError
  | CorrectionMetadataDomainError
  | CorrectionDomainError;
