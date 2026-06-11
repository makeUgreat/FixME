import { type Pool } from 'pg';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INFRASTRUCTURE_ERROR_KIND } from '@layer-kernels/infrastructure';
import { CorrectionPostgresDrizzlePersistenceHealthCheck } from '../health-check.service';

describe('CorrectionPostgresDrizzlePersistenceHealthCheck', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Postgres connection에 SELECT 1을 실행한다', async () => {
    const pool = {
      query: vi.fn(() => Promise.resolve(undefined)),
    } as unknown as Pool;
    const healthCheck = new CorrectionPostgresDrizzlePersistenceHealthCheck(
      pool,
    );

    const result = await healthCheck.check();

    expect(result.isOk()).toBe(true);
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('Postgres query가 실패하면 controlled unavailable infrastructure error를 반환한다', async () => {
    const pool = {
      query: vi.fn(() => Promise.reject(new Error('password leaked'))),
    } as unknown as Pool;
    const healthCheck = new CorrectionPostgresDrizzlePersistenceHealthCheck(
      pool,
    );

    const result = await healthCheck.check();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toEqual({
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
  });

  it('Postgres query가 timeout 안에 끝나지 않으면 controlled timeout infrastructure error를 반환한다', async () => {
    vi.useFakeTimers();

    const pool = {
      query: vi.fn(() => new Promise(() => undefined)),
    } as unknown as Pool;
    const healthCheck = new CorrectionPostgresDrizzlePersistenceHealthCheck(
      pool,
    );
    const check = healthCheck.check();

    await vi.advanceTimersByTimeAsync(1_000);

    const result = await check;

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toEqual({
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
  });
});
