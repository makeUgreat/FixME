import {
  type DynamicModule,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CORRECTION_REPOSITORY } from '@contexts/corrections/application/ports';
import { CORRECTION_PERSISTENCE_HEALTH_CHECK } from '../../ports';
import {
  CORRECTIONS_DATABASE_URL_ENV_KEY,
  CORRECTIONS_POSTGRES_DRIZZLE_CONFIG,
  createCorrectionsPostgresDrizzleConfig,
  type CorrectionsPostgresDrizzleConfig,
} from './postgres-drizzle.config';
import { CorrectionPersistenceMapper } from './correction-persistence.mapper';
import { CorrectionPostgresDrizzleRepository } from './correction.repository';
import { CorrectionPostgresDrizzlePersistenceHealthCheck } from './health-check.service';
import { POSTGRES_DRIZZLE, POSTGRES_POOL } from './postgres.tokens';
import { type PostgresDrizzle } from './postgres.type';

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
          provide: CORRECTIONS_POSTGRES_DRIZZLE_CONFIG,
          inject: [ConfigService],
          useFactory: (
            configService: ConfigService,
          ): CorrectionsPostgresDrizzleConfig =>
            createCorrectionsPostgresDrizzleConfig({
              [CORRECTIONS_DATABASE_URL_ENV_KEY]: configService.get<string>(
                CORRECTIONS_DATABASE_URL_ENV_KEY,
              ),
            }),
        },
        {
          provide: POSTGRES_POOL,
          inject: [CORRECTIONS_POSTGRES_DRIZZLE_CONFIG],
          useFactory: (config: CorrectionsPostgresDrizzleConfig): Pool =>
            new Pool({
              connectionString: config.databaseUrl,
            }),
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
