import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCorrectionCommandHandler } from './application/commands/create-correction.command-handler';
import { CORRECTION_REPOSITORY } from './corrections.tokens';
import { MemoryCorrectionRepository } from './infrastructure/correction.repository.memory';

const commandHandlers = [CreateCorrectionCommandHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...commandHandlers,
    {
      provide: CORRECTION_REPOSITORY,
      useClass: MemoryCorrectionRepository,
    },
  ],
  exports: [CqrsModule],
})
export class CorrectionsModule {}
