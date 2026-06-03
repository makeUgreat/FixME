import { Injectable } from '@nestjs/common';
import { ok, type Result } from '@libs/result';
import {
  type Correction,
  type CorrectionRepository,
  type CorrectionRepositoryError,
} from '../../../domain';

@Injectable()
export class MemoryCorrectionRepository implements CorrectionRepository {
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
