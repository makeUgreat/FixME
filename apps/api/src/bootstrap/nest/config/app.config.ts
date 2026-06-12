import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';
import { correctionsEnvSchema } from '@contexts/corrections/infrastructure/config/corrections.config';

const DEFAULT_APP_PORT = 3000;

export const APP_ENVIRONMENTS = [
  'local',
  'development',
  'test',
  'production',
] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export const DEFAULT_APP_ENV: AppEnvironment = 'local';

export const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export const DEFAULT_NODE_ENV: NodeEnvironment = 'development';

const apiEnvSchema = z.looseObject({
  APP_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(APP_ENVIRONMENTS).default(DEFAULT_APP_ENV),
  ),
  NODE_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(NODE_ENVIRONMENTS).default(DEFAULT_NODE_ENV),
  ),
  PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(1).max(65_535).default(DEFAULT_APP_PORT),
  ),
  ...correctionsEnvSchema.shape,
});

type ApiEnv = z.infer<typeof apiEnvSchema>;

export function parseApiEnv(env: NodeJS.ProcessEnv): ApiEnv {
  const parsed = apiEnvSchema.safeParse(env);

  if (parsed.success) {
    return parsed.data;
  }

  throw new Error(formatApiEnvError(parsed.error));
}

function formatApiEnvError(error: z.ZodError): string {
  const issues = error.issues
    .map(({ path, message }) => {
      const name = path.length === 0 ? '<root>' : path.map(String).join('.');

      return `${name}: ${message}`;
    })
    .join('; ');

  return `Invalid api environment configuration: ${issues}`;
}
