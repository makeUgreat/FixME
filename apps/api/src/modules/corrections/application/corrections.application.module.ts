import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCorrectionCommandHandler } from './commands/create-correction.command-handler';
import {
  CreateCorrectionDomainErrorToApplicationErrorMapper,
  CreateCorrectionRepositoryErrorToApplicationErrorMapper,
} from './commands/create-correction-error.mapper';

// todo: register 왜 쓰는지 정리, 모듈 구조 정리
@Module({})
export class CorrectionsApplicationModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionsApplicationModule,
      imports: [CqrsModule, ...(imports ?? [])],
      providers: [
        CreateCorrectionCommandHandler,
        CreateCorrectionDomainErrorToApplicationErrorMapper,
        CreateCorrectionRepositoryErrorToApplicationErrorMapper,
      ],
      exports: [CqrsModule],
    };
  }
}
