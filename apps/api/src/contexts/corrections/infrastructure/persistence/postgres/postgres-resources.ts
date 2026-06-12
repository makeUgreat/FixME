import { type PostgresContextResources } from '@layer-kernels/infrastructure';

export const correctionsPostgresContext = {
  contextName: 'corrections',
  schemaName: 'corrections',
  tableNames: {
    corrections: 'corrections',
  },
  roles: {
    readOnly: 'fixme_corrections_ro',
    readWrite: 'fixme_corrections_rw',
    ddl: 'fixme_corrections_ddl',
    app: 'fixme_corrections_app',
    worker: 'fixme_corrections_worker',
    migrator: 'fixme_corrections_migrator',
  },
  runtimeDatabaseUrlEnvKey: 'CORRECTIONS_DATABASE_URL',
  migratorDatabaseUrlEnvKey: 'CORRECTIONS_MIGRATOR_DATABASE_URL',
} as const satisfies PostgresContextResources;
