import { Module } from '@nestjs/common';
import { CorrectionsApplicationModule } from './application/corrections.application.module';
import { CorrectionsInfrastructureModule } from './infrastructure/corrections.infrastructure.module';
import { CorrectionsPresentationModule } from './presentation/corrections.presentation.module';

const correctionsApplicationModule = CorrectionsApplicationModule.register([
  CorrectionsInfrastructureModule,
]);

@Module({
  imports: [correctionsApplicationModule, CorrectionsPresentationModule],
  exports: [correctionsApplicationModule],
})
export class CorrectionsModule {}
