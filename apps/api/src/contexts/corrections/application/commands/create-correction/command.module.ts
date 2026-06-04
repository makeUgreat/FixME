import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  CreateCorrectionDomainErrorToApplicationErrorMapper,
  CreateCorrectionRepositoryErrorToApplicationErrorMapper,
} from './create-correction-error.mapper';
import { CreateCorrectionCommandHandler } from './create-correction.command-handler';

@Module({})
export class CreateCorrectionCommandModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CreateCorrectionCommandModule,
      imports: [CqrsModule, ...(imports ?? [])],
      providers: [
        CreateCorrectionCommandHandler,
        CreateCorrectionDomainErrorToApplicationErrorMapper,
        CreateCorrectionRepositoryErrorToApplicationErrorMapper,
      ],
    };
  }
}
