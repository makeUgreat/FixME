import { Module } from '@nestjs/common';
import { CorrectionsApplicationModule } from './application/application.module';
import { CorrectionsInfrastructureModule } from './infrastructure/infrastructure.module';
import { CorrectionsPresentationModule } from './presentation/presentation.module';

const correctionsApplicationModule = CorrectionsApplicationModule.register([
  CorrectionsInfrastructureModule.register(),
]);

@Module({
  imports: [correctionsApplicationModule, CorrectionsPresentationModule],
  exports: [correctionsApplicationModule],
})
export class CorrectionsModule {}
