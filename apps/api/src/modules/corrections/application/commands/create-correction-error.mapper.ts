import { type ApplicationErrorMapper } from '@libs/layer';
import {
  type CorrectionDomainError,
  type CorrectionFeedbackDomainError,
  type CorrectionMetadataDomainError,
  type MistakeDomainError,
} from '../../domain';
import { type CreateCorrectionValidationFailedError } from './create-correction.error';

type CreateCorrectionDomainError =
  | CorrectionDomainError
  | CorrectionFeedbackDomainError
  | CorrectionMetadataDomainError
  | MistakeDomainError;

export class CreateCorrectionErrorMapper implements ApplicationErrorMapper<
  CreateCorrectionDomainError,
  CreateCorrectionValidationFailedError
> {
  toApplicationError(
    error: CreateCorrectionDomainError,
  ): CreateCorrectionValidationFailedError {
    return {
      kind: 'validation_failed',
      code: 'create_correction.validation_failed',
      message: error.message,
      details: {
        domainCode: error.code,
        domainDetails: error.details,
      },
    };
  }
}
