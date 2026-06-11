import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { formatRuntimeConfigLog } from './config/runtime-config-log';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { HttpValidationErrorMapper } from './pipes/http-validation-error.mapper';

export async function startNestApp() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const validationErrorMapper = new HttpValidationErrorMapper();
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => validationErrorMapper.toException(errors),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);

  Logger.log(
    formatRuntimeConfigLog({
      appEnv: configService.getOrThrow<string>('APP_ENV'),
      nodeEnv: configService.getOrThrow<string>('NODE_ENV'),
      correctionPersistence: configService.getOrThrow<string>(
        'CORRECTION_PERSISTENCE',
      ),
      port,
      serverUrl: await app.getUrl(),
    }),
    'RuntimeConfig',
  );
}
