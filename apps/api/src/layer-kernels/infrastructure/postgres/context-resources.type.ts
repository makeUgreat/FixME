export interface PostgresContextResources {
  readonly contextName: string;
  readonly schemaName: string;
  readonly tableNames: Readonly<Record<string, string>>;
  readonly roles: PostgresContextRoles;
  readonly runtimeDatabaseUrlEnvKey: string;
  readonly migratorDatabaseUrlEnvKey: string;
}

export interface PostgresContextRoles {
  readonly readOnly: string;
  readonly readWrite: string;
  readonly ddl: string;
  readonly app: string;
  readonly worker: string;
  readonly migrator: string;
}
