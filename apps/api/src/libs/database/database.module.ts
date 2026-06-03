import { Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_POOL, DRIZZLE_DATABASE } from './database.tokens';
import { type DrizzleDatabase } from './database.type';

class DatabasePoolShutdown implements OnApplicationShutdown {
  constructor(private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool =>
        new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        }),
    },
    {
      provide: DRIZZLE_DATABASE,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool): DrizzleDatabase => drizzle({ client: pool }),
    },
    {
      provide: DatabasePoolShutdown,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool): DatabasePoolShutdown =>
        new DatabasePoolShutdown(pool),
    },
  ],
  exports: [DRIZZLE_DATABASE],
})
export class DatabaseModule {}
