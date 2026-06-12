import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { bootstrapPostgres } from '../../db/postgres/bootstrap/bootstrap-postgres';
import { migratePostgres } from '../../db/postgres/migrations/migrate-postgres';
import { correctionsPostgresContext } from '../../src/contexts/corrections/infrastructure/persistence/postgres/postgres-resources';

const execFileAsync = promisify(execFile);

const POSTGRES_HEALTH_TIMEOUT_MS = 30_000;
const POSTGRES_HEALTH_INTERVAL_MS = 250;
const TEST_DATABASE_LOG_PREFIX = '[test-db]';
const POSTGRES_COMPOSE_ENVIRONMENT = {
  DB_DATABASE: 'fixme_test',
  DB_USERNAME: 'fixme',
  DB_PASSWORD: 'fixme',
} as const;
const CORRECTIONS_APP_DATABASE_ROLE = {
  username: correctionsPostgresContext.roles.app,
  password: correctionsPostgresContext.roles.app,
} as const;
const CORRECTIONS_WORKER_DATABASE_ROLE = {
  username: correctionsPostgresContext.roles.worker,
  password: correctionsPostgresContext.roles.worker,
} as const;
const CORRECTIONS_MIGRATOR_DATABASE_ROLE = {
  username: correctionsPostgresContext.roles.migrator,
  password: correctionsPostgresContext.roles.migrator,
} as const;

const appRootDirectory = resolve(__dirname, '../..');
const composeFilePath = resolve(__dirname, 'docker-compose.test-db.yml');
const composeProjectName = `fixme-api-test-${process.pid}-${Date.now()}`;

let startedComposeEnvironment: NodeJS.ProcessEnv | undefined;

interface GlobalSetupProject {
  provide(
    key:
      | 'postgresAdminConnectionUri'
      | 'correctionsAppConnectionUri'
      | 'correctionsWorkerConnectionUri'
      | 'correctionsMigratorConnectionUri',
    value: string,
  ): void;
}

export async function setup(project: GlobalSetupProject): Promise<void> {
  logTestDatabaseInfo('Starting Postgres test database setup');

  const composeEnvironment = createComposeEnvironment();

  try {
    await runTestDatabaseStep(
      'setup',
      'Clean previous Compose environment',
      async () => {
        await stopPostgresContainer(composeEnvironment).catch(() => undefined);
      },
    );
    await runTestDatabaseStep('setup', 'Start Postgres container', async () => {
      await startPostgresContainer(composeEnvironment);
    });
    startedComposeEnvironment = composeEnvironment;

    const containerId = await runTestDatabaseStep(
      'setup',
      'Read Postgres container id',
      async () => await getPostgresContainerId(composeEnvironment),
    );
    logTestDatabaseInfo(`Postgres container id: ${containerId.slice(0, 12)}`);

    const hostPort = await runTestDatabaseStep(
      'setup',
      'Read mapped Postgres port',
      async () => await getPostgresHostPort(composeEnvironment),
    );
    const adminDatabaseUrl = createConnectionUri(
      hostPort,
      POSTGRES_COMPOSE_ENVIRONMENT.DB_USERNAME,
      POSTGRES_COMPOSE_ENVIRONMENT.DB_PASSWORD,
    );
    const correctionsAppDatabaseUrl = createConnectionUri(
      hostPort,
      CORRECTIONS_APP_DATABASE_ROLE.username,
      CORRECTIONS_APP_DATABASE_ROLE.password,
    );
    const correctionsWorkerDatabaseUrl = createConnectionUri(
      hostPort,
      CORRECTIONS_WORKER_DATABASE_ROLE.username,
      CORRECTIONS_WORKER_DATABASE_ROLE.password,
    );
    const correctionsMigratorDatabaseUrl = createConnectionUri(
      hostPort,
      CORRECTIONS_MIGRATOR_DATABASE_ROLE.username,
      CORRECTIONS_MIGRATOR_DATABASE_ROLE.password,
    );
    logTestDatabaseInfo(
      `Using 127.0.0.1:${hostPort}/${POSTGRES_COMPOSE_ENVIRONMENT.DB_DATABASE} for integration tests`,
    );

    await runTestDatabaseStep(
      'setup',
      'Wait for Postgres healthcheck',
      async () => {
        await waitForHealthyContainer(containerId, composeEnvironment);
      },
    );
    await runTestDatabaseStep(
      'setup',
      'Apply admin role bootstrap',
      async () => {
        await applyAdminBootstrap(adminDatabaseUrl);
      },
    );
    await runTestDatabaseStep(
      'setup',
      'Apply Postgres migrations',
      async () => {
        await migratePostgres({ databaseUrl: correctionsMigratorDatabaseUrl });
      },
    );

    project.provide('postgresAdminConnectionUri', adminDatabaseUrl);
    project.provide('correctionsAppConnectionUri', correctionsAppDatabaseUrl);
    project.provide(
      'correctionsWorkerConnectionUri',
      correctionsWorkerDatabaseUrl,
    );
    project.provide(
      'correctionsMigratorConnectionUri',
      correctionsMigratorDatabaseUrl,
    );

    logTestDatabaseInfo('Postgres test database is ready');
  } catch (error) {
    logTestDatabaseError('Setup failed; stopping Postgres test database');
    await stopPostgresContainer(composeEnvironment).catch(() => undefined);
    throw error;
  }
}

export async function teardown(): Promise<void> {
  const composeEnvironment = startedComposeEnvironment;

  if (!composeEnvironment) {
    return;
  }

  try {
    await runTestDatabaseStep(
      'teardown',
      'Stop Postgres container',
      async () => {
        await stopPostgresContainer(composeEnvironment);
      },
    );
  } catch (error) {
    process.stderr.write(`Failed to stop test Postgres container: ${error}\n`);
  } finally {
    startedComposeEnvironment = undefined;
  }
}

async function startPostgresContainer(
  composeEnvironment: NodeJS.ProcessEnv,
): Promise<void> {
  await execDockerCompose(
    [
      '--project-name',
      composeProjectName,
      '--file',
      composeFilePath,
      'up',
      '--detach',
    ],
    composeEnvironment,
  );
}

async function stopPostgresContainer(
  composeEnvironment: NodeJS.ProcessEnv,
): Promise<void> {
  await execDockerCompose(
    [
      '--project-name',
      composeProjectName,
      '--file',
      composeFilePath,
      'down',
      '--volumes',
      '--remove-orphans',
    ],
    composeEnvironment,
  );
}

async function getPostgresContainerId(
  composeEnvironment: NodeJS.ProcessEnv,
): Promise<string> {
  const { stdout } = await execDockerCompose(
    [
      '--project-name',
      composeProjectName,
      '--file',
      composeFilePath,
      'ps',
      '--quiet',
      'db',
    ],
    composeEnvironment,
  );
  const containerId = stdout.trim();

  if (!containerId) {
    throw new Error('Could not read test Postgres container id');
  }

  return containerId;
}

async function getPostgresHostPort(
  composeEnvironment: NodeJS.ProcessEnv,
): Promise<number> {
  const { stdout } = await execDockerCompose(
    [
      '--project-name',
      composeProjectName,
      '--file',
      composeFilePath,
      'port',
      'db',
      '5432',
    ],
    composeEnvironment,
  );
  const portMatch = stdout.trim().match(/:(\d+)$/);

  if (!portMatch) {
    throw new Error(`Could not read mapped Postgres test port: ${stdout}`);
  }

  return Number(portMatch[1]);
}

async function waitForHealthyContainer(
  containerId: string,
  composeEnvironment: NodeJS.ProcessEnv,
): Promise<void> {
  const startedAt = Date.now();
  let lastStatus = 'unknown';

  while (Date.now() - startedAt < POSTGRES_HEALTH_TIMEOUT_MS) {
    try {
      const { stdout } = await execDocker(
        ['inspect', '--format={{.State.Health.Status}}', containerId],
        composeEnvironment,
      );
      lastStatus = stdout.trim();

      if (lastStatus === 'healthy') {
        return;
      }
    } catch {
      lastStatus = 'unavailable';
    }

    await sleep(POSTGRES_HEALTH_INTERVAL_MS);
  }

  throw new Error(
    `Timed out waiting for Postgres test container healthcheck: ${lastStatus}`,
  );
}

function createComposeEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...POSTGRES_COMPOSE_ENVIRONMENT,
  };
}

function createConnectionUri(
  port: number,
  username: string,
  password: string,
): string {
  return `postgres://${username}:${password}@127.0.0.1:${port}/${POSTGRES_COMPOSE_ENVIRONMENT.DB_DATABASE}`;
}

async function applyAdminBootstrap(databaseUrl: string): Promise<void> {
  await bootstrapPostgres({
    adminDatabaseUrl: databaseUrl,
    rolePasswords: {
      [CORRECTIONS_APP_DATABASE_ROLE.username]:
        CORRECTIONS_APP_DATABASE_ROLE.password,
      [CORRECTIONS_WORKER_DATABASE_ROLE.username]:
        CORRECTIONS_WORKER_DATABASE_ROLE.password,
      [CORRECTIONS_MIGRATOR_DATABASE_ROLE.username]:
        CORRECTIONS_MIGRATOR_DATABASE_ROLE.password,
    },
  });
}

async function runTestDatabaseStep<T>(
  phase: 'setup' | 'teardown',
  label: string,
  action: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  const stepLabel = `${TEST_DATABASE_LOG_PREFIX} ${phase}: ${label}`;

  process.stdout.write(`${stepLabel}...\n`);

  try {
    const result = await action();

    process.stdout.write(
      `${stepLabel} OK (${formatDuration(Date.now() - startedAt)})\n`,
    );

    return result;
  } catch (error) {
    process.stderr.write(
      `${stepLabel} FAILED (${formatDuration(Date.now() - startedAt)})\n`,
    );
    throw error;
  }
}

function logTestDatabaseInfo(message: string): void {
  process.stdout.write(`${TEST_DATABASE_LOG_PREFIX} ${message}\n`);
}

function logTestDatabaseError(message: string): void {
  process.stderr.write(`${TEST_DATABASE_LOG_PREFIX} ${message}\n`);
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1_000) {
    return `${milliseconds}ms`;
  }

  return `${(milliseconds / 1_000).toFixed(1)}s`;
}

async function execDockerCompose(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<{ stdout: string }> {
  return await execDocker(['compose', ...args], env);
}

async function execDocker(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<{ stdout: string }> {
  return await execCommand('docker', args, env);
}

async function execCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<{ stdout: string }> {
  try {
    const { stdout } = await execFileAsync(command, args, {
      cwd: appRootDirectory,
      env,
    });

    return { stdout };
  } catch (error) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`, {
      cause: error,
    });
  }
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));
}
