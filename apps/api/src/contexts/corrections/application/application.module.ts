import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CorrectionCommandsModule } from './commands/commands.module';

@Module({})
export class CorrectionsApplicationModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    return {
      module: CorrectionsApplicationModule,
      imports: [CqrsModule, CorrectionCommandsModule.register(imports)],
      exports: [CqrsModule],
    };
  }
}
