import { Module } from '@nestjs/common';
import { CORRECTION_REPOSITORY } from '@contexts/corrections/application/ports';
import { CORRECTION_PERSISTENCE_HEALTH_CHECK } from '../ports';
import { CorrectionMemoryRepository } from './correction.repository';
import { CorrectionMemoryPersistenceHealthCheck } from './health-check.service';

@Module({
  providers: [
    CorrectionMemoryRepository,
    CorrectionMemoryPersistenceHealthCheck,
    {
      provide: CORRECTION_REPOSITORY,
      useExisting: CorrectionMemoryRepository,
    },
    {
      provide: CORRECTION_PERSISTENCE_HEALTH_CHECK,
      useExisting: CorrectionMemoryPersistenceHealthCheck,
    },
  ],
  exports: [CORRECTION_REPOSITORY, CORRECTION_PERSISTENCE_HEALTH_CHECK],
})
export class CorrectionMemoryPersistenceModule {}
