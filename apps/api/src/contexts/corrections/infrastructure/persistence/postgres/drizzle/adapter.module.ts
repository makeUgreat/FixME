import {
  type DynamicModule,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';
import { CORRECTION_REPOSITORY } from '@contexts/corrections/application/ports';
import { CORRECTION_PERSISTENCE_HEALTH_CHECK } from '../../ports';
import { correctionsPostgresContext } from '../postgres-resources';
import { CorrectionPersistenceMapper } from './correction-persistence.mapper';
import { CorrectionPostgresDrizzleRepository } from './correction.repository';
import { CorrectionPostgresDrizzlePersistenceHealthCheck } from './health-check.service';
import { POSTGRES_DRIZZLE, POSTGRES_POOL } from './postgres.tokens';
import { type PostgresDrizzle } from './postgres.type';

const postgresEnvSchema = z.object({
  POSTGRES_HOST: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).default('127.0.0.1'),
  ),
  POSTGRES_PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(1).max(65_535).default(5432),
  ),
});

class PostgresPoolShutdown implements OnApplicationShutdown {
  constructor(private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Module({})
export class CorrectionPostgresDrizzlePersistenceModule {
  static register(): DynamicModule {
    return {
      module: CorrectionPostgresDrizzlePersistenceModule,
      providers: [
        {
          provide: POSTGRES_POOL,
          inject: [ConfigService],
          useFactory: (configService: ConfigService): Pool => {
            const env = postgresEnvSchema.parse({
              POSTGRES_HOST: configService.get<string>('POSTGRES_HOST'),
              POSTGRES_PORT: configService.get<string>('POSTGRES_PORT'),
            });
            const appRole = correctionsPostgresContext.roles.app;

            return new Pool({
              host: env.POSTGRES_HOST,
              port: env.POSTGRES_PORT,
              user: appRole,
              password: appRole,
              database: correctionsPostgresContext.databaseName,
            });
          },
        },
        {
          provide: POSTGRES_DRIZZLE,
          inject: [POSTGRES_POOL],
          useFactory: (pool: Pool): PostgresDrizzle =>
            drizzle({ client: pool }),
        },
        {
          provide: PostgresPoolShutdown,
          inject: [POSTGRES_POOL],
          useFactory: (pool: Pool): PostgresPoolShutdown =>
            new PostgresPoolShutdown(pool),
        },
        CorrectionPersistenceMapper,
        CorrectionPostgresDrizzleRepository,
        CorrectionPostgresDrizzlePersistenceHealthCheck,
        {
          provide: CORRECTION_REPOSITORY,
          useExisting: CorrectionPostgresDrizzleRepository,
        },
        {
          provide: CORRECTION_PERSISTENCE_HEALTH_CHECK,
          useExisting: CorrectionPostgresDrizzlePersistenceHealthCheck,
        },
      ],
      exports: [CORRECTION_REPOSITORY, CORRECTION_PERSISTENCE_HEALTH_CHECK],
    };
  }
}
