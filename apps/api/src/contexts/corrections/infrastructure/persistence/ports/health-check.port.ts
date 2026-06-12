import { type Result } from '@core/result';
import { type CorrectionPersistenceHealthCheckError } from './health-check.error';

export interface CorrectionPersistenceHealthCheck {
  readonly adapter: 'memory' | 'postgres-drizzle';
  check(): Promise<Result<void, CorrectionPersistenceHealthCheckError>>;
}
