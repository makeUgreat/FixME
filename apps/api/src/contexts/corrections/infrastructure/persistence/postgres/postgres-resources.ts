import { type PostgresContextResources } from '@layer-kernels/infrastructure';

export const correctionsPostgresContext = {
  contextName: 'corrections',
  databaseName: 'fixme_corrections',
  schemaName: 'public',
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
} as const satisfies PostgresContextResources;
