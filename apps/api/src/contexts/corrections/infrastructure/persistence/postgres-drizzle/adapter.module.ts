import { Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CORRECTION_REPOSITORY } from '../../../application/ports';
import { CorrectionPersistenceMapper } from './correction-persistence.mapper';
import { CorrectionPostgresDrizzleRepository } from './correction.repository';
import { POSTGRES_DRIZZLE, POSTGRES_POOL } from './postgres.tokens';
import { type PostgresDrizzle } from './postgres.type';

class PostgresPoolShutdown implements OnApplicationShutdown {
  constructor(private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: POSTGRES_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool =>
        new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        }),
    },
    {
      provide: POSTGRES_DRIZZLE,
      inject: [POSTGRES_POOL],
      useFactory: (pool: Pool): PostgresDrizzle => drizzle({ client: pool }),
    },
    {
      provide: PostgresPoolShutdown,
      inject: [POSTGRES_POOL],
      useFactory: (pool: Pool): PostgresPoolShutdown =>
        new PostgresPoolShutdown(pool),
    },
    CorrectionPersistenceMapper,
    CorrectionPostgresDrizzleRepository,
    {
      provide: CORRECTION_REPOSITORY,
      useExisting: CorrectionPostgresDrizzleRepository,
    },
  ],
  exports: [CORRECTION_REPOSITORY],
})
export class CorrectionPostgresDrizzlePersistenceModule {}
