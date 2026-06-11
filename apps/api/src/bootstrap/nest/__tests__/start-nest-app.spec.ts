import { Logger } from '@nestjs/common';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listenAfterStartupDependencyCheck } from '../start-nest-app';
import { StartupDependencyCheckService } from '../startup-check/startup-dependency-check.service';

describe('listenAfterStartupDependencyCheck', () => {
  beforeEach(() => {
    vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('startup health check가 성공하면 listen 한다', async () => {
    const startupHealthCheck = {
      check: vi.fn(() => Promise.resolve()),
    };
    const app = createAppMock(startupHealthCheck);

    await listenAfterStartupDependencyCheck(app, 3000);

    expect(app.get).toHaveBeenCalledWith(StartupDependencyCheckService, {
      strict: false,
    });
    expect(startupHealthCheck.check).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith(3000);
    expect(app.close).not.toHaveBeenCalled();
  });

  it('startup health check가 실패하면 listen 하지 않고 app을 닫는다', async () => {
    const failure = new Error('startup health check failed');
    const startupHealthCheck = {
      check: vi.fn(() => Promise.reject(failure)),
    };
    const app = createAppMock(startupHealthCheck);

    await expect(
      listenAfterStartupDependencyCheck(app, 3000),
    ).rejects.toThrow(failure);

    expect(app.listen).not.toHaveBeenCalled();
    expect(app.close).toHaveBeenCalledTimes(1);
  });
});

function createAppMock(startupHealthCheck: {
  check(): Promise<void>;
}): NestFastifyApplication {
  return {
    get: vi.fn(() => startupHealthCheck),
    listen: vi.fn(() => Promise.resolve('http://localhost:3000')),
    close: vi.fn(() => Promise.resolve()),
  } as unknown as NestFastifyApplication;
}
