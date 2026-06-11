import { type DynamicModule, Module } from '@nestjs/common';
import { CorrectionPersistenceModule } from './persistence/persistence.module';

@Module({})
export class CorrectionsInfrastructureModule {
  static async register(): Promise<DynamicModule> {
    const persistenceModule = await CorrectionPersistenceModule.register();

    return {
      module: CorrectionsInfrastructureModule,
      imports: [persistenceModule],
      exports: [persistenceModule],
    };
  }
}
