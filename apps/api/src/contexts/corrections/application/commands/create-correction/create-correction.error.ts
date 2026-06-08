import { type CorrectionRepositorySaveError } from '../../ports';
import {
  type CorrectionDomainError,
  type CorrectionFeedbackDomainError,
  type CorrectionMetadataDomainError,
  type MistakeDomainError,
} from '../../../domain';

export type CreateCorrectionDomainError =
  | CorrectionDomainError
  | CorrectionFeedbackDomainError
  | CorrectionMetadataDomainError
  | MistakeDomainError;

export type CreateCorrectionError =
  | CreateCorrectionDomainError
  | CorrectionRepositorySaveError;
