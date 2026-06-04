import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { InMemoryCommandBus } from '@layer-kernels/application';
import { CORRECTIONS_COMMAND_BUS } from '../command-bus.token';
import { CreateCorrectionCommandModule } from './create-correction/command.module';
import { CreateCorrectionCommand } from './create-correction/create-correction.command';
import { CreateCorrectionCommandHandler } from './create-correction/create-correction.command-handler';

@Module({})
export class CorrectionCommandsModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    const createCorrectionCommandModule =
      CreateCorrectionCommandModule.register(imports);

    return {
      module: CorrectionCommandsModule,
      imports: [createCorrectionCommandModule],
      providers: [
        {
          provide: CORRECTIONS_COMMAND_BUS,
          inject: [CreateCorrectionCommandHandler],
          useFactory: (
            createCorrectionHandler: CreateCorrectionCommandHandler,
          ): InMemoryCommandBus =>
            new InMemoryCommandBus([
              [CreateCorrectionCommand, createCorrectionHandler],
            ]),
        },
      ],
      exports: [CORRECTIONS_COMMAND_BUS],
    };
  }
}
