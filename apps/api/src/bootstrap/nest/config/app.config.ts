import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';
import { correctionsEnvSchema } from '@contexts/corrections/infrastructure/config/corrections.config';

const DEFAULT_APP_PORT = 3000;

const apiEnvSchema = z.looseObject({
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
