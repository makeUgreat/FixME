import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContextsModule } from '@contexts/contexts.module';
import { parseApiEnv } from './config/app.config';
import { StartupDependencyCheckService } from './startup-check/startup-dependency-check.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: parseApiEnv }),
    ContextsModule,
  ],
  providers: [StartupDependencyCheckService],
})
export class AppModule {}
