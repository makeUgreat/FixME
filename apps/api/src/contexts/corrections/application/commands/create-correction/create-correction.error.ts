import { type CorrectionRepositorySaveError } from '@contexts/corrections/application/ports';
import {
  type CorrectionDomainError,
  type CorrectionFeedbackDomainError,
  type CorrectionMetadataDomainError,
  type MistakeDomainError,
} from '@contexts/corrections/domain';

export type CreateCorrectionDomainError =
  | CorrectionDomainError
  | CorrectionFeedbackDomainError
  | CorrectionMetadataDomainError
  | MistakeDomainError;

export type CreateCorrectionError =
  | CreateCorrectionDomainError
  | CorrectionRepositorySaveError;
