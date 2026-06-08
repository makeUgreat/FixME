import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import {
  CORRECTION_REPOSITORY,
  type CorrectionRepository,
} from '../../ports';
import { CreateCorrectionCommandHandler } from './create-correction.command-handler';

@Module({})
export class CreateCorrectionCommandModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CreateCorrectionCommandModule,
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
      ],
      exports: [CreateCorrectionCommandHandler],
    };
  }
}
