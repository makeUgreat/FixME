import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import {
  CORRECTION_REPOSITORY,
  type CorrectionRepository,
} from '../../ports';
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
      imports,
      providers: [
        CreateCorrectionDomainErrorToApplicationErrorMapper,
        CreateCorrectionRepositoryErrorToApplicationErrorMapper,
        {
          provide: CreateCorrectionCommandHandler,
          inject: [
            CORRECTION_REPOSITORY,
            CreateCorrectionDomainErrorToApplicationErrorMapper,
            CreateCorrectionRepositoryErrorToApplicationErrorMapper,
          ],
          useFactory: (
            correctionRepository: CorrectionRepository,
            domainErrorMapper: CreateCorrectionDomainErrorToApplicationErrorMapper,
            repositoryErrorMapper: CreateCorrectionRepositoryErrorToApplicationErrorMapper,
          ): CreateCorrectionCommandHandler =>
            new CreateCorrectionCommandHandler(
              correctionRepository,
              domainErrorMapper,
              repositoryErrorMapper,
            ),
        },
      ],
      exports: [CreateCorrectionCommandHandler],
    };
  }
}
