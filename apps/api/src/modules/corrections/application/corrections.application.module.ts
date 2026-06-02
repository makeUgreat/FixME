import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCorrectionCommandHandler } from './commands/create-correction.command-handler';
import { CreateCorrectionDomainErrorToApplicationErrorMapper } from './commands/create-correction-error.mapper';

@Module({})
export class CorrectionsApplicationModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionsApplicationModule,
      imports: [CqrsModule, ...(imports ?? [])],
      providers: [
        CreateCorrectionCommandHandler,
        CreateCorrectionDomainErrorToApplicationErrorMapper,
      ],
      exports: [CqrsModule],
    };
  }
}
