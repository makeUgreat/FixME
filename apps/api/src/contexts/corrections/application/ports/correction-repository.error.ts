import {
  APPLICATION_ERROR_KIND,
  type ApplicationErrorOf,
} from '@layer-kernels/application';

type EmptyCorrectionRepositoryErrorDetails = Record<string, never>;

export type CorrectionRepositorySaveUnavailableError = ApplicationErrorOf<
  typeof APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE,
  'correction_repository',
  'save_unavailable',
  EmptyCorrectionRepositoryErrorDetails
>;

export type CorrectionRepositoryFindUnavailableError = ApplicationErrorOf<
  typeof APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE,
  'correction_repository',
  'find_unavailable',
  EmptyCorrectionRepositoryErrorDetails
>;

export type CorrectionRepositoryRestoreFailedError = ApplicationErrorOf<
  typeof APPLICATION_ERROR_KIND.UNEXPECTED,
  'correction_repository',
  'restore_failed',
  EmptyCorrectionRepositoryErrorDetails
>;

export type CorrectionRepositorySaveError =
  CorrectionRepositorySaveUnavailableError;

export type CorrectionRepositoryFindError =
  | CorrectionRepositoryFindUnavailableError
  | CorrectionRepositoryRestoreFailedError;

export type CorrectionRepositoryError =
  | CorrectionRepositorySaveError
  | CorrectionRepositoryFindError;
