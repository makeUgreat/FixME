import { Module } from '@nestjs/common';
import { CorrectionHttpModule } from './http/http.module';

@Module({
  imports: [CorrectionHttpModule],
})
export class CorrectionsPresentationModule {}
