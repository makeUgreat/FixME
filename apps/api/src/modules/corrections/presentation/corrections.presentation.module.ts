import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CorrectionHttpErrorMapper } from './correction-http-error.mapper';
import { CorrectionsHttpController } from './corrections-http.controller';

@Module({
  imports: [CqrsModule],
  controllers: [CorrectionsHttpController],
  providers: [CorrectionHttpErrorMapper],
})
export class CorrectionsPresentationModule {}
