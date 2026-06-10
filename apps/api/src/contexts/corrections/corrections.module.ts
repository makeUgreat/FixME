import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { InMemoryCommandBus } from '@layer-kernels/application';
import {
  CORRECTIONS_COMMAND_BUS,
  type CorrectionsCommandBus,
} from './application/command-bus.token';
import { CreateCorrectionCommand } from './application/commands/create-correction/create-correction.command';
import { CreateCorrectionCommandHandler } from './application/commands/create-correction/create-correction.command-handler';
import {
  CORRECTION_REPOSITORY,
  type CorrectionRepository,
} from './application/ports';
import { CorrectionsInfrastructureModule } from './infrastructure/infrastructure.module';
import { CorrectionsPresentationModule } from './presentation/presentation.module';

@Module({})
class CorrectionsApplicationWiringModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionsApplicationWiringModule,
      imports,
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
      exports: [CORRECTIONS_COMMAND_BUS],
    };
  }
}

const correctionsInfrastructureModule = CorrectionsInfrastructureModule.register();
const correctionsApplicationWiringModule =
  CorrectionsApplicationWiringModule.register([
    correctionsInfrastructureModule,
  ]);
const correctionsPresentationModule = CorrectionsPresentationModule.register([
  correctionsApplicationWiringModule,
]);

@Module({
  imports: [
    correctionsInfrastructureModule,
    correctionsApplicationWiringModule,
    correctionsPresentationModule,
  ],
  exports: [correctionsApplicationWiringModule],
})
export class CorrectionsModule {}
