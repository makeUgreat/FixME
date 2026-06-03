import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@libs/database';
import { CORRECTION_REPOSITORY } from '../corrections.tokens';
import { type CorrectionRepository } from '../domain';
import { MemoryCorrectionRepository } from './persistence/memory/correction.repository';
import { CorrectionPersistenceMapper } from './persistence/postgres-drizzle/correction-persistence.mapper';
import { PostgresDrizzleCorrectionRepository } from './persistence/postgres-drizzle/correction.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    CorrectionPersistenceMapper,
    MemoryCorrectionRepository,
    PostgresDrizzleCorrectionRepository,
    {
      provide: CORRECTION_REPOSITORY,
      inject: [
        ConfigService,
        MemoryCorrectionRepository,
        PostgresDrizzleCorrectionRepository,
      ],
      useFactory: (
        configService: ConfigService,
        memoryRepository: MemoryCorrectionRepository,
        postgresDrizzleRepository: PostgresDrizzleCorrectionRepository,
      ): CorrectionRepository =>
        configService.get<string>('CORRECTION_PERSISTENCE') ===
        'postgres-drizzle'
          ? postgresDrizzleRepository
          : memoryRepository,
    },
  ],
  exports: [CORRECTION_REPOSITORY],
})
export class CorrectionsInfrastructureModule {}
