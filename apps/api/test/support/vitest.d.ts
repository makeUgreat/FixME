import 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    postgresConnectionUri: string;
  }
}
