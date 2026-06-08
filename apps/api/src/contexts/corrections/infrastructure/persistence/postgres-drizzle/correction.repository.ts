import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { err, ok, type Result } from '@core/result';
import { APPLICATION_ERROR_KIND } from '@layer-kernels/application';
import {
  type CorrectionRepository,
  type CorrectionRepositoryFindError,
  type CorrectionRepositoryFindUnavailableError,
  type CorrectionRepositoryRestoreFailedError,
  type CorrectionRepositorySaveError,
  type CorrectionRepositorySaveUnavailableError,
} from '../../../application/ports';
import { type Correction } from '../../../domain';
import { CorrectionPersistenceMapper } from './correction-persistence.mapper';
import { corrections, type CorrectionRow } from './correction.table';
import { POSTGRES_DRIZZLE } from './postgres.tokens';
import { type PostgresDrizzle } from './postgres.type';

@Injectable()
export class CorrectionPostgresDrizzleRepository implements CorrectionRepository {
  constructor(
    @Inject(POSTGRES_DRIZZLE)
    private readonly postgresDrizzle: PostgresDrizzle,
    private readonly mapper: CorrectionPersistenceMapper,
  ) {}

  async save(
    correction: Correction,
  ): Promise<Result<Correction, CorrectionRepositorySaveError>> {
    try {
      const row = this.mapper.toPersistence(correction);

      await this.postgresDrizzle
        .insert(corrections)
        .values(row)
        .onConflictDoUpdate({
          target: corrections.id,
          set: {
            originalText: row.originalText,
            correctedText: row.correctedText,
            feedback: row.feedback,
            mistakes: row.mistakes,
            metadataId: row.metadataId,
            model: row.model,
            providerMetadata: row.providerMetadata,
            updatedAt: row.updatedAt,
            metadataUpdatedAt: row.metadataUpdatedAt,
          },
        });

      return ok(correction);
    } catch {
      return err(this.createSaveUnavailableError());
    }
  }

  async findById(
    correctionId: string,
  ): Promise<Result<Correction | null, CorrectionRepositoryFindError>> {
    let row: CorrectionRow | undefined;

    try {
      [row] = await this.postgresDrizzle
        .select()
        .from(corrections)
        .where(eq(corrections.id, correctionId))
        .limit(1);
    } catch {
      return err(this.createFindUnavailableError());
    }

    if (!row) {
      return ok(null);
    }

    try {
      return this.mapper.toAggregate(row).match(
        (correction) => ok(correction),
        () => err(this.createRestoreFailedError()),
      );
    } catch {
      return err(this.createRestoreFailedError());
    }
  }

  private createSaveUnavailableError(): CorrectionRepositorySaveUnavailableError {
    return {
      kind: APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE,
      code: 'correction_repository.save_unavailable',
      message: 'Correction could not be saved',
      details: {},
    };
  }

  private createFindUnavailableError(): CorrectionRepositoryFindUnavailableError {
    return {
      kind: APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE,
      code: 'correction_repository.find_unavailable',
      message: 'Correction could not be found',
      details: {},
    };
  }

  private createRestoreFailedError(): CorrectionRepositoryRestoreFailedError {
    return {
      kind: APPLICATION_ERROR_KIND.UNEXPECTED,
      code: 'correction_repository.restore_failed',
      message: 'Correction could not be restored',
      details: {},
    };
  }
}
