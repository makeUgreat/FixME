import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CorrectionsModule } from './modules/corrections/corrections.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CorrectionsModule,
  ],
})
export class AppModule {}
