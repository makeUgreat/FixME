import { DOMAIN_ERROR_KIND } from '@layer-kernels/domain';
import {
  APPLICATION_ERROR_KIND,
  type ApplicationMapper,
  DomainErrorToApplicationErrorMapper,
  type DomainErrorToApplicationErrorHandlers,
  type ValidationFailedDetails,
} from '@layer-kernels/application';
import { type CorrectionRepositoryError } from '../../ports';
import {
  type CorrectionDomainError,
  type CorrectionFeedbackDomainError,
  type CorrectionMetadataDomainError,
  type MistakeDomainError,
} from '../../../domain';
import {
  type CreateCorrectionDependencyUnavailableError,
  type CreateCorrectionError,
  type CreateCorrectionValidationFailedError,
} from './create-correction.error';

type CreateCorrectionDomainError =
  | CorrectionDomainError
  | CorrectionFeedbackDomainError
  | CorrectionMetadataDomainError
  | MistakeDomainError;

type CreateCorrectionInvariantViolationError = Extract<
  CreateCorrectionDomainError,
  { kind: typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION }
>;

export class CreateCorrectionDomainErrorToApplicationErrorMapper extends DomainErrorToApplicationErrorMapper<
  CreateCorrectionDomainError,
  CreateCorrectionError
> {
  protected readonly handlers: DomainErrorToApplicationErrorHandlers<
    CreateCorrectionDomainError,
    CreateCorrectionError
  > = {
    invariant_violation: (error) => this.toValidationFailedError(error),
  };

  private toValidationFailedError(
    error: CreateCorrectionInvariantViolationError,
  ): CreateCorrectionValidationFailedError {
    return {
      kind: APPLICATION_ERROR_KIND.VALIDATION_FAILED,
      code: 'create_correction.command_invalid',
      message: 'Correction request is invalid',
      details: this.toDetails(error),
    };
  }

  private toDetails(
    error: CreateCorrectionInvariantViolationError,
  ): ValidationFailedDetails {
    return {
      fields: error.details.fields.map((field) => ({
        path: this.toFieldPath(error, field),
        messages: [error.message],
      })),
    };
  }

  private toFieldPath(
    error: CreateCorrectionInvariantViolationError,
    field: string,
  ): string {
    switch (error.code) {
      case 'correction_feedback.inferred_intent_empty':
      case 'correction_feedback.explanation_empty':
        return `feedback.${field}`;
      case 'mistake.types_empty':
      case 'mistake.types_invalid':
      case 'mistake.explanation_empty':
        return `mistakes.${field}`;
      case 'correction_metadata.correction_id_empty':
      case 'correction_metadata.model_empty':
      case 'correction_metadata.provider_metadata_invalid':
        return `metadata.${field}`;
      default:
        return field;
    }
  }
}

export class CreateCorrectionRepositoryErrorToApplicationErrorMapper implements ApplicationMapper<
  CorrectionRepositoryError,
  CreateCorrectionError
> {
  toApplication(
    error: CorrectionRepositoryError,
  ): CreateCorrectionDependencyUnavailableError {
    switch (error.code) {
      case 'correction_repository.save_unavailable':
      case 'correction_repository.find_unavailable':
      case 'correction_repository.restore_failed':
        return {
          kind: APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE,
          code: 'create_correction.persistence_unavailable',
          message: 'Correction could not be saved',
          details: {},
        };
    }
  }
}
