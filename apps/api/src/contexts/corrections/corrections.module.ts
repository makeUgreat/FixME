import { Module } from '@nestjs/common';
import { CorrectionsApplicationModule } from './application/application.module';
import { CorrectionsInfrastructureModule } from './infrastructure/infrastructure.module';
import { CorrectionsPresentationModule } from './presentation/presentation.module';

const correctionsApplicationModule = CorrectionsApplicationModule.register([
  CorrectionsInfrastructureModule.register(),
]);
const correctionsPresentationModule = CorrectionsPresentationModule.register([
  correctionsApplicationModule,
]);

@Module({
  imports: [correctionsApplicationModule, correctionsPresentationModule],
  exports: [correctionsApplicationModule],
})
export class CorrectionsModule {}
