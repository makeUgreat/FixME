import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCorrectionHttpErrorMapper } from './create-correction/error.mapper';
import { CorrectionsHttpController } from './corrections.controller';

@Module({
  imports: [CqrsModule],
  controllers: [CorrectionsHttpController],
  providers: [CreateCorrectionHttpErrorMapper],
})
export class CorrectionHttpModule {}
