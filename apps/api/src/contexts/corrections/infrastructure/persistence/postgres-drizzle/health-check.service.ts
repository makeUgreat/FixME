import { setTimeout as sleep } from 'node:timers/promises';
import { Inject, Injectable } from '@nestjs/common';
import { type Pool } from 'pg';
import { err, ok, type Result } from '@core/result';
import { INFRASTRUCTURE_ERROR_KIND } from '@layer-kernels/infrastructure';
import {
  type CorrectionPersistenceHealthCheck,
  type CorrectionPersistenceHealthCheckError,
} from '../ports';
import { POSTGRES_POOL } from './postgres.tokens';

const POSTGRES_HEALTH_QUERY_TIMEOUT_MS = 1_000;

@Injectable()
export class CorrectionPostgresDrizzlePersistenceHealthCheck
  implements CorrectionPersistenceHealthCheck
{
  private static readonly healthCheckTimeout = Symbol(
    'postgres_health_check_timeout',
  );

  readonly adapter = 'postgres-drizzle' as const;

  constructor(@Inject(POSTGRES_POOL) private readonly pool: Pool) {}

  async check(): Promise<Result<void, CorrectionPersistenceHealthCheckError>> {
    try {
      await this.checkPostgresConnection();

      return ok(undefined);
    } catch (error) {
      if (
        error ===
        CorrectionPostgresDrizzlePersistenceHealthCheck.healthCheckTimeout
      ) {
        return err({
          kind: INFRASTRUCTURE_ERROR_KIND.TIMEOUT,
          code: 'correction_persistence_health_check.timeout',
          source: {
            boundary: 'persistence',
            adapter: 'postgres_drizzle',
          },
          message: 'Postgres health check timed out',
          details: {},
        });
      }

      return err({
        kind: INFRASTRUCTURE_ERROR_KIND.UNAVAILABLE,
        code: 'correction_persistence_health_check.unavailable',
        source: {
          boundary: 'persistence',
          adapter: 'postgres_drizzle',
        },
        message: 'Postgres health check failed',
        details: {},
      });
    }
  }

  private async checkPostgresConnection(): Promise<void> {
    const query = this.pool.query('SELECT 1');
    query.catch(() => undefined);

    await Promise.race([
      query.then(() => undefined),
      sleep(POSTGRES_HEALTH_QUERY_TIMEOUT_MS).then(() => {
        throw CorrectionPostgresDrizzlePersistenceHealthCheck.healthCheckTimeout;
      }),
    ]);
  }
}
