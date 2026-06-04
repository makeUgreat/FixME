import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CreateCorrectionCommandModule } from './create-correction/command.module';

@Module({})
export class CorrectionCommandsModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionCommandsModule,
      imports: [CreateCorrectionCommandModule.register(imports)],
    };
  }
}
