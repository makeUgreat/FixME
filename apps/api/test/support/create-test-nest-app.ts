import { Type, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { HttpExceptionFilter } from '../../src/bootstrap/nest/filters/http-exception.filter';
import { HttpValidationErrorMapper } from '../../src/bootstrap/nest/pipes/http-validation-error.mapper';

export async function createTestNestApp(
  rootModule: Type<unknown>,
): Promise<NestFastifyApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [rootModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  const validationErrorMapper = new HttpValidationErrorMapper();
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
      exceptionFactory: (exceptions) =>
        validationErrorMapper.toException(exceptions),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  return app;
}
