import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CorrectionHttpModule } from './http/http.module';

@Module({})
export class CorrectionsPresentationModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionsPresentationModule,
      imports: [CorrectionHttpModule.register(imports)],
    };
  }
}
