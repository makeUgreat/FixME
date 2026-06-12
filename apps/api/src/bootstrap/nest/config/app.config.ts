import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';

const APP_ENVIRONMENTS = [
  'local',
  'development',
  'test',
  'production',
] as const;

const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;

export const appEnvSchema = z.looseObject({
  APP_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(APP_ENVIRONMENTS).default('local'),
  ),
  NODE_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(NODE_ENVIRONMENTS).default('development'),
  ),
  PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(1).max(65_535).default(3000),
  ),
});
