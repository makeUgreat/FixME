import { type Result } from '@core/result';
import { type CorrectionPersistenceAdapter } from '../../config/corrections.config';
import { type CorrectionPersistenceHealthCheckError } from './health-check.error';

export interface CorrectionPersistenceHealthCheck {
  readonly adapter: CorrectionPersistenceAdapter;
  check(): Promise<Result<void, CorrectionPersistenceHealthCheckError>>;
}
