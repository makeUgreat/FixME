import { Module } from '@nestjs/common';
import { CORRECTION_REPOSITORY } from '../corrections.tokens';
import { MemoryCorrectionRepository } from './correction.repository.memory';

@Module({
  providers: [
    {
      provide: CORRECTION_REPOSITORY,
      useClass: MemoryCorrectionRepository,
    },
  ],
  exports: [CORRECTION_REPOSITORY],
})
export class CorrectionsInfrastructureModule {}
