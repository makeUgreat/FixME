import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type DrizzleDatabase } from '@libs/database';
import { PERSISTENCE_ERROR_KIND } from '@libs/layer';
import { err, ok, type Result } from '@libs/result';
import {
  type Correction,
  type CorrectionRepository,
  type CorrectionRepositoryError,
  type CorrectionRepositoryFindUnavailableError,
  type CorrectionRepositoryRestoreFailedError,
  type CorrectionRepositorySaveUnavailableError,
} from '../../../domain';
import { CorrectionPersistenceMapper } from './correction-persistence.mapper';
import { corrections, type CorrectionRow } from './correction.table';

@Injectable()
export class PostgresDrizzleCorrectionRepository implements CorrectionRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
    private readonly mapper: CorrectionPersistenceMapper,
  ) {}

  async save(
    correction: Correction,
  ): Promise<Result<Correction, CorrectionRepositoryError>> {
    try {
      const row = this.mapper.toPersistence(correction);

      await this.database
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
  ): Promise<Result<Correction | null, CorrectionRepositoryError>> {
    let row: CorrectionRow | undefined;

    try {
      [row] = await this.database
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
      kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
      code: 'correction_repository.save_unavailable',
      source: {
        boundary: 'persistence',
        adapter: 'postgres_drizzle',
      },
      message: 'Correction could not be saved',
      details: {},
    };
  }

  private createFindUnavailableError(): CorrectionRepositoryFindUnavailableError {
    return {
      kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
      code: 'correction_repository.find_unavailable',
      source: {
        boundary: 'persistence',
        adapter: 'postgres_drizzle',
      },
      message: 'Correction could not be found',
      details: {},
    };
  }

  private createRestoreFailedError(): CorrectionRepositoryRestoreFailedError {
    return {
      kind: PERSISTENCE_ERROR_KIND.RESTORE_FAILED,
      code: 'correction_repository.restore_failed',
      source: {
        boundary: 'persistence',
        adapter: 'postgres_drizzle',
      },
      message: 'Correction could not be restored',
      details: {},
    };
  }
}
