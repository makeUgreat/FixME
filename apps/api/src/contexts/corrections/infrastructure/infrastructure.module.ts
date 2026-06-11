import { Module } from '@nestjs/common';
import { CorrectionPersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [CorrectionPersistenceModule.register()],
  exports: [CorrectionPersistenceModule],
})
export class CorrectionsInfrastructureModule {}
