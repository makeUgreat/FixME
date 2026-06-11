import { Module } from '@nestjs/common';
import { CorrectionsModule } from './corrections/corrections.module';

@Module({
  imports: [CorrectionsModule],
  exports: [CorrectionsModule],
})
export class ContextsModule {}
