import { type Result } from '@core/result';
import { type Correction, type CorrectionId } from '../../domain';

export const CORRECTION_REPOSITORY_ERROR_KIND = {
  UNAVAILABLE: 'unavailable',
  RESTORE_FAILED: 'restore_failed',
} as const;

export type CorrectionRepositoryErrorKind =
  (typeof CORRECTION_REPOSITORY_ERROR_KIND)[keyof typeof CORRECTION_REPOSITORY_ERROR_KIND];

type CorrectionRepositoryErrorCode<Reason extends string> =
  `correction_repository.${Reason}`;

type CorrectionRepositoryErrorOf<
  Kind extends CorrectionRepositoryErrorKind,
  Reason extends string,
> = {
  readonly kind: Kind;
  readonly code: CorrectionRepositoryErrorCode<Reason>;
  readonly message: string;
  readonly details: Record<string, never>;
};

export type CorrectionRepositorySaveUnavailableError =
  CorrectionRepositoryErrorOf<
    typeof CORRECTION_REPOSITORY_ERROR_KIND.UNAVAILABLE,
    'save_unavailable'
  >;

export type CorrectionRepositoryFindUnavailableError =
  CorrectionRepositoryErrorOf<
    typeof CORRECTION_REPOSITORY_ERROR_KIND.UNAVAILABLE,
    'find_unavailable'
  >;

export type CorrectionRepositoryRestoreFailedError =
  CorrectionRepositoryErrorOf<
    typeof CORRECTION_REPOSITORY_ERROR_KIND.RESTORE_FAILED,
    'restore_failed'
  >;

export type CorrectionRepositoryError =
  | CorrectionRepositorySaveUnavailableError
  | CorrectionRepositoryFindUnavailableError
  | CorrectionRepositoryRestoreFailedError;

export interface CorrectionRepository {
  save(
    correction: Correction,
  ): Promise<Result<Correction, CorrectionRepositoryError>>;
  findById(
    correctionId: CorrectionId,
  ): Promise<Result<Correction | null, CorrectionRepositoryError>>;
}
