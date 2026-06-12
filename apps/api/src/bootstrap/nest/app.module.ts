import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContextsModule } from '@contexts/contexts.module';
import { appEnvSchema } from './config/app.config';
import { StartupDependencyCheckService } from './startup-check/startup-dependency-check.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => appEnvSchema.parse(env),
    }),
    ContextsModule,
  ],
  providers: [StartupDependencyCheckService],
})
export class AppModule {}
