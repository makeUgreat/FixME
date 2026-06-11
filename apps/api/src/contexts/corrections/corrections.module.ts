import { Module } from '@nestjs/common';
import { InMemoryCommandBus } from '@layer-kernels/application';
import {
  CORRECTION_REPOSITORY,
  type CorrectionRepository,
} from '@contexts/corrections/application/ports';
import {
  CORRECTIONS_COMMAND_BUS,
  type CorrectionsCommandBus,
} from '@contexts/corrections/application/command-bus.token';
import { CreateCorrectionCommand } from '@contexts/corrections/application/commands/create-correction/create-correction.command';
import { CreateCorrectionCommandHandler } from '@contexts/corrections/application/commands/create-correction/create-correction.command-handler';
import { CorrectionsInfrastructureModule } from '@contexts/corrections/infrastructure/infrastructure.module';
import { CorrectionsPresentationModule } from '@contexts/corrections/presentation/presentation.module';

@Module({
  imports: [CorrectionsInfrastructureModule],
  providers: [
    {
      provide: CreateCorrectionCommandHandler,
      inject: [CORRECTION_REPOSITORY],
      useFactory: (
        correctionRepository: CorrectionRepository,
      ): CreateCorrectionCommandHandler =>
        new CreateCorrectionCommandHandler(correctionRepository),
    },
    {
      provide: CORRECTIONS_COMMAND_BUS,
      inject: [CreateCorrectionCommandHandler],
      useFactory: (
        createCorrectionHandler: CreateCorrectionCommandHandler,
      ): CorrectionsCommandBus =>
        new InMemoryCommandBus([
          [CreateCorrectionCommand, createCorrectionHandler],
        ]),
    },
  ],
  exports: [CORRECTIONS_COMMAND_BUS, CorrectionsInfrastructureModule],
})
class CorrectionsApplicationWiringModule {}

@Module({
  imports: [
    CorrectionsApplicationWiringModule,
    CorrectionsPresentationModule.register([
      CorrectionsApplicationWiringModule,
    ]),
  ],
  exports: [CorrectionsApplicationWiringModule],
})
export class CorrectionsModule {}
