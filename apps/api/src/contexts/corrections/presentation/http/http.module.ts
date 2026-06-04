import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CreateCorrectionHttpErrorMapper } from './create-correction/error.mapper';
import { CorrectionsHttpController } from './corrections.controller';

@Module({})
export class CorrectionHttpModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionHttpModule,
      imports,
      controllers: [CorrectionsHttpController],
      providers: [CreateCorrectionHttpErrorMapper],
    };
  }
}
