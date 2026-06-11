import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@core/result';
import { INFRASTRUCTURE_ERROR_KIND } from '@layer-kernels/infrastructure';
import {
  type CorrectionPersistenceHealthCheck,
  type CorrectionPersistenceHealthCheckError,
} from '@contexts/corrections/infrastructure/persistence/ports';
import { StartupDependencyCheckService } from '../startup-dependency-check.service';

describe('StartupDependencyCheckService', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('persistence adapter health check가 첫 시도에 성공하면 통과한다', async () => {
    const healthCheck: CorrectionPersistenceHealthCheck = {
      adapter: 'memory',
      check: vi.fn(() => Promise.resolve(ok(undefined))),
    };

    await expect(
      new StartupDependencyCheckService(healthCheck).check(),
    ).resolves.toBeUndefined();
    expect(healthCheck.check).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Startup dependency check passed for memory on attempt 1/3',
    );
  });

  it('persistence adapter health check가 재시도에서 성공하면 통과한다', async () => {
    vi.useFakeTimers();

    const failure = createUnavailableError();
    const healthCheck: CorrectionPersistenceHealthCheck = {
      adapter: 'postgres-drizzle',
      check: vi
        .fn()
        .mockResolvedValueOnce(err(failure))
        .mockResolvedValueOnce(ok(undefined)),
    };

    const checking = new StartupDependencyCheckService(healthCheck).check();

    await vi.advanceTimersByTimeAsync(500);

    await expect(checking).resolves.toBeUndefined();
    expect(healthCheck.check).toHaveBeenCalledTimes(2);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Startup dependency check passed for postgres-drizzle on attempt 2/3',
    );
  });

  it('persistence adapter health check가 모두 실패하면 startup failure를 던진다', async () => {
    vi.useFakeTimers();

    const failure = createUnavailableError();
    const healthCheck: CorrectionPersistenceHealthCheck = {
      adapter: 'postgres-drizzle',
      check: vi.fn(() => Promise.resolve(err(failure))),
    };

    const checking = new StartupDependencyCheckService(healthCheck).check();

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(checking).rejects.toThrow(
      'Startup dependency check failed for postgres-drizzle after 3 attempts: correction_persistence_health_check.unavailable (unavailable) Postgres health check failed',
    );
    expect(healthCheck.check).toHaveBeenCalledTimes(3);
  });
});

function createUnavailableError(): CorrectionPersistenceHealthCheckError {
  return {
    kind: INFRASTRUCTURE_ERROR_KIND.UNAVAILABLE,
    code: 'correction_persistence_health_check.unavailable',
    source: {
      boundary: 'persistence',
      adapter: 'postgres_drizzle',
    },
    message: 'Postgres health check failed',
    details: {},
  };
}
