import {
  type DynamicModule,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import { CorrectionCommandsModule } from './commands/commands.module';

@Module({})
export class CorrectionsApplicationModule {
  static register(imports: ModuleMetadata['imports'] = []): DynamicModule {
    const commandsModule = CorrectionCommandsModule.register(imports);

    return {
      module: CorrectionsApplicationModule,
      imports: [commandsModule],
      exports: [commandsModule],
    };
  }
}
