import 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    postgresAdminConnectionUri: string;
    correctionsAppConnectionUri: string;
    correctionsWorkerConnectionUri: string;
    correctionsMigratorConnectionUri: string;
  }
}
