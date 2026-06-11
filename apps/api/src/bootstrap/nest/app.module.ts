import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CorrectionsModule } from '@contexts/corrections/corrections.module';
import { parseApiEnv } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: parseApiEnv }),
    CorrectionsModule,
  ],
})
export class AppModule {}
