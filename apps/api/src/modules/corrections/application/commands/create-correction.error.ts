import {
  APPLICATION_ERROR_KIND,
  type ApplicationErrorOf,
  type ValidationFailedDetails,
} from '@libs/layer';

export type CreateCorrectionValidationFailedError = ApplicationErrorOf<
  typeof APPLICATION_ERROR_KIND.VALIDATION_FAILED,
  'create_correction',
  'command_invalid',
  ValidationFailedDetails
>;

export type CreateCorrectionDependencyUnavailableError = ApplicationErrorOf<
  typeof APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE,
  'create_correction',
  'persistence_unavailable'
>;

export type CreateCorrectionError =
  | CreateCorrectionValidationFailedError
  | CreateCorrectionDependencyUnavailableError;
