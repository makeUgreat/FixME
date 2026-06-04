import { Module } from '@nestjs/common';
import { CORRECTION_REPOSITORY } from '../../../application/ports';
import { CorrectionMemoryRepository } from './correction.repository';

@Module({
  providers: [
    CorrectionMemoryRepository,
    {
      provide: CORRECTION_REPOSITORY,
      useExisting: CorrectionMemoryRepository,
    },
  ],
  exports: [CORRECTION_REPOSITORY],
})
export class CorrectionMemoryPersistenceModule {}
