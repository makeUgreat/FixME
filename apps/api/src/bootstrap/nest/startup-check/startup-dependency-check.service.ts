import { setTimeout as sleep } from 'node:timers/promises';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CORRECTION_PERSISTENCE_HEALTH_CHECK,
  type CorrectionPersistenceHealthCheck,
  type CorrectionPersistenceHealthCheckError,
} from '@contexts/corrections/infrastructure/persistence/ports';

const STARTUP_DEPENDENCY_CHECK_MAX_ATTEMPTS = 3;
const STARTUP_DEPENDENCY_CHECK_RETRY_DELAY_MS = 500;

@Injectable()
export class StartupDependencyCheckService {
  private readonly logger = new Logger(StartupDependencyCheckService.name);

  constructor(
    @Inject(CORRECTION_PERSISTENCE_HEALTH_CHECK)
    private readonly persistenceHealthCheck: CorrectionPersistenceHealthCheck,
  ) {}

  async check(): Promise<void> {
    let lastFailure: CorrectionPersistenceHealthCheckError | undefined;

    for (
      let attempt = 1;
      attempt <= STARTUP_DEPENDENCY_CHECK_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const result = await this.persistenceHealthCheck.check();

      if (result.isOk()) {
        this.logger.log(
          `Startup dependency check passed for ${this.persistenceHealthCheck.adapter} on attempt ${attempt}/${STARTUP_DEPENDENCY_CHECK_MAX_ATTEMPTS}`,
        );

        return;
      }

      lastFailure = result.error;
      this.logger.warn(
        `Startup dependency check failed for ${this.persistenceHealthCheck.adapter} on attempt ${attempt}/${STARTUP_DEPENDENCY_CHECK_MAX_ATTEMPTS}: ${lastFailure.code} (${lastFailure.kind}) ${lastFailure.message}`,
      );

      if (attempt < STARTUP_DEPENDENCY_CHECK_MAX_ATTEMPTS) {
        await sleep(STARTUP_DEPENDENCY_CHECK_RETRY_DELAY_MS);
      }
    }

    if (lastFailure === undefined) {
      throw new Error('Startup dependency check failed without failure detail');
    }

    throw new Error(
      `Startup dependency check failed for ${this.persistenceHealthCheck.adapter} after ${STARTUP_DEPENDENCY_CHECK_MAX_ATTEMPTS} attempts: ${lastFailure.code} (${lastFailure.kind}) ${lastFailure.message}`,
    );
  }
}
