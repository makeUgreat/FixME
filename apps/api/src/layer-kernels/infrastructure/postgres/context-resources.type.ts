export interface PostgresContextResources {
  readonly contextName: string;
  readonly databaseName: string;
  readonly schemaName: string;
  readonly tableNames: Readonly<Record<string, string>>;
  readonly roles: PostgresContextRoles;
}

export interface PostgresContextRoles {
  readonly readOnly: string;
  readonly readWrite: string;
  readonly ddl: string;
  readonly app: string;
  readonly worker: string;
  readonly migrator: string;
}
