import { Injectable } from '@nestjs/common';
import { ok, type Result } from '@core/result';
import {
  type CorrectionPersistenceHealthCheck,
  type CorrectionPersistenceHealthCheckError,
} from '../ports';

@Injectable()
export class CorrectionMemoryPersistenceHealthCheck implements CorrectionPersistenceHealthCheck {
  readonly adapter = 'memory' as const;

  async check(): Promise<Result<void, CorrectionPersistenceHealthCheckError>> {
    return ok(undefined);
  }
}
