import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';

export const CORRECTIONS_POSTGRES_DRIZZLE_CONFIG = Symbol(
  'corrections_postgres_drizzle_config',
);

export interface CorrectionsPostgresDrizzleConfig {
  readonly databaseUrl: string;
}

export const CORRECTIONS_DATABASE_URL_ENV_KEY = 'CORRECTIONS_DATABASE_URL';

export const CORRECTIONS_POSTGRES_DRIZZLE_REQUIRED_ENV_KEYS = [
  CORRECTIONS_DATABASE_URL_ENV_KEY,
] as const;

type CorrectionsPostgresDrizzleRequiredEnvKey =
  (typeof CORRECTIONS_POSTGRES_DRIZZLE_REQUIRED_ENV_KEYS)[number];

export const correctionsPostgresDrizzleEnvSchema = z.object({
  [CORRECTIONS_DATABASE_URL_ENV_KEY]: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1),
  ),
});

export type CorrectionsPostgresDrizzleEnv = z.infer<
  typeof correctionsPostgresDrizzleEnvSchema
>;

export function createCorrectionsPostgresDrizzleConfig(
  env: Partial<Record<CorrectionsPostgresDrizzleRequiredEnvKey, string | undefined>>,
): CorrectionsPostgresDrizzleConfig {
  const parsed = correctionsPostgresDrizzleEnvSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(formatCorrectionsPostgresDrizzleEnvError(parsed.error));
  }

  return {
    databaseUrl: parsed.data[CORRECTIONS_DATABASE_URL_ENV_KEY],
  };
}

function formatCorrectionsPostgresDrizzleEnvError(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
    .join('; ');

  return `Invalid corrections postgres drizzle environment configuration: ${issues}`;
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) {
    return '<root>';
  }

  return path.map(String).join('.');
}
