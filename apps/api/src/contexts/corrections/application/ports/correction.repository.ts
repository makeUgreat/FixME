import { type Result } from '@core/result';
import { type Correction, type CorrectionId } from '@contexts/corrections/domain';
import {
  type CorrectionRepositoryFindError,
  type CorrectionRepositorySaveError,
} from './correction-repository.error';

export interface CorrectionRepository {
  save(
    correction: Correction,
  ): Promise<Result<Correction, CorrectionRepositorySaveError>>;
  findById(
    correctionId: CorrectionId,
  ): Promise<Result<Correction | null, CorrectionRepositoryFindError>>;
}
