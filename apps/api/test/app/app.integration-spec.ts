import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { createTestNestApp } from '../support/create-test-nest-app';

describe('AppModule (integration)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestNestApp(AppModule);
  });

  afterEach(async () => {
    await app.close();
  });

  it('앱 모듈이 정상적으로 부트스트랩된다', () => {
    expect(app).toBeDefined();
  });
});
