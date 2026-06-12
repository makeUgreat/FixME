import { type DynamicModule, Module } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';
import { resolveCorrectionPersistence } from '../config/corrections.config';
import { CorrectionMemoryPersistenceModule } from './memory/adapter.module';
import { CorrectionPostgresDrizzlePersistenceModule } from './postgres/drizzle/adapter.module';

@Module({})
export class CorrectionPersistenceModule {
  static async register(): Promise<DynamicModule> {
    const memoryPersistenceModule = await ConditionalModule.registerWhen(
      CorrectionMemoryPersistenceModule,
      (env) => resolveCorrectionPersistence(env) === 'memory',
      { debug: false },
    );
    const postgresPersistenceModule = await ConditionalModule.registerWhen(
      CorrectionPostgresDrizzlePersistenceModule.register(),
      (env) => resolveCorrectionPersistence(env) === 'postgres-drizzle',
      { debug: false },
    );

    return {
      module: CorrectionPersistenceModule,
      imports: [memoryPersistenceModule, postgresPersistenceModule],
      exports: [memoryPersistenceModule, postgresPersistenceModule],
    };
  }
}
