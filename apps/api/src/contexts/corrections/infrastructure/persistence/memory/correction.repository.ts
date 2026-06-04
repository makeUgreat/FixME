import { Injectable } from '@nestjs/common';
import { ok, type Result } from '@core/result';
import {
  type CorrectionRepository,
  type CorrectionRepositoryError,
} from '../../../application/ports';
import {
  type Correction,
} from '../../../domain';

@Injectable()
export class CorrectionMemoryRepository implements CorrectionRepository {
  private readonly corrections = new Map<string, Correction>();

  save(
    correction: Correction,
  ): Promise<Result<Correction, CorrectionRepositoryError>> {
    this.corrections.set(correction.id, correction);

    return Promise.resolve(ok(correction));
  }

  findById(
    correctionId: string,
  ): Promise<Result<Correction | null, CorrectionRepositoryError>> {
    return Promise.resolve(ok(this.corrections.get(correctionId) ?? null));
  }
}
