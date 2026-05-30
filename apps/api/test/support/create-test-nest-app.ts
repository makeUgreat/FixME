import { Type } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

export async function createTestNestApp(
  rootModule: Type<unknown>,
): Promise<NestFastifyApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [rootModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();

  return app;
}
