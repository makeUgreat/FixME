import {
  type EmptyInfrastructureErrorDetails,
  PERSISTENCE_ERROR_KIND,
  type PersistenceErrorOf,
} from '@libs/layer';
import { type Result } from '@libs/result';
import { type Correction, type CorrectionId } from './correction.aggregate';

export type CorrectionRepositorySaveUnavailableError = PersistenceErrorOf<
  typeof PERSISTENCE_ERROR_KIND.UNAVAILABLE,
  'correction_repository',
  'save_unavailable',
  EmptyInfrastructureErrorDetails
>;

export type CorrectionRepositoryFindUnavailableError = PersistenceErrorOf<
  typeof PERSISTENCE_ERROR_KIND.UNAVAILABLE,
  'correction_repository',
  'find_unavailable',
  EmptyInfrastructureErrorDetails
>;

export type CorrectionRepositoryRestoreFailedError = PersistenceErrorOf<
  typeof PERSISTENCE_ERROR_KIND.RESTORE_FAILED,
  'correction_repository',
  'restore_failed',
  EmptyInfrastructureErrorDetails
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
