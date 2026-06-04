import { type DynamicModule, Module } from '@nestjs/common';
import { CorrectionPersistenceModule } from './persistence/persistence.module';

@Module({})
export class CorrectionsInfrastructureModule {
  static register(
    persistence = process.env.CORRECTION_PERSISTENCE,
  ): DynamicModule {
    const persistenceModule = CorrectionPersistenceModule.register(persistence);

    return {
      module: CorrectionsInfrastructureModule,
      imports: [persistenceModule],
      exports: [persistenceModule],
    };
  }
}
