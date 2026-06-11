import { Logger } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestNestApp } from '../support/create-test-nest-app';

describe('Startup dependency check (integration)', () => {
  const originalCorrectionPersistence = process.env.CORRECTION_PERSISTENCE;
  const originalCorrectionsDatabaseUrl = process.env.CORRECTIONS_DATABASE_URL;

  let app: NestFastifyApplication | undefined;

  beforeEach(() => {
    vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await app?.close();
    app = undefined;
    vi.restoreAllMocks();

    if (originalCorrectionPersistence === undefined) {
      delete process.env.CORRECTION_PERSISTENCE;
    } else {
      process.env.CORRECTION_PERSISTENCE = originalCorrectionPersistence;
    }

    if (originalCorrectionsDatabaseUrl === undefined) {
      delete process.env.CORRECTIONS_DATABASE_URL;
    } else {
      process.env.CORRECTIONS_DATABASE_URL = originalCorrectionsDatabaseUrl;
    }
  });

  it('선택된 Postgres adapter 연결이 실패하면 listen 전에 startup을 실패시킨다', async () => {
    process.env.CORRECTION_PERSISTENCE = 'postgres-drizzle';
    process.env.CORRECTIONS_DATABASE_URL =
      'postgres://fixme:fixme@127.0.0.1:1/fixme_test';
    vi.resetModules();
    const [{ AppModule }, { StartupDependencyCheckService }] =
      await Promise.all([
        import('../../src/bootstrap/nest/app.module.js'),
        import(
          '../../src/bootstrap/nest/startup-check/startup-dependency-check.service.js'
        ),
      ]);
    app = await createTestNestApp(AppModule);
    const startupDependencyCheck = app.get(StartupDependencyCheckService, {
      strict: false,
    });

    await expect(startupDependencyCheck.check()).rejects.toThrow(
      'Startup dependency check failed for postgres-drizzle after 3 attempts',
    );
  });
});
