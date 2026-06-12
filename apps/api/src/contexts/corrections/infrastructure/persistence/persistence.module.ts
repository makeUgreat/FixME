import { type DynamicModule, Module } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';
import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';
import { CorrectionMemoryPersistenceModule } from './memory/adapter.module';
import { CorrectionPostgresDrizzlePersistenceModule } from './postgres/drizzle/adapter.module';

const correctionPersistenceEnvSchema = z.object({
  CORRECTION_PERSISTENCE: z.preprocess(
    emptyStringToUndefined,
    z.enum(['memory', 'postgres-drizzle']).default('postgres-drizzle'),
  ),
});

@Module({})
export class CorrectionPersistenceModule {
  static async register(): Promise<DynamicModule> {
    const memoryPersistenceModule = await ConditionalModule.registerWhen(
      CorrectionMemoryPersistenceModule,
      (env) =>
        correctionPersistenceEnvSchema.parse(env).CORRECTION_PERSISTENCE ===
        'memory',
      { debug: false },
    );
    const postgresPersistenceModule = await ConditionalModule.registerWhen(
      CorrectionPostgresDrizzlePersistenceModule.register(),
      (env) =>
        correctionPersistenceEnvSchema.parse(env).CORRECTION_PERSISTENCE ===
        'postgres-drizzle',
      { debug: false },
    );

    return {
      module: CorrectionPersistenceModule,
      imports: [memoryPersistenceModule, postgresPersistenceModule],
      exports: [memoryPersistenceModule, postgresPersistenceModule],
    };
  }
}
