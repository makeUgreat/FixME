import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CorrectionMemoryPersistenceModule } from './memory/adapter.module';
import { CorrectionPostgresDrizzlePersistenceModule } from './postgres-drizzle/adapter.module';

@Module({})
export class CorrectionPersistenceModule {
  static register(
    persistence = process.env.CORRECTION_PERSISTENCE,
  ): DynamicModule {
    const persistenceAdapterModule: NonNullable<
      ModuleMetadata['imports']
    >[number] =
      persistence === 'postgres-drizzle'
        ? CorrectionPostgresDrizzlePersistenceModule
        : CorrectionMemoryPersistenceModule;

    return {
      module: CorrectionPersistenceModule,
      imports: [persistenceAdapterModule],
      exports: [persistenceAdapterModule],
    };
  }
}
