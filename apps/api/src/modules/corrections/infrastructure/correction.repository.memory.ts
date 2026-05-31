import { Injectable } from '@nestjs/common';
import { type Correction, type CorrectionRepository } from '../domain';

@Injectable()
export class MemoryCorrectionRepository implements CorrectionRepository {
  private readonly corrections = new Map<string, Correction>();

  save(correction: Correction): Promise<Correction> {
    this.corrections.set(correction.id, correction);

    return Promise.resolve(correction);
  }

  findById(correctionId: string): Promise<Correction | null> {
    return Promise.resolve(this.corrections.get(correctionId) ?? null);
  }
}
